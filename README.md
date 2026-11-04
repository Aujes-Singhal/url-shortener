# Snip — URL Shortener (MERN, JavaScript)

Shorten a long URL, get a 7-character link, and get redirected when you open it.

**Stack:** MongoDB (Mongoose) · Express · React (Vite) · Node.js · Redis (Upstash, optional)

## How it works

```
POST /api/shorten { url }  ->  validate -> generate code -> save in MongoDB -> cache in Redis -> { shortUrl }
GET  /:code                ->  Redis hit? redirect : MongoDB lookup -> cache -> 302 redirect
```

### Design decisions (good for your resume / interviews)

| Decision | Why | Trade-off |
|---|---|---|
| Random 7-char base62 code | Simple and unguessable; 62^7 ≈ 3.5 trillion combos | Collisions are possible, so we rely on a **unique index** and retry |
| Unique index + retry on duplicate key (E11000) | Race-safe: the DB decides, no "check then insert" gap | One extra round trip on the rare collision |
| Redis cache-aside on redirect | Redirects are read-heavy; hot links skip MongoDB | Cache can go stale if links are ever edited/deleted |
| 302 (not 301) redirect | Browsers don't cache it forever, so analytics/expiry can be added later | Slightly more traffic |
| Fixed-window rate limiter (Redis, in-memory fallback) | Protects `/api/shorten` from abuse | Allows bursts at window edges; sliding window is the upgrade |
| Only http/https URLs | Blocks `javascript:` and similar | — |
| Redis is optional | App works locally without it | — |

**Implemented:** shorten, redirect, validation, rate limiting, caching, error handling, health check.
**Not implemented (next steps):** auth, analytics, custom aliases, expiry, tests.

## Run locally

Needs Node 18+ and a MongoDB URI (local or Atlas free tier).

```bash
# Backend
cd server
cp .env.example .env     # set MONGO_URI (REDIS_URL optional)
npm install
npm run dev              # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

## Deploy (free tier)

1. **MongoDB Atlas** – free cluster, copy the connection string, allow network access.
2. **Upstash Redis** (optional) – copy the `rediss://` URL.
3. **Render** (backend) – root dir `server`, build `npm install`, start `npm start`.
   Env vars: `MONGO_URI`, `REDIS_URL`, `BASE_URL` (your Render URL), `CLIENT_ORIGIN` (your Vercel URL).
4. **Vercel** (frontend) – root dir `client`, env var `VITE_API_URL` = your Render URL.

Short links are served by the backend, so `BASE_URL` must be the backend's public URL.

## API

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/shorten` | `{ "url": "https://example.com/long" }` | `201 { code, shortUrl, originalUrl }` |
| GET | `/:code` | — | `302` redirect, or `404` |
| GET | `/api/health` | — | `{ status: "ok" }` |
