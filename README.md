# Sangam — College Events Portal

Sangam is the official campus events management web application for the college. It gives students a single place to discover and register for all college events — workshops, seminars, tech fests, and more — while giving administrators a secure dashboard to create, manage, and track events and registrations.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technologies and Tools](#3-technologies-and-tools)
4. [Prerequisites](#4-prerequisites)
5. [Installation and Setup](#5-installation-and-setup)
6. [Database and Environment Configuration](#6-database-and-environment-configuration)
7. [Running the Application Locally](#7-running-the-application-locally)
8. [API Endpoint Documentation](#8-api-endpoint-documentation)
9. [Database Schema](#9-database-schema)
10. [Known Limitations](#10-known-limitations)

---

## 1. Project Overview

Sangam is a full-stack web application built as part of a college project. The name *Sangam* (meaning "confluence" in Sanskrit) reflects the idea of bringing students and events together in one place.

**Student-facing features** allow anyone to browse upcoming events, view event details, and register with their name, email, and phone number.

**Admin-facing features** allow authorised college staff to log in securely, create and edit events (with images, capacity limits, and registration deadlines), view all registrations per event, and monitor dashboard statistics.

---

## 2. Features

### Public (Student)
- Browse all college events in a responsive card grid
- Filter events by status: **All**, **Upcoming**, **Past**, **Registration Closed**
- View full event details including date, venue, capacity, and description
- Register for an event with name, email, and phone number
- Duplicate registration prevention (same email + event)
- Real-time capacity tracking (spots left / full)
- Automatic event status calculation (no manual status field needed)

### Admin
- Secure login with HMAC-SHA256 signed tokens (24-hour expiry)
- Dashboard with total events, total registrations, upcoming events count, and recent registrations table
- Create, edit, and delete events
- Set event capacity limits and registration deadlines
- Upload/link event banner images
- View and search registrations per event
- Protected routes — admin pages redirect to login if not authenticated

---

## 3. Technologies and Tools

| Layer | Technology |
|---|---|
| Frontend framework | React 19 (Vite) |
| Frontend routing | React Router DOM v7 |
| Frontend styling | Vanilla CSS with custom design tokens |
| Backend language | PHP 8.1+ |
| Backend architecture | RESTful PHP API endpoints |
| Database | MySQL 8 (via XAMPP) |
| Database access | PDO with prepared statements |
| Authentication | Custom HMAC-SHA256 stateless tokens |
| Local server | XAMPP (Apache + MySQL) |
| Dev server / proxy | Vite dev server with `/api` proxy |
| Version control | Git + GitHub |

---

## 4. Prerequisites

Make sure the following are installed on your machine before setting up the project:

- **XAMPP** (v8.x recommended) — [https://www.apachefriends.org](https://www.apachefriends.org)
  - Apache module must be running
  - MySQL module must be running
- **Node.js** (v18 or higher) — [https://nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** — [https://git-scm.com](https://git-scm.com)
- A modern web browser (Chrome, Firefox, Edge)

---

## 5. Installation and Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/Adarsh-Kasaragod/sangam.git
```

### Step 2 — Copy to XAMPP web root

The backend PHP files must be served by Apache. Copy or move the project folder to XAMPP's `htdocs` directory:

```
C:\xampp\htdocs\event-app\
```

Your folder structure should look like this:

```
C:\xampp\htdocs\event-app\
├── .env
├── backend\
│   ├── api\
│   └── config\
├── database\
│   └── schema.sql
└── frontend\
    ├── public\
    └── src\
```

### Step 3 — Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 6. Database and Environment Configuration

### Step 1 — Create the database

1. Open XAMPP Control Panel and start **Apache** and **MySQL**
2. Open your browser and go to `http://localhost/phpmyadmin`
3. Create a new database named `event_app`
4. Select the `event_app` database, click **Import**, and upload `database/schema.sql`
5. Click **Go** — this will create all tables and insert sample event data

### Step 2 — Set up the environment file

Create a `.env` file in the **project root** (`C:\xampp\htdocs\event-app\.env`) with the following content:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=event_app
DB_USER=root
DB_PASS=

# CORS — set to your frontend dev server URL
ALLOWED_ORIGIN=http://localhost:5173

# App secret — used to sign admin auth tokens
# Generate a strong random value for production
APP_SECRET=change-me-to-a-long-random-secret

# Frontend API base URL (leave blank for local dev — Vite proxy handles it)
VITE_API_URL=
```

> **Note:** The default XAMPP MySQL root password is empty. If you have set a password, fill it in `DB_PASS`.

### Step 3 — Create the admin account

Run the admin setup script from the project root to hash and store the admin password securely:

```bash
php backend/setup_admin.php
```

Default credentials (can be changed in `setup_admin.php`):
- **Email:** `admin@college.edu`
- **Password:** `Admin@123`

---

## 7. Running the Application Locally

### Step 1 — Start XAMPP

Open the XAMPP Control Panel and click **Start** next to both **Apache** and **MySQL**.

### Step 2 — Start the frontend dev server

```bash
cd frontend
npm run dev
```

Vite will start and display a local URL. Open it in your browser:

```
http://localhost:5173
```

> If port 5173 is already in use, Vite will automatically pick the next available port (e.g., 5174, 5175…). Check the terminal output for the exact URL.

### Step 3 — Access the application

| URL | Description |
|---|---|
| `http://localhost:5173/` | Public events listing page |
| `http://localhost:5173/events/:id` | Individual event detail + registration form |
| `http://localhost:5173/admin/login` | Admin login page |
| `http://localhost:5173/admin/dashboard` | Admin dashboard (protected) |
| `http://localhost:5173/admin/events` | Manage events (protected) |
| `http://localhost:5173/admin/registrations` | View registrations (protected) |

The Vite dev server proxies all `/api` requests to `http://localhost/event-app/backend/api`, so the frontend and backend work together seamlessly without CORS issues during development.

---

## 8. API Endpoint Documentation

All API endpoints are located at:
```
http://localhost/event-app/backend/api/
```

Authenticated endpoints require the `Authorization: Bearer <token>` header. The token is obtained from the login endpoint and stored in `localStorage` on the client.

---

### `GET /events.php`
Returns a list of all events with their computed status and registration count.

**Auth required:** No

**Response `200`:**
```json
[
  {
    "id": 1,
    "title": "Web Development Workshop",
    "description": "...",
    "event_date": "2026-11-15 09:00:00",
    "venue": "Computer Science Block — Lab 3",
    "image_url": "https://...",
    "capacity": null,
    "registration_deadline": "2026-11-12 23:59:59",
    "registration_count": 12,
    "status": "Upcoming"
  }
]
```

---

### `GET /events.php?id={id}`
Returns a single event by ID.

**Auth required:** No

**Response `200`:** Single event object (same structure as above)
**Response `404`:** `{ "error": "Event not found" }`

---

### `POST /events.php`
Creates a new event.

**Auth required:** Yes (Admin token)

**Request body:**
```json
{
  "title": "New Event",
  "description": "Event description",
  "event_date": "2026-12-01 10:00:00",
  "venue": "Main Hall",
  "image_url": "/Tech_Fest.jpeg",
  "capacity": 100,
  "registration_deadline": "2026-11-28 23:59:59"
}
```

**Response `201`:** Newly created event object

---

### `PUT /events.php?id={id}`
Updates an existing event.

**Auth required:** Yes (Admin token)

**Request body:** Same fields as POST

**Response `200`:** Updated event object

---

### `DELETE /events.php?id={id}`
Deletes an event and all its registrations (CASCADE).

**Auth required:** Yes (Admin token)

**Response `200`:** `{ "message": "Event deleted successfully" }`

---

### `POST /register.php`
Registers a student for an event. Validates that the event is upcoming, not full, and within the registration deadline. Prevents duplicate registrations.

**Auth required:** No

**Request body:**
```json
{
  "event_id": 1,
  "name": "Adarsh Kumar",
  "email": "adarsh@college.edu",
  "phone": "9876543210"
}
```

**Response `201`:** `{ "message": "You have been successfully registered!", "registration_id": 42 }`
**Response `409`:** Duplicate registration error
**Response `422`:** Validation errors (past event, full, deadline passed, invalid fields)

---

### `POST /login.php`
Authenticates an admin and returns a signed token.

**Auth required:** No

**Request body:**
```json
{
  "email": "admin@college.edu",
  "password": "Admin@123"
}
```

**Response `200`:** `{ "token": "<signed-token>", "admin": { "id": 1, "email": "admin@college.edu" } }`
**Response `401`:** Invalid credentials

---

### `GET /stats.php`
Returns dashboard statistics for the admin.

**Auth required:** Yes (Admin token)

**Response `200`:**
```json
{
  "total_events": 6,
  "total_registrations": 34,
  "upcoming_events": 3,
  "recent_registrations": [
    {
      "name": "Adarsh Kumar",
      "email": "adarsh@college.edu",
      "event_title": "Annual Tech Fest 2026",
      "created_at": "2026-10-28 15:30:00"
    }
  ]
}
```

---

### `GET /registrations.php?event_id={id}&search={query}`
Returns all registrations for a specific event. Supports optional search by name or email.

**Auth required:** Yes (Admin token)

**Response `200`:**
```json
[
  {
    "id": 1,
    "event_id": 2,
    "name": "Adarsh Kumar",
    "email": "adarsh@college.edu",
    "phone": "9876543210",
    "created_at": "2026-10-28 15:30:00"
  }
]
```

---

## 9. Database Schema

The database consists of three tables.

### `admins`
Stores admin login credentials. Passwords are stored as bcrypt hashes.

| Column | Type | Description |
|---|---|---|
| `id` | INT UNSIGNED (PK) | Auto-increment primary key |
| `email` | VARCHAR(255) UNIQUE | Admin email address |
| `password_hash` | VARCHAR(255) | bcrypt hashed password |
| `created_at` | DATETIME | Record creation timestamp |

---

### `events`
Stores all event data. Event **status** (Upcoming / Past / Registration Closed) is computed at query time from `event_date` and `registration_deadline` — it is never stored directly.

| Column | Type | Description |
|---|---|---|
| `id` | INT UNSIGNED (PK) | Auto-increment primary key |
| `title` | VARCHAR(255) | Event title |
| `description` | TEXT | Full event description |
| `event_date` | DATETIME | Date and time of the event |
| `venue` | VARCHAR(255) | Location of the event |
| `image_url` | VARCHAR(512) | Banner image URL or path (nullable) |
| `capacity` | INT UNSIGNED | Max registrations; NULL = unlimited |
| `registration_deadline` | DATETIME | Cutoff date for registrations (nullable) |
| `created_at` | DATETIME | Record creation timestamp |

---

### `registrations`
Stores student registrations. A UNIQUE constraint on `(event_id, email)` prevents the same student from registering twice for the same event. Deleting an event automatically deletes its registrations (ON DELETE CASCADE).

| Column | Type | Description |
|---|---|---|
| `id` | INT UNSIGNED (PK) | Auto-increment primary key |
| `event_id` | INT UNSIGNED (FK) | References `events.id` |
| `name` | VARCHAR(255) | Student full name |
| `email` | VARCHAR(255) | Student email address |
| `phone` | VARCHAR(20) | Student phone number |
| `created_at` | DATETIME | Registration timestamp |

---

### Entity Relationship

```
admins          events                  registrations
------          ------                  -------------
id         ←   id          ←── FK ───  event_id
email           title                   name
password_hash   description             email
created_at      event_date              phone
                venue                   created_at
                image_url
                capacity
                registration_deadline
                created_at
```

---

## 10. Known Limitations

| # | Limitation | Notes |
|---|---|---|
| 1 | **No email notifications** | Students do not receive a confirmation email after registering. This would require a mail service (e.g., PHPMailer + SMTP). |
| 2 | **No image upload** | Event images are set as a URL or file path. There is no file upload interface — admins must manually copy images to `frontend/public/` and enter the path. |
| 3 | **Single admin account** | The system supports only one admin account. There is no multi-admin or role-based access control. |
| 4 | **No password reset** | There is no "Forgot password" flow. The admin password can only be changed by re-running `setup_admin.php`. |
| 5 | **No pagination** | The events list and registrations list load all records at once. This may be slow for large datasets. |
| 6 | **Local images not suitable for production** | Images stored in `frontend/public/` are not pushed to the backend server. In a production deployment, a cloud storage solution (e.g., Cloudinary, AWS S3) would be needed. |
| 7 | **XAMPP-only backend** | The backend is configured for XAMPP local development. Deploying to a live server requires additional configuration (Apache virtual hosts, production `.env`, etc.). |
| 8 | **No event search** | Students cannot search for events by keyword on the public listing page. |

---

## Project Structure

```
event-app/
├── .env                        # Environment variables (not committed)
├── .gitignore
├── README.md
├── backend/
│   ├── api/
│   │   ├── .htaccess           # Apache CORS and rewrite rules
│   │   ├── events.php          # CRUD for events
│   │   ├── login.php           # Admin authentication
│   │   ├── register.php        # Student registration
│   │   ├── registrations.php   # View registrations (admin)
│   │   └── stats.php           # Dashboard statistics
│   ├── config/
│   │   └── db.php              # PDO database connection
│   └── helpers/
│       ├── auth.php            # HMAC token generation and verification
│       ├── cors.php            # CORS headers
│       ├── response.php        # JSON response helpers
│       └── validate.php        # Input validation utilities
├── database/
│   └── schema.sql              # Database schema + seed data
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── favicon.svg
    │   ├── freshers_day.jpeg
    │   ├── ai_seminar.jpeg
    │   ├── Career_pic.jpeg
    │   └── Tech_Fest.jpeg
    └── src/
        ├── App.jsx
        ├── api/
        │   └── api.js          # Centralised fetch client
        ├── components/
        │   ├── EventCard.jsx
        │   ├── Navbar.jsx
        │   ├── StatusBadge.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── EmptyState.jsx
        │   ├── Modal.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── EventsPage.jsx
        │   ├── EventDetailPage.jsx
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ManageEventsPage.jsx
        │   ├── EventFormPage.jsx
        │   └── RegistrationsPage.jsx
        └── styles/
            ├── global.css
            ├── navbar.css
            ├── events.css
            ├── eventdetail.css
            └── admin.css
```

---

*Developed by Adarsh Kasaragod, 2026*
