const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time are required'],
    },
    description: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// Virtual for available seats (computed from registrations count)
eventSchema.virtual('registeredCount', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'event',
  count: true,
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Indexes for search and filter
eventSchema.index({ name: 'text', description: 'text', organizer: 'text', location: 'text', category: 'text', tags: 'text' });
eventSchema.index({ dateTime: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
