# URL Shortener App

A modern, full-stack MERN URL shortener web application designed to generate, manage, and track shortened links. Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38b2ac.svg)

---

## Features

- **Instant URL Shortening:** Convert long, complex web addresses into clean, shareable short links.
- **Smart Protocol Normalization:** Automatically handles URLs with or without `http://` / `https://`.
- **Direct Redirection:** Short links route cleanly through fast redirects with visit tracking.
- **Click Analytics:** Real-time counters monitor how many times each shortened link has been clicked.
- **Interactive QR Codes:** Generate and download crisp QR codes for any link to easily share across mobile devices.
- **Live Search & Filter:** Quickly find links by destination domain or unique short code.
- **One-Click Copy:** Seamless clipboard copying with instant visual feedback.
- **Safe Management:** Delete outdated or unwanted shortened links.

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with PostCSS
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Routing:** React Router DOM

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **ID Generation:** Nanoid
- **Dev Server:** ts-node-dev

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thejaynesh/Url-Shortner-App.git
   cd Url-Shortner-App
   ```

2. **Install all dependencies (root, backend, and frontend):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   - In `server-app/.env`:
     ```env
     PORT=5001
     CONNECTION_STRING=mongodb://localhost:27017/urlshortener
     ```
   - In `client-app/.env`:
     ```env
     VITE_SERVER_URL=http://localhost:5001/api
     ```

4. **Start Development Servers:**
   To run both backend and frontend concurrently with a single command:
   ```bash
   npm run dev
   ```
   - Client will start at: `http://localhost:3000` (or `http://localhost:5173`)
   - Backend API will start at: `http://localhost:5001`

---

## Project Structure

```
├── package.json               # Root scripts (concurrent execution)
├── .gitignore
├── README.md
├── server-app/                # Backend API
│   ├── src/
│   │   ├── config/dbConfig.ts # MongoDB connection setup
│   │   ├── controllers/       # Business logic (create, redirect, list, delete)
│   │   ├── model/             # Mongoose shortUrl schema
│   │   ├── routes/            # Express router endpoints
│   │   └── server.ts          # Express server entry point & root redirect
│   ├── package.json
│   └── tsconfig.json
└── client-app/                # React Frontend
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
