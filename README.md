<div align="center">
  <img src="./assets/grimoire-banner.png" alt="GRIMOIRE Banner" width="100%">
  
  # 🔮 GRIMOIRE
  
  **Enchant your workflow. Illuminate the path to done.**
  
  A mystical Kanban task management app where productivity meets magic ✨
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  
  [✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-magic-terminology) • [🎮 Roadmap](#-roadmap)
</div>

---

## ✨ Features

🔮 **Mystical Interface** - Dark-first theme with magical accents and (future) particle effects  
🎮 **Gamification** - XP/achievements/levels (roadmap)  
🎯 **Drag & Drop Magic** - Smooth Kanban board with spell casting vibes (roadmap)  
🌙 **Dark Mode First** - Illuminated light mode planned  
🎵 **Sound Design** - Magical SFX planned for actions  
⌨️ **Power User Shortcuts** - Command palette + vim-style nav (roadmap)  
📱 **PWA Ready** - Install as native app (roadmap)  
🌐 **Multilingual** - EN/ES planned; terminology mapped below  

---

## 🎨 Screenshots

<div align="center">
  <img src="./assets/screenshot-dashboard.png" width="48%" alt="Dashboard preview">
  <img src="./assets/screenshot-board.png" width="48%" alt="Board preview">
</div>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Backend
```bash
cd backend
npm install
# create backend/.env (see env block)
npm run dev          # ts-node + nodemon
# npm run build && npm start   # production
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Optional: `REACT_APP_API_URL` (defaults to `http://localhost:5000`).

### Environment (backend/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grimoire
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
BCRYPT_SALT_ROUNDS=12
CLEANUP_INTERVAL_MS=3600000
```

Visit `http://localhost:3000` and start casting spells! 🔮

---

## 🛠️ Tech Stack

**Frontend:** React 18 + TypeScript, axios, (upcoming) TailwindCSS, react-beautiful-dnd (to be migrated), Framer Motion (planned)  
**State:** Context + local state now; roadmap: Zustand  
**Backend:** Node.js + Express, MongoDB, JWT auth (access + refresh with rotation/revocation)  
**DevOps:** GitHub Actions (planned), Docker Compose (planned), Vercel/Render (planned)

---

## 📖 Magic Terminology

| Traditional | GRIMOIRE |
|------------|----------|
| Boards | 🔮 **Grimoire Pages** |
| Lists | 📚 **Spell Schools** |
| Tasks | ✨ **Spells** |
| Complete | 🎯 **Mastered** |
| Archive | 🔒 **Sealed in the Vault** |
| Due Date | 📅 **Prophecy Date** |
| Recurring | 🔄 **Ritual** |

---

## 🎮 Roadmap

### Q1 2026 - MVP
- [x] Authentication (JWT, refresh rotation, logout-all)
- [x] CRUD: Boards + Lists + Cards
- [ ] Drag & Drop with animations
- [ ] XP system & achievements
- [ ] Sound design
- [ ] PWA setup
- [ ] Deployment (Vercel/Render)

### Q2 2026 - Enhancement
- [ ] Real-time collaboration (WebSockets)
- [ ] Advanced filters & search
- [ ] Mobile app (React Native)
- [ ] Third-party integrations
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! (No bots; English only.)

1. Fork the project  
2. Create your feature branch (`git checkout -b feature/AmazingSpell`)  
3. Commit (`git commit -m '✨ Add AmazingSpell'`)  
4. Push (`git push origin feature/AmazingSpell`)  
5. Open a Pull Request  

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  
  ### 🔮 Ready to enchant your workflow?
  
  ⭐ Star this repo if you believe in productivity magic! ⭐
  
  Made with 💜 by wizards, for wizards
  
</div>
