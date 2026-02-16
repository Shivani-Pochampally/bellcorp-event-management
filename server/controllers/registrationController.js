const Registration = require('../models/Registration');
const Event = require('../models/Event');

exports.registerForEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.dateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot register for past events.' });
    }

    const existing = await Registration.findOne({ user: userId, event: eventId });
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this event.' });
    }

    const registeredCount = await Registration.countDocuments({ event: eventId });
    if (registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full. No seats available.' });
    }

    const registration = await Registration.create({ user: userId, event: eventId });
    await registration.populate('event');
    res.status(201).json({
      message: 'Successfully registered for the event.',
      registration: {
        _id: registration._id,
        event: registration.event,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed.' });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.eventId;

    const registration = await Registration.findOneAndDelete({
      user: userId,
      event: eventId,
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    res.json({ message: 'Registration cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Cancel failed.' });
  }
};

// User's registered events (for dashboard)
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const regs = await Registration.find({ user: userId })
      .populate('event')
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const upcoming = regs.filter((r) => r.event && r.event.dateTime >= now);
    const past = regs.filter((r) => r.event && r.event.dateTime < now);

    res.json({
      registrations: regs,
      upcoming,
      past,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch registrations.' });
  }
};
