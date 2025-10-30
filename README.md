# LinkPulse — Smart URL Shortener & Private Analytics

A modern, full-stack MERN URL shortener and link management platform with **owner-gated tracking privacy**. Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**, fully containerized with **Docker** and automated via **GitHub Actions CI**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![Security: Private Tracking](https://img.shields.io/badge/Security-Owner--Only%20Analytics-indigo.svg)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)

---

## Features

- **Owner-Gated Tracking Privacy:** Click analytics and link metrics are strictly isolated to the user who created the short URL. Zero cross-user visibility.
- **User Authentication & Guest Migration:** Secure JWT authentication with Bcrypt password encryption. Anonymous links created on a device seamlessly migrate to a user's account upon sign up.
- **Instant URL Shortening:** Convert long, complex web addresses into clean, shareable short links.
- **Smart Protocol Normalization:** Automatically handles URLs with or without `http://` / `https://`.
- **Direct Redirection:** Public short links route cleanly through fast redirects (`HTTP 302`) with visit tracking.
- **Click Analytics & Dashboard:** Real-time counters monitor clicks with overview statistics (Active Links, Total Clicks, Privacy Guard).
- **Interactive QR Codes:** Generate and download crisp QR codes for any link to easily share across mobile devices.
- **Live Search & Filter:** Quickly find links by destination domain or unique short code.
- **Modern Dark UI:** Premium deep-slate and electric indigo/cyan neon theme with glassmorphic accents.
- **One-Click Copy:** Seamless clipboard copying with instant visual feedback.
- **Safe Management:** Delete outdated or unwanted shortened links with owner authorization checks.

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with PostCSS
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Production Server:** Nginx (Alpine)

### Backend
- **Runtime:** Node.js (Alpine)
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **ID Generation:** Nanoid

### DevOps & Infrastructure
- **Containerization:** Docker multi-stage builds (Server & Client)
- **Orchestration:** Docker Compose (Mongo, API, Nginx Client, Networks, Volumes)
- **CI/CD:** GitHub Actions automated build and configuration validation

---

## Getting Started

### Option A: Run with Docker Compose (Recommended)

The entire full-stack application (MongoDB, Express API, and React frontend with Nginx) can be spun up with a single command:

```bash
# Clone the repository
git clone https://github.com/thejaynesh/Url-Shortner-App.git
cd Url-Shortner-App

# Start all containers in detached mode
docker compose up -d --build
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:5001`
- **MongoDB Database:** `localhost:27017`

To shut down the containers:
```bash
docker compose down
```

---

### Option B: Local Manual Setup

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

#### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables:**
   - In `server-app/.env`:
     ```env
     PORT=5001
     CONNECTION_STRING=mongodb://localhost:27017/urlshortener
     ```
   - In `client-app/.env`:
     ```env
     VITE_SERVER_URL=http://localhost:5001/api
     ```

3. **Start Development Servers:**
   Run both backend and frontend concurrently:
   ```bash
   npm run dev
   ```

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI automated pipeline
├── docker-compose.yml         # Multi-service container orchestration
├── package.json               # Root scripts (concurrent execution)
├── .gitignore
├── README.md
├── server-app/                # Backend API (Node.js & Express)
│   ├── Dockerfile             # Multi-stage production build
│   ├── .dockerignore
│   ├── src/
│   │   ├── config/dbConfig.ts # MongoDB connection setup
│   │   ├── controllers/       # Business logic (create, redirect, list, delete)
│   │   ├── model/             # Mongoose shortUrl schema
│   │   ├── routes/            # Express router endpoints
│   │   └── server.ts          # Express server entry point & root redirect
│   ├── package.json
│   └── tsconfig.json
└── client-app/                # React Frontend (Vite & Tailwind)
    ├── Dockerfile             # Multi-stage build with Nginx server
    ├── nginx.conf             # Reverse proxy configuration
    ├── .dockerignore
    ├── src/
    │   ├── components/
    │   │   ├── Container/     # Main page layout & state management
    │   │   ├── DataTable/     # URL list, live search, click stats
    │   │   ├── Footer/        # Footer with author links
    │   │   ├── FormContainer/ # Link input form with loading & validation
    │   │   ├── Header/        # Application navigation header
    │   │   └── QRCodeModal/   # Modal with scannable QR code generator
    │   ├── helpers/           # Server endpoint constants
    │   ├── interface/         # TypeScript data contracts
    │   ├── app.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Author

- **Jaynesh Bhandari** - [@thejaynesh](https://github.com/thejaynesh)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
