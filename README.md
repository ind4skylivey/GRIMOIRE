# GRIMOIRE

Enchant your workflow with a secure, Kanban-inspired task manager.

## Architecture
- **Frontend:** React + TypeScript (CRA)
- **Backend:** Node.js (Express) + MongoDB
- **Auth:** JWT
- **Styling:** TailwindCSS-ready (or swap your own)

## Quick Start
### Prerequisites
- Node.js 18+
- MongoDB instance (local or remote)

### Environment
Create a backend `.env` (kept out of git):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grimoire
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
BCRYPT_SALT_ROUNDS=12
```

### Backend
```bash
cd backend
npm install
npm run dev       # ts-node + nodemon
# npm run build && npm start  # production
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Optional: set API base with `REACT_APP_API_URL` (defaults to `http://localhost:5000`).

### Running Together
- Ensure MongoDB is up and `MONGODB_URI` is reachable.
- Start backend first, then frontend; frontend expects backend at `http://localhost:5000` (configure as needed).

## Security & Data Hygiene
- `.gitignore` follows default-deny: secrets, runtime outputs, `docs/` (production-only), scans, and generated artifacts stay out of git.
- Client configs live in `clients/`; only sanitized templates (`example.toml`) are versioned. Real client files stay local.
- Use `.env` files for secrets; never commit them. Rotate `JWT_SECRET` regularly.
- Prefer least privilege MongoDB users for deployments.

## Features (current)
- Board creation and task lanes (React + react-beautiful-dnd).
- Basic Express API scaffold with MongoDB connection.
- JWT-ready backend skeleton plus refresh/logout token invalidation.
- Auth UI flow with protected route guard and token storage.

## Roadmap (suggested)
- Add authentication routes (signup/login/refresh) with bcrypt password hashing.
- Implement board/card CRUD with ownership checks and audit-friendly logs.
- Add role-based access control (RBAC) and rate limiting.
- Integrate CI checks: lint, test, dependency audit.

## Development Conventions
- Branch names: `feature/<name>` or `fix/<issue>`.
- Commits: `[TYPE] Summary` (e.g., `[FIX] Handle auth expiry`).
- Keep code in English, follow SOLID/DRY, avoid unchecked `.unwrap()` equivalents, and include concise comments only where needed.

## Testing (add-on)
- Frontend: `npm test` (Jest/RTL via CRA).
- Backend: add Jest + supertest; sample script to be added (`npm test`).
- Use `git status --ignored` before commits to ensure secrets/artifacts remain out of VCS.

## Deployment Notes
- Build frontend (`npm run build`) and serve via your preferred static host or CDN.
- Run backend with `npm run build && npm start` behind a process manager (PM2/systemd) and HTTPS termination.
- Configure CORS origins for your deployed frontend domain.
