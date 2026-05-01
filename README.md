# 📧 NewsLetterSender

> A campaign management tool for selecting CRM companies and syncing their contacts to Ecomail for newsletter distribution.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![Neon](https://img.shields.io/badge/DB-Neon_PostgreSQL-green?logo=postgresql)

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph Client["🖥️ Browser"]
        UI[React 19 SPA]
    end

    subgraph Vercel["☁️ Vercel Edge"]
        subgraph API["Next.js 16 API Routes"]
            AUTH["/api/auth"]
            COMPANIES["/api/companies"]
            CAMPAIGNS["/api/campaigns"]
            CONTACTS["/api/contacts"]
            SEND["/api/campaigns/:id/send"]
        end
        subgraph Frontend["Next.js App Router"]
            PAGE["page.tsx (Dashboard)"]
            LOGIN["login/page.tsx"]
        end
    end

    subgraph External["🌐 External Services"]
        RAYNET["Raynet CRM API"]
        ECOMAIL["Ecomail API"]
    end

    subgraph DB["🗄️ Neon PostgreSQL"]
        USERS[(users)]
        CAMP[(campaigns)]
        DECISIONS[(company_decisions)]
        CONT[(contacts)]
        AUDIT[(audit_logs)]
    end

    UI -->|JWT Auth| AUTH
    UI -->|Fetch companies| COMPANIES
    UI -->|CRUD campaigns| CAMPAIGNS
    UI -->|Upload CSV| CONTACTS
    UI -->|Sync to Ecomail| SEND

    COMPANIES -->|Basic Auth| RAYNET
    SEND -->|subscribe-bulk| ECOMAIL

    AUTH --> USERS
    CAMPAIGNS --> CAMP
    CAMPAIGNS --> DECISIONS
    CONTACTS --> CONT
    SEND --> AUDIT
```

---

## 🔄 Core Workflow

```mermaid
sequenceDiagram
    participant U as 👤 User (Admin)
    participant App as 📱 Dashboard
    participant Ray as 🏢 Raynet CRM
    participant DB as 🗄️ Neon DB
    participant Eco as 📧 Ecomail

    U->>App: Login (JWT)
    App->>Ray: GET /api/companies (paginated)
    Ray-->>App: Company list (name, ID)
    App-->>U: Show companies with checkboxes

    U->>App: Select/deselect companies
    App->>DB: Save CompanyDecisions

    U->>App: Upload CSV (contacts)
    App->>DB: Parse & store contacts
    App-->>U: Show summary per company

    U->>App: Click "Aktualizovat seznam kontaktů"
    App->>DB: Get selected companies + contacts
    App->>Eco: POST /lists/:id/subscribe-bulk
    Eco-->>App: 200 OK / 422 Error
    App-->>U: Show ✓ success or ✗ error in modal
```

---

## 📁 Project Structure

```
web/
├── prisma/
│   ├── schema.prisma          # DB schema (Users, Campaigns, Decisions, Contacts, Audit)
│   ├── seed.ts                # Seed script (2 accounts: admin + manager)
│   └── migrations/            # Prisma migrations
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main dashboard (campaign grid + company list)
│   │   ├── login/page.tsx     # Login page
│   │   ├── layout.tsx         # Root layout with auth provider
│   │   └── api/
│   │       ├── auth/route.ts          # POST login → JWT token
│   │       ├── companies/route.ts     # GET → Raynet CRM companies
│   │       ├── contacts/route.ts      # POST → CSV upload & parsing
│   │       └── campaigns/
│   │           ├── route.ts           # GET/POST campaigns
│   │           └── [id]/
│   │               ├── decisions/     # PUT company selections
│   │               ├── send/          # PUT → Ecomail sync
│   │               ├── audit/         # GET audit log
│   │               ├── rename/        # PUT rename campaign
│   │               └── export/        # GET export data
│   ├── components/
│   │   ├── header.tsx                 # Top bar (role-aware: Admin sees upload)
│   │   ├── sidebar.tsx                # Campaign sidebar
│   │   ├── clients-table.tsx          # Company selection grid
│   │   ├── csv-upload.tsx             # CSV upload modal + Ecomail sync
│   │   ├── filters.tsx                # Search/filter bar
│   │   ├── history-modal.tsx          # Audit log viewer
│   │   ├── create-campaign-modal.tsx  # New campaign dialog
│   │   ├── rename-campaign-modal.tsx  # Rename dialog
│   │   └── confirm-dialog.tsx         # Generic confirmation
│   ├── lib/
│   │   ├── api.ts             # Client-side API helper functions
│   │   ├── auth.ts            # JWT verification (server-side)
│   │   ├── auth-context.tsx   # React auth context + role check
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Utility helpers (cn, etc.)
│   └── types/index.ts         # TypeScript interfaces
└── package.json
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        string username UK
        string password_hash
        string display_name
        enum role "Admin | AccountManager"
        datetime created_at
    }

    campaigns {
        uuid id PK
        string name
        enum status "Processed | Sent"
        date plan_date
        datetime created_at
        datetime updated_at
    }

    company_decisions {
        uuid id PK
        uuid campaign_id FK
        string company_id
        string company_name
        boolean selected
        string decided_by
        datetime decided_at
    }

    contacts {
        uuid id PK
        uuid campaign_id FK
        string company_id
        string company_name
        string email
        string contact_name
        datetime uploaded_at
    }

    audit_logs {
        uuid id PK
        uuid campaign_id FK
        string action
        string performed_by
        string details
        datetime timestamp
    }

    campaigns ||--o{ company_decisions : has
    campaigns ||--o{ contacts : has
    campaigns ||--o{ audit_logs : has
```

---

## 👥 Role-Based Access

| Feature | Admin | Account Manager |
|---------|:-----:|:---------------:|
| View campaigns | ✅ | ✅ |
| Select/deselect companies | ✅ | ✅ |
| Create/rename campaigns | ✅ | ✅ |
| Upload CSV contacts | ✅ | ❌ |
| Sync to Ecomail | ✅ | ❌ |
| View audit history | ✅ | ✅ |

---

## 🔌 External Integrations

### Raynet CRM
- **Purpose**: Source of company data (names, IDs)
- **Auth**: Basic Auth (`RAYNET_API_USER:RAYNET_API_KEY`)
- **Endpoint**: `https://app.raynet.cz/api/v2/company/`
- **Pagination**: 200 per page, auto-fetches all pages

### Ecomail
- **Purpose**: Newsletter distribution (subscriber management)
- **Auth**: API Key header
- **Endpoint**: `POST /lists/{listId}/subscribe-bulk`
- **Payload**: `{ subscriber_data: [{email, name}], update_existing: true, resubscribe: true }`
- **Validation**: Emails are validated + deduplicated before sending
- **Matching**: Fuzzy substring matching between CSV company names and Raynet company names

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Neon account)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Auth
JWT_SECRET="your-secret-key"

# Raynet CRM
RAYNET_API_USER="user@email.com"
RAYNET_API_KEY="your-raynet-key"
RAYNET_INSTANCE_NAME="your-instance"

# Ecomail
ECOMAIL_API_KEY="your-ecomail-key"
ECOMAIL_LIST_ID="1"
```

### Local Development

```bash
cd web
npm install
npx prisma migrate dev    # Apply migrations
npx prisma db seed        # Create default users
npm run dev               # Start on localhost:3000
```

### Step-by-Step: Fork, Setup & Deploy to Vercel

#### 1️⃣ Clone the repo and push to your own GitHub

```bash
# Clone the original repository
git clone https://github.com/maksym-mishchenko/NewsLetterSender.git
cd NewsLetterSender

# Remove the original remote
git remote remove origin

# Create a new repo on YOUR GitHub (via browser or CLI)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/NewsLetterSender.git
git push -u origin main
```

> 💡 Alternatively, click **"Fork"** on GitHub — this copies the repo to your account in one click.

---

#### 2️⃣ Create a Vercel account

1. Go to [vercel.com](https://vercel.com) and click **"Sign Up"**
2. Sign up with your **GitHub account** (recommended — enables auto-deploy)
3. Authorize Vercel to access your GitHub repositories
4. You're in! Free tier is enough for this project.

---

#### 3️⃣ Create a Neon PostgreSQL database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier)
2. Click **"Create Project"** → name it `newsletter-sender`
3. Copy the **connection string** — it looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. You'll paste this as `DATABASE_URL` in Vercel (next step)

---

#### 4️⃣ Deploy to Vercel

**Option A: Via Vercel Dashboard (easiest)**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** → select your `NewsLetterSender` repo
3. Set the **Root Directory** to `web` (important!)
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |
   | `RAYNET_API_USER` | Your Raynet email |
   | `RAYNET_API_KEY` | Your Raynet API key |
   | `RAYNET_INSTANCE_NAME` | Your Raynet instance |
   | `ECOMAIL_API_KEY` | Your Ecomail API key |
   | `ECOMAIL_LIST_ID` | Your Ecomail list ID (e.g. `1`) |

5. Click **"Deploy"** → wait ~60 seconds
6. Your app is live at `https://your-project.vercel.app` 🎉

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
cd web
vercel --prod --yes
```

> When prompted, set Root Directory to `web` and framework to Next.js.

---

#### 5️⃣ Run database migrations & seed

After the first deploy, you need to set up the database:

```bash
# Option A: Run locally pointing at Neon (set DATABASE_URL in .env)
cd web
npx prisma migrate deploy   # Apply all migrations
npx prisma db seed           # Create default user accounts

# Option B: Use Vercel CLI to run in production context
vercel env pull .env.local   # Pull production env vars
npx prisma migrate deploy
npx prisma db seed
```

---

#### 6️⃣ Verify it works

1. Open your Vercel URL (e.g. `https://newsletter-sender.vercel.app`)
2. Login with `admin` / (password from seed.ts)
3. You should see the campaign dashboard with companies loading from Raynet

---

#### 🔁 Auto-Deploy on Push

Once connected, every `git push` to `main` will auto-deploy to Vercel. No manual steps needed!

---

## 🔐 Default Accounts

| Username | Role | Access |
|----------|------|--------|
| `admin` | Admin | Full access (upload, sync, manage) |
| `manager` | Account Manager | View & select companies only |

> ⚠️ Passwords are set in `prisma/seed.ts` — change before production use.

---

## 📋 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 16 App Router | Server-side API routes + React 19 client |
| Neon PostgreSQL | Serverless Postgres, works natively with Vercel |
| JWT (jose) | Stateless auth, no session store needed |
| Prisma ORM | Type-safe queries, easy migrations |
| Fuzzy name matching | CSV company names ≠ Raynet IDs — substring match resolves this |
| No export button | Removed per business decision — sync-only workflow |
| Idempotent sync | "Update contact list" can be clicked multiple times safely |

---

## 🐛 Known Edge Cases

- **CSV with no emails**: Shows warning "⚠️ X firem bez emailu v CSV"
- **Invalid emails**: Filtered out before Ecomail call (regex validation)
- **Duplicate emails**: Deduplicated per batch
- **Ecomail 422**: Usually means malformed emails slipped through — error shown in modal
- **Re-sync**: Campaign status changes to "Sent" but can still be re-synced

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

| User      | Password | Role            |
| --------- | -------- | --------------- |
| admin     | admin123 | Administrátor   |
| mariya    | pass123  | Account Manager |
| jan.novak | pass123  | Account Manager |
| petra     | pass123  | Account Manager |

---

## 🔌 External integrations

All integrations work in **mock mode** by default. Add API keys to `.env` to enable real connections.

| Service        | Env vars                             | Purpose                        |
| -------------- | ------------------------------------ | ------------------------------ |
| **Raynet CRM** | `RAYNET_API_KEY`, `RAYNET_INSTANCE`  | Company list                   |
| **Ecomail**    | `ECOMAIL_API_KEY`, `ECOMAIL_LIST_ID` | Email delivery                 |
| **Power BI**   | _(Excel export)_                     | Reporting via `.xlsx` download |

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
