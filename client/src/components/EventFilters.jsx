import React from 'react';
import './EventFilters.css';

export default function EventFilters({ filters, filterOptions, onFilterChange }) {
  return (
    <div className="event-filters">
      <input
        type="text"
        placeholder="Search events..."
        className="filter-input filter-search"
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
      />
      <select
        className="filter-input filter-select"
        value={filters.location}
        onChange={(e) => onFilterChange('location', e.target.value)}
      >
        <option value="">All locations</option>
        {filterOptions.locations?.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <select
        className="filter-input filter-select"
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
      >
        <option value="">All categories</option>
        {filterOptions.categories?.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <input
        type="date"
        className="filter-input filter-date"
        value={filters.dateFrom}
        onChange={(e) => onFilterChange('dateFrom', e.target.value)}
        title="From date"
      />
      <input
        type="date"
        className="filter-input filter-date"
        value={filters.dateTo}
        onChange={(e) => onFilterChange('dateTo', e.target.value)}
        title="To date"
      />
    </div>
  );
}
