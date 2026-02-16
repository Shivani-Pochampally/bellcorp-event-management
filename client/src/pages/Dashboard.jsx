import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import './Dashboard.css';

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

export default function Dashboard() {
  const [data, setData] = useState({ registrations: [], upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/registrations/my')
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">My Dashboard</h1>
      <p className="dashboard-subtitle">Your event registrations and history</p>

      <section className="dashboard-section">
        <h2>Upcoming events</h2>
        {data.upcoming?.length === 0 ? (
          <p className="dashboard-empty">No upcoming events. <Link to="/">Browse events</Link></p>
        ) : (
          <ul className="dashboard-list">
            {data.upcoming?.map((r) => (
              <li key={r._id} className="dashboard-item">
                <Link to={`/events/${r.event?._id}`} className="dashboard-item-title">
                  {r.event?.name}
                </Link>
                <p className="dashboard-item-meta">
                  {formatDate(r.event?.dateTime)} &middot; {r.event?.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Past events</h2>
        {data.past?.length === 0 ? (
          <p className="dashboard-empty">No past events yet.</p>
        ) : (
          <ul className="dashboard-list">
            {data.past?.map((r) => (
              <li key={r._id} className="dashboard-item dashboard-item-past">
                <Link to={`/events/${r.event?._id}`} className="dashboard-item-title">
                  {r.event?.name}
                </Link>
                <p className="dashboard-item-meta">
                  {formatDate(r.event?.dateTime)} &middot; {r.event?.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2>All registrations</h2>
        <p className="dashboard-count">{data.registrations?.length ?? 0} total</p>
        {data.registrations?.length > 0 && (
          <ul className="dashboard-list">
            {data.registrations?.map((r) => (
              <li key={r._id} className="dashboard-item">
                <Link to={`/events/${r.event?._id}`}>{r.event?.name}</Link>
                <span className="dashboard-item-badge">
                  {new Date(r.event?.dateTime) >= new Date() ? 'Upcoming' : 'Past'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
