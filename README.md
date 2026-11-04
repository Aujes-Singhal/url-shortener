## URL Shortener (MERN)

Shorten a long URL, get a 7-character link, and get redirected when you open it.

**Tech Stack:** MongoDB (Mongoose) · Express · React (Vite) · Node.js

## How it works

POST /api/shorten { url }  ->  validate -> generate code -> save in MongoDB
GET  /:code                ->  MongoDB lookup -> get the short url -> 302 redirect

## Project Structure

url-shortener-js/
├─ client/
├─ server/
├─ README.md

## Environment Variables Required in the Backend

PORT=""
MONGO_URI=""
BASE_URL="" (Public URL of backend)
CLIENT_ORIGIN="" (frontend origin)

## Run locally

Needs Node 18+ and a MongoDB URI (local or Atlas).

```bash
# Backend
cd server
npm install
npm run dev              # http://localhost:5000

# Frontend
cd client
npm install
npm run dev              # http://localhost:5173
```

## Deploy

1. **MongoDB Atlas** – free cluster, copy the connection string, allow network access.
2. **Render** (backend) – root dir `server`, build `npm install`, start `npm start`.
   Env vars: `MONGO_URI`,`BASE_URL` (your Render URL), `CLIENT_ORIGIN`

## API

| POST | `/api/shorten` | `"url": "https://example.com/long"` | `201 { code, shortUrl, originalUrl }` |
| GET | `/:code` | — | `302` redirect, or `404` |
| GET | `/api/health` | — | `{ status: "ok" }` |
