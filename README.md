# NewsLetterSender

Interní nástroj pro Benefit Plus — správa emailových kampaní pro account manažery.

**Stack:** Next.js 16 (App Router) + Prisma + Neon PostgreSQL → deployed on Vercel (free tier).

---

## 🚀 Quick Start (local dev)

### Requirements
- Node.js 18+
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))

### Setup

```bash
cd web
cp .env.example .env   # fill in DATABASE_URL + JWT_SECRET
npm install
npx prisma db push     # create tables
npx prisma db seed     # seed test users
npm run dev            # http://localhost:3000
```

### Test credentials

| User | Password | Role |
|------|----------|------|
| admin | admin123 | Administrátor |
| mariya | pass123 | Account Manager |
| jan.novak | pass123 | Account Manager |
| petra | pass123 | Account Manager |

---

## 🔌 External integrations

All integrations work in **mock mode** by default. Add API keys to `.env` to enable real connections.

| Service | Env vars | Purpose |
|---------|----------|---------|
| **Raynet CRM** | `RAYNET_API_KEY`, `RAYNET_INSTANCE` | Company list |
| **Ecomail** | `ECOMAIL_API_KEY`, `ECOMAIL_LIST_ID` | Email delivery |
| **Power BI** | _(Excel export)_ | Reporting via `.xlsx` download |

---

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com) → Root: `web/`
3. Add environment variables: `DATABASE_URL`, `JWT_SECRET`
4. Deploy — done!

---

## 📁 Project structure

```
NewsLetterSender/
├── web/                          # Full-stack Next.js app
│   ├── src/app/                  # Pages + API routes
│   │   ├── api/                  # Backend (serverless functions)
│   │   └── (pages)/              # React frontend
│   ├── src/lib/                  # Shared utils (auth, prisma, api)
│   ├── prisma/                   # Schema + seed
│   └── package.json
├── docs/                         # PRD, mockups
└── README.md
```

## 📊 Tech Stack

- **Runtime**: Next.js 16 (App Router) on Vercel
- **Database**: Neon PostgreSQL (free tier) + Prisma 6
- **Auth**: JWT (jose + bcryptjs)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Integrations**: Raynet CRM, Ecomail (switchable mock/real)
- **Reporting**: Excel export for Power BI
