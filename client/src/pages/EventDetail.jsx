import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './EventDetail.css';

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api(`/events/${id}`)
      .then(setEvent)
      .catch((err) => setError(err.message || 'Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setActionLoading(true);
    try {
      await api(`/registrations/${id}`, { method: 'POST' });
      setEvent((prev) => (prev ? { ...prev, isRegistered: true, availableSeats: prev.availableSeats - 1, registeredCount: (prev.registeredCount || 0) + 1 } : null));
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api(`/registrations/${id}`, { method: 'DELETE' });
      setEvent((prev) => (prev ? { ...prev, isRegistered: false, availableSeats: prev.availableSeats + 1, registeredCount: Math.max(0, (prev.registeredCount || 1) - 1) } : null));
    } catch (err) {
      setError(err.message || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading event...</div>;
  if (error && !event) return <div className="event-detail-error">{error} <Link to="/">Back to events</Link></div>;
  if (!event) return null;

  const isPast = new Date(event.dateTime) < new Date();
  const canRegister = !isPast && event.availableSeats > 0 && !event.isRegistered && user;

  return (
    <div className="event-detail">
      <Link to="/" className="event-detail-back">&larr; Back to events</Link>
      <div className="event-detail-card">
        <div className="event-detail-header">
          <span className="event-detail-category">{event.category}</span>
          {event.tags?.length > 0 && (
            <div className="event-detail-tags">
              {event.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </div>
        <h1 className="event-detail-title">{event.name}</h1>
        <p className="event-detail-organizer">Organized by {event.organizer}</p>
        <div className="event-detail-meta">
          <p><strong>When:</strong> {formatDate(event.dateTime)}</p>
          <p><strong>Where:</strong> {event.location}</p>
          <p><strong>Seats:</strong> {event.availableSeats ?? event.capacity} available of {event.capacity}</p>
        </div>
        {event.description && (
          <div className="event-detail-description">
            <h3>About</h3>
            <p>{event.description}</p>
          </div>
        )}
        {error && <div className="event-detail-message error">{error}</div>}
        <div className="event-detail-actions">
          {event.isRegistered ? (
            <button
              type="button"
              className="btn btn-danger"
              disabled={actionLoading || isPast}
              onClick={handleCancel}
            >
              {actionLoading ? 'Cancelling...' : 'Cancel registration'}
            </button>
          ) : canRegister ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={actionLoading}
              onClick={handleRegister}
            >
              {actionLoading ? 'Registering...' : 'Register for this event'}
            </button>
          ) : !user ? (
            <Link to="/login" className="btn btn-primary btn-lg">Login to register</Link>
          ) : isPast ? (
            <span className="text-muted">This event has ended.</span>
          ) : event.availableSeats <= 0 ? (
            <span className="text-muted">Event is full.</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
