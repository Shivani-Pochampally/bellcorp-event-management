# Bellcorp Event Management

A full-stack **Event Management Application** built with the MERN stack (MongoDB, Express, React, Node.js). Users can browse events, search and filter, register or cancel registration, and view their dashboard with upcoming and past events.

## Tech Stack

- **Frontend:** React 18, React Router 6, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB (with Mongoose)
- **Auth:** JWT (Bearer token)

## Features

- **Authentication:** User registration, login, protected routes
- **Event listings:** Browse events with name, organizer, location, date/time, description, capacity, category, tags
- **Event discovery:** Text search, filters (date, location, category), pagination, URL state (shareable links)
- **Registration:** Register for events, cancel registration; real-time seat availability
- **User dashboard:** List of registered events, upcoming summary, past event history

## Project Structure

```
bellcorp-event-management/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Layout, EventCard, EventFilters
│   │   ├── context/        # AuthContext
│   │   └── pages/          # Home, EventDetail, Dashboard, Login, Register
│   └── ...
├── server/                 # Express backend
│   ├── config/             # DB connection
│   ├── controllers/        # auth, events, registrations
│   ├── middleware/         # auth (protect, optionalProtect)
│   ├── models/             # User, Event, Registration
│   ├── routes/             # auth, events, registrations
│   └── scripts/seed.js     # Seed sample events
└── README.md
```

## Database Design (MongoDB)

- **User:** `name`, `email`, `password` (hashed with bcrypt)
- **Event:** `name`, `organizer`, `location`, `dateTime`, `description`, `capacity`, `category`, `tags[]`; indexes for text search, date, location, category
- **Registration:** `user` (ref User), `event` (ref Event); unique compound index on (user, event)

Relations: One user can have many registrations; one event can have many registrations. Available seats = `event.capacity - count(registrations)`.

## Setup (Local)

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Backend

```bash
cd server
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

Seed sample events (optional):

```bash
npm run seed
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:3000` and proxies `/api` to the backend.

## Environment Variables

**Server (`.env`):**

| Variable      | Description                    |
|---------------|--------------------------------|
| `PORT`        | Server port (default 5000)     |
| `MONGODB_URI` | MongoDB connection string      |
| `JWT_SECRET`  | Secret for signing JWT tokens |

**Client (production):** Set `VITE_API_URL` to your backend URL if not using same-origin (e.g. Vercel + Render). The app uses relative `/api` by default (same host with proxy or server rewrites).

## Deployment

- **Frontend:** Deploy `client` to **Vercel** or **Netlify**. Build command: `npm run build`; output: `dist`. In project settings, set **VITE_API_URL** to your backend URL (e.g. `https://bellcorp-event-api.onrender.com`) so the app calls the correct API in production.
- **Backend:** Deploy `server` to **Render** (Web Service). Set env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`. Start command: `npm start`.

CORS is enabled on the backend for all origins. Use **VITE_API_URL** only when frontend and backend are on different hosts (e.g. Vercel + Render).

## API Overview

| Method | Endpoint                    | Auth  | Description              |
|--------|-----------------------------|-------|--------------------------|
| POST   | `/api/auth/register`        | No    | Register user            |
| POST   | `/api/auth/login`           | No    | Login                    |
| GET    | `/api/auth/me`              | Yes   | Current user             |
| GET    | `/api/events`               | Optional | List events (query: page, limit, search, location, category, dateFrom, dateTo) |
| GET    | `/api/events/filters`       | No    | Locations & categories   |
| GET    | `/api/events/:id`           | Optional | Event by ID            |
| GET    | `/api/registrations/my`     | Yes   | My registrations         |
| POST   | `/api/registrations/:eventId` | Yes | Register for event       |
| DELETE | `/api/registrations/:eventId` | Yes | Cancel registration      |

## Submission

- **Hosted:** Frontend on Vercel/Netlify, Backend on Render  
- **Repo:** Well-structured GitHub repository  
- **Video:** Working demo + backend walkthrough + frontend walkthrough + DB design; upload to drive and send link to engineering@bellcorpstudio.com  

---

Bellcorp Event Management – Assignment
