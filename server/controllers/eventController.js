const Event = require('../models/Event');
const Registration = require('../models/Registration');
const mongoose = require('mongoose');

// Get all events with search, filters, pagination
exports.getEvents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const location = (req.query.location || '').trim();
    const category = (req.query.category || '').trim();
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    if (category) {
      filter.category = new RegExp(category, 'i');
    }
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = dateFrom;
      if (dateTo) filter.dateTime.$lte = dateTo;
    }

    // Only future events by default unless date filter is set
    if (!dateFrom && !dateTo) {
      filter.dateTime = { $gte: new Date() };
    }

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ dateTime: 1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);

    // Get registration counts and user's registration status if authenticated
    const eventIds = events.map((e) => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(regCounts.map((r) => [r._id.toString(), r.count]));

    let userRegSet = new Set();
    if (req.user) {
      const userRegs = await Registration.find({
        user: req.user._id,
        event: { $in: eventIds },
      }).lean();
      userRegSet = new Set(userRegs.map((r) => r.event.toString()));
    }

    const eventsWithMeta = events.map((e) => {
      const registered = countMap[e._id.toString()] || 0;
      return {
        ...e,
        registeredCount: registered,
        availableSeats: Math.max(0, e.capacity - registered),
        isRegistered: userRegSet.has(e._id.toString()),
      };
    });

    res.json({
      events: eventsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 96) {
      // No text index - fallback to regex search
      return getEventsFallback(req, res);
    }
    res.status(500).json({ message: error.message || 'Failed to fetch events.' });
  }
};

async function getEventsFallback(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const location = (req.query.location || '').trim();
    const category = (req.query.category || '').trim();
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { organizer: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
      ];
    }
    if (location) filter.location = new RegExp(location, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (dateFrom || dateTo) {
      filter.dateTime = {};
      if (dateFrom) filter.dateTime.$gte = dateFrom;
      if (dateTo) filter.dateTime.$lte = dateTo;
    }
    if (!dateFrom && !dateTo) filter.dateTime = { $gte: new Date() };

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ dateTime: 1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(filter),
    ]);

    const eventIds = events.map((e) => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(regCounts.map((r) => [r._id.toString(), r.count]));
    let userRegSet = new Set();
    if (req.user) {
      const userRegs = await Registration.find({
        user: req.user._id,
        event: { $in: eventIds },
      }).lean();
      userRegSet = new Set(userRegs.map((r) => r.event.toString()));
    }

    const eventsWithMeta = events.map((e) => {
      const registered = countMap[e._id.toString()] || 0;
      return {
        ...e,
        registeredCount: registered,
        availableSeats: Math.max(0, e.capacity - registered),
        isRegistered: userRegSet.has(e._id.toString()),
      };
    });

    res.json({
      events: eventsWithMeta,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch events.' });
  }
}

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    const registered = await Registration.countDocuments({ event: event._id });
    const availableSeats = Math.max(0, event.capacity - registered);
    let isRegistered = false;
    if (req.user) {
      const reg = await Registration.findOne({
        user: req.user._id,
        event: event._id,
      });
      isRegistered = !!reg;
    }
    res.json({
      ...event,
      registeredCount: registered,
      availableSeats,
      isRegistered,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.status(500).json({ message: error.message || 'Failed to fetch event.' });
  }
};

// Get distinct locations and categories for filters
exports.getFilterOptions = async (req, res) => {
  try {
    const [locations, categories] = await Promise.all([
      Event.distinct('location'),
      Event.distinct('category'),
    ]);
    res.json({ locations: locations.sort(), categories: categories.sort() });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch filter options.' });
  }
};
