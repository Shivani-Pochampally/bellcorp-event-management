import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';
import './Home.css';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  }));

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      category: searchParams.get('category') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
    });
  }, [searchParams]);
  const [filterOptions, setFilterOptions] = useState({ locations: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const updateUrl = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v != null && v !== '') next.set(k, v);
        else next.delete(k);
      });
      if (next.get('page') === '1') next.delete('page');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    api('/events/filters')
      .then(setFilterOptions)
      .catch(() => setFilterOptions({ locations: [], categories: [] }));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '12');
    if (filters.search) params.set('search', filters.search);
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    api(`/events?${params}`)
      .then((data) => {
        setEvents(data.events);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message || 'Failed to load events'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    updateUrl({ ...next, page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateUrl({ page: newPage });
  };

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">Discover Events</h1>
        <p className="home-subtitle">
          Browse, search, and register for events. Your next experience is here.
        </p>
      </div>

      <EventFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
      />

      {error && <div className="home-error">{error}</div>}

      {loading ? (
        <div className="events-loading">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="events-empty">No events match your criteria. Try adjusting filters.</div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pagination.totalPages} ({pagination.total} events)
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
