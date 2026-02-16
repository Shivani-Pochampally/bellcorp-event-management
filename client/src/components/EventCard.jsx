import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventCard({ event }) {
  const isPast = new Date(event.dateTime) < new Date();

  return (
    <article className={`event-card ${isPast ? 'event-card-past' : ''}`}>
      <div className="event-card-header">
        <span className="event-card-category">{event.category}</span>
        {event.isRegistered && (
          <span className="event-card-badge">Registered</span>
        )}
      </div>
      <h2 className="event-card-title">
        <Link to={`/events/${event._id}`}>{event.name}</Link>
      </h2>
      <p className="event-card-organizer">by {event.organizer}</p>
      <p className="event-card-meta">
        <span className="event-card-date">{formatDate(event.dateTime)}</span>
        <span className="event-card-location">{event.location}</span>
      </p>
      <div className="event-card-seats">
        {event.availableSeats !== undefined ? (
          <span>
            {event.availableSeats} seat{event.availableSeats !== 1 ? 's' : ''} left
          </span>
        ) : null}
      </div>
    </article>
  );
}
