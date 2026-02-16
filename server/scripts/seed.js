require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const events = [
  {
    name: 'Tech Summit 2025',
    organizer: 'Bellcorp Studio',
    location: 'San Francisco, CA',
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description: 'Annual technology conference with keynotes and workshops.',
    capacity: 500,
    category: 'Technology',
    tags: ['tech', 'conference', 'networking'],
  },
  {
    name: 'Design Workshop',
    organizer: 'Creative Labs',
    location: 'New York, NY',
    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    description: 'Hands-on UI/UX design workshop for beginners and pros.',
    capacity: 50,
    category: 'Design',
    tags: ['design', 'workshop', 'ui', 'ux'],
  },
  {
    name: 'Startup Pitch Night',
    organizer: 'Venture Hub',
    location: 'Austin, TX',
    dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    description: 'Pitch your startup to investors and get feedback.',
    capacity: 100,
    category: 'Business',
    tags: ['startup', 'pitch', 'investors'],
  },
  {
    name: 'DevOps Meetup',
    organizer: 'Cloud Native Community',
    location: 'Seattle, WA',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description: 'Monthly meetup on DevOps practices and tools.',
    capacity: 80,
    category: 'Technology',
    tags: ['devops', 'meetup', 'cloud'],
  },
  {
    name: 'Music Festival',
    organizer: 'Live Events Co',
    location: 'Los Angeles, CA',
    dateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    description: 'Weekend music festival with multiple stages.',
    capacity: 5000,
    category: 'Music',
    tags: ['music', 'festival', 'live'],
  },
  {
    name: 'Data Science Bootcamp',
    organizer: 'Data Academy',
    location: 'Boston, MA',
    dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description: 'Intensive 2-day bootcamp on ML and data pipelines.',
    capacity: 40,
    category: 'Technology',
    tags: ['data', 'ml', 'bootcamp'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Event.deleteMany({});
  await Event.insertMany(events);
  console.log('Seeded', events.length, 'events');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
