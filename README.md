# GRIMOIRE 🧙‍♂️

Enchant your workflow with a secure, Kanban-inspired task manager built for disciplined teams.

![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Mongo-orange)
![API](https://img.shields.io/badge/API-v1-blueviolet)
![Auth](https://img.shields.io/badge/Auth-JWT-blue)
![Tests](https://img.shields.io/badge/Backend%20Tests-Jest%20%2B%20Supertest-green)
![Runtime](https://img.shields.io/badge/Node-18%2B-6aa84f)
![Database](https://img.shields.io/badge/DB-MongoDB-4caf50)
![License](https://img.shields.io/badge/License-MIT-black)

## Table of Contents
1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Environment](#environment)
4. [Development Scripts](#development-scripts)
5. [API Map (v1)](#api-map-v1)
6. [Security Defaults](#security-defaults)
7. [Testing](#testing)
8. [Deployment Notes](#deployment-notes)

## Architecture
- **Frontend:** React + TypeScript (CRA), axios client with 401 refresh + retry
- **Backend:** Node.js (Express) + MongoDB, JWT access/refresh with rotation and revocation store
- **Auth UI:** Protected routes, session list, logout-all
- **Kanban Data:** Boards and Cards under `/api/v1/boards`

## Quick Start
### Prerequisites
- Node.js 18+
- MongoDB instance (local or remote)

### Environment
Create `backend/.env` (git-ignored):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grimoire
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
BCRYPT_SALT_ROUNDS=12
CLEANUP_INTERVAL_MS=3600000  # token prune interval (1h default)
```
Optional frontend: `REACT_APP_API_URL` (defaults to `http://localhost:5000`).

### Backend
```bash
cd backend
npm install
npm run dev          # ts-node + nodemon
# npm run build && npm start   # production
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Run Together
- Start MongoDB, then backend, then frontend.
- Frontend expects API at `http://localhost:5000` (or your `REACT_APP_API_URL`).

## Development Scripts
- Backend: `npm run dev` (watch), `npm test -- --runInBand`, `npm run build`
- Frontend: `npm start`, `npm run build`

## API Map (v1)
- **Auth:** `POST /api/v1/auth/register | login | refresh | logout | logout-all`, `GET /api/v1/auth/me`, `GET /api/v1/auth/sessions`
- **Boards:** `GET/POST /api/v1/boards`, `GET/PATCH/DELETE /api/v1/boards/:boardId`
- **Cards:** `GET/POST /api/v1/boards/:boardId/cards`, `PATCH/DELETE /api/v1/boards/:boardId/cards/:cardId`
- **Ops:** `GET /api/v1/metrics` (uptime, memory, token stats; auth required)

## Security Defaults
- Default-deny `.gitignore`; `docs/` excluded from VCS.
- Secrets live in `.env`; never commit them. Rotate `JWT_SECRET`/`JWT_REFRESH_SECRET` regularly.
- Refresh tokens stored and revocable; cleanup runs every `CLEANUP_INTERVAL_MS`.
- Validation on all auth/board/card payloads (zod); consistent JSON errors via `HttpError` middleware.
- Mongo users should run least privilege per environment.

## Testing
- Backend: `cd backend && npm test -- --runInBand` (Jest + supertest + mongodb-memory-server)
- Frontend: CRA defaults (`npm test`) — expand as UI grows.

## Deployment Notes
- Build frontend: `npm run build` and serve via static host/CDN.
- Backend: `npm run build && npm start` behind HTTPS + process manager (PM2/systemd).
- Set CORS allowlist for your deployed frontend origin.
- Tune `CLEANUP_INTERVAL_MS` and monitor `/api/v1/metrics` for token/store health.
