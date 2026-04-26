# NewsLetterSender — Product Requirements Document (PRD)

## Requirements Description

### Background

- **Business Problem**: A benefit distribution company needs to coordinate email campaigns between the marketing department and account managers. Currently there is no centralized tool to plan which clients receive campaigns, track decisions per account manager, or maintain campaign history.
- **Target Users**: ~15 account managers + marketing department (1 admin)
- **Value Proposition**: Centralized campaign planning tool that connects Raynet CRM data, Power BI employee data, and Ecomail subscriber management — replacing manual coordination with a structured workflow.

### Feature Overview

- **Core Features**:
  1. Campaign management (create, edit, track status)
  2. Company selection per campaign (with filters)
  3. Integration with Raynet CRM for company/account manager data
  4. Integration with Power BI data lake for employee lists
  5. Integration with Ecomail to update subscriber lists
  6. Campaign history with filtering
- **Feature Boundaries**:
  - IN: Campaign planning, company selection, history tracking, Ecomail subscriber list updates
  - OUT: Actual email sending (Ecomail handles delivery), email template design, reporting/analytics
- **User Scenarios**:
  1. Admin creates a new campaign → account managers log in → filter by their name → select companies → save decisions → admin finalizes by updating database (Power BI fetch) → subscriber list is updated in Ecomail
  2. Any user views campaign history filtered by account manager, campaign name, or date

### User Roles

#### Administrator (Marketing Department)
- Only ONE admin user
- All marketing department logins are treated as admin
- **Exclusive capabilities**:
  - Create new campaigns (name, status, plan date)
  - Edit campaign properties
  - Click "Update Database" — queries Power BI data lake to fetch employee lists for selected companies, then updates the subscriber list in Ecomail
- Sees everything account managers see, plus admin controls

#### Account Manager (Regular User)
- ~15 users
- **Capabilities**:
  - View list of campaigns
  - Click into a campaign → see table of ~190 companies eligible to receive it
  - Filter companies by:
    - Account manager (deduplicated from nested Raynet data)
    - System type: Muza (if `Muza_ID` is filled) or BP1 (if only `BenefitPlusOne_ID`)
  - Check/uncheck companies for the campaign
  - See a summary of selected companies above the table (before saving)
  - Save their selections
  - View campaign history

### Detailed Requirements

#### Campaign Entity
| Property   | Type   | Notes                          |
|------------|--------|--------------------------------|
| `id`       | UUID   | Auto-generated                 |
| `name`     | string | Required, set by admin         |
| `status`   | enum   | `processed` or `sent`          |
| `plan_date`| date   | Planned send date              |
| `created_at`| timestamp | Auto                        |
| `updated_at`| timestamp | Auto                        |

#### Company Selection (Decision) Entity
| Property      | Type    | Notes                                    |
|---------------|---------|------------------------------------------|
| `id`          | UUID    | Auto-generated                           |
| `campaign_id` | FK      | References campaign                      |
| `company_id`  | string  | Raynet company ID                        |
| `company_name`| string  | Cached from Raynet                       |
| `selected`    | boolean | Whether this company receives the campaign |
| `decided_by`  | string  | Account manager who made the decision    |
| `decided_at`  | timestamp | When the decision was saved             |

#### Raynet API Integration
- **Endpoint**: `GET /api/getCompanies` (with `active` filter)
- **API Docs**: https://app.raynet.cz/api/doc/
- **Response contains** (per company):
  - Company ID, name
  - Nested `account_managers` array (needs deduplication for filter)
  - `BenefitPlusOne_ID` — ID in the BP1 system
  - `Muza_ID` — if filled, client is on Muza; otherwise BP1
- **Auth**: TBD — investigate Raynet API authentication (likely API key or OAuth)

#### Power BI Data Lake Integration
- **Purpose**: Fetch employee lists for selected companies
- **Trigger**: Admin clicks "Update Database" after all account managers have made their selections
- **Data relationship**: Each company → list of employees (email recipients)
- **Connection method**: ⚠️ **INVESTIGATION REQUIRED** — determine whether this is:
  - Power BI REST API
  - Direct connection to underlying Azure SQL / Data Lake Storage
  - Export/dataset query
- **Output**: Employee list passed to Ecomail to update subscriber list

#### Ecomail Integration
- **Purpose**: Update subscriber list with employee emails for the campaign (does NOT send emails)
- **Trigger**: After Power BI data fetch completes
- **API Docs**: https://support.ecomail.cz/cs/articles/66536-api-pro-praci-s-ecomailem
- **Flow**: Collected employee emails → Ecomail API → subscriber list updated in Ecomail
- **Auth**: API key (from Ecomail account)

#### Company Table UI
- **Data source**: Only **active** companies from Raynet CRM (`GET /api/getCompanies` with `active` filter). Inactive/archived companies are never shown.
- Columns: Company ID | Company Name | Account Manager | System Type | Selected (checkbox) | Save button
- **Filters above table**:
  - Search (by company name or account manager)
  - Account Manager dropdown (deduplicated list from Raynet)
  - System Type: All / Muza / BP1
  - Clear Filters button
- **Selection summary**: Panel above table showing currently checked companies (before save)
- **Save behavior**: Persists decisions to PostgreSQL; dynamically refreshes table to show saved state
- **Table header label**: "Clients — Active clients from Raynet CRM" to clarify data source

#### History View
- Table of past campaigns
- **Filters**:
  - Account manager (which AM handled which clients)
  - Campaign name
  - Date / date range
- **Data shown**: Campaign name, send date, which clients received it (filterable by AM)

### Edge Cases
- Account manager opens campaign with 190 companies — needs pagination or virtual scrolling
- Two account managers save decisions for the same campaign simultaneously → last save wins (simple overwrite per company, not per campaign)
- Raynet API is down → show cached data or error message
- Power BI connection fails → admin gets clear error, can retry
- Company exists in Raynet but has no employees in data lake → flag in UI

## UI Design Specification

### Design Reference
- **Brand style**: Aligned with [muza.cz](https://www.muza.cz/cz) — clean, modern, professional
- **Primary color**: Purple/violet (`#9333ea` or similar) — used for CTAs, active states, highlights
- **Layout**: Two-column dashboard — left sidebar + right main content area
- **Typography**: Clean sans-serif (Inter or system font stack)
- **Cards**: White background with subtle border/shadow, rounded corners

### Layout — Default (≥ 1440px, sidebar open)

Two-column layout: **left sidebar (25%)** + **right main area (75%)**

#### Header

```
 Newsletter Recipients                                    [⚡ Send]
```

#### Left Sidebar

```
 ┌─ Campaigns ──────────────────────┐
 │                                  │
 │  [+  New]  (purple, full-width)  │
 │                                  │
 │  ID    Campaign                  │
 │  ──────────────                  │
 │  1     Slevomat    ← selected    │
 │  2     VIP                       │
 │  3     Churn Risk                │
 │                                  │
 │  3 results    🔽 📥 🔄           │
 └──────────────────────────────────┘

 ┌─ History ────────────────────────┐
 │                                  │
 │  Timestamp              Campaign │
 │  ────────────────────────────    │
 │  Mar 15, 2026 12:00    Slevomat │
 │  Mar 15, 2026 12:00    Slevomat │
 │  ...                             │
 └──────────────────────────────────┘
```

#### Right Main Area

```
 ┌─ Filters ────────────────────────────────────────────────────┐
 │                                                              │
 │  Search clients        Account manager       System type     │
 │  [_______________]     [▼ mariya@...]        [▼ All     ]    │
 │                                                              │
 │                                              [✕ Clear]       │
 └──────────────────────────────────────────────────────────────┘

 ┌─ Selection Summary ──────────┐
 │                               │
 │  Selected clients: 0    📋   │
 │  In this campaign             │
 └───────────────────────────────┘

 ┌─ Clients ─────────────────────────────── [💾 Save selection] ┐
 │                                                               │
 │  client_id    client_name ↕    Typ systému     Selected       │
 │  ───────────────────────────────────────────────────────      │
 │  101          Acme Corp        Muza            ☑             │
 │  102          Beta Ltd         BP1              ☐             │
 │  103          Gamma s.r.o.     Muza            ☑             │
 │  ...                                                          │
 └───────────────────────────────────────────────────────────────┘
```

### Layout — Collapsed (1024–1439px, small laptops)

Sidebar collapses to a **thin icon rail (48px)**. Main area takes **~95% width**.

```
 ☰ Newsletter Recipients                                 [⚡ Send]
 ┌────┬────────────────────────────────────────────────────────────┐
 │    │                                                            │
 │ 📋 │  Filters                                                   │
 │ 3  │  ┌────────────────────────────────────────────────────┐    │
 │    │  │ Search clients     ACM [▼ mariya@..]  System [▼ All] │  │
 │ 📜 │  │                                       [✕ Clear]     │  │
 │    │  └────────────────────────────────────────────────────┘    │
 │    │                                                            │
 │    │  Selected clients: 0  In this campaign                     │
 │    │                                                            │
 │    │  Clients                              [💾 Save selection]  │
 │    │  ┌──────────────────────────────────────────────────────┐  │
 │    │  │ client_id  client_name ↕   Typ systému    Selected   │  │
 │    │  │ ─────────────────────────────────────────────────    │  │
 │    │  │ 101        Acme Corp       Muza           ☑         │  │
 │    │  │ 102        Beta Ltd        BP1             ☐         │  │
 │    │  │ 103        Gamma s.r.o.    Muza           ☑         │  │
 │    │  └──────────────────────────────────────────────────────┘  │
 └────┴────────────────────────────────────────────────────────────┘

 Icon rail:  📋 = Campaigns (badge shows count)
             📜 = History
 Click ☰ or any icon → sidebar expands as overlay
```

### Layout — Sidebar Overlay (when expanded on small screen)

```
 ☰ Newsletter Recipients                                 [⚡ Send]
 ┌──────────────────────────┬──────────────────────────────────────┐
 │                          │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  Campaigns               │░░░░░░░░░░ dimmed backdrop ░░░░░░░░░░│
 │  [+  New]                │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │                          │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  ID   Campaign           │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  ───────────             │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  1    Slevomat  ←        │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  2    VIP                │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  3    Churn Risk         │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │                          │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  History                 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  ───────────             │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  Mar 15  Slevomat        │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 │  Mar 15  Slevomat        │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
 └──────────────────────────┴──────────────────────────────────────┘

 Click backdrop or ☰ → sidebar closes back to icon rail
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| **≥ 1440px** (large desktop) | Sidebar open (25%), main area (75%) — default layout |
| **1024–1439px** (small laptop) | Sidebar **collapsed by default** — shows only campaign icons; click hamburger `☰` to expand as overlay |
| **< 1024px** (tablet — unlikely but safe) | Sidebar fully hidden behind hamburger; main area takes 100% width |

- **Toggle button**: `☰` icon in the header (left side) to open/close sidebar
- **Collapsed state**: Sidebar shrinks to ~48px with just icons (campaign count badge, history icon)
- **Expanded state**: Sidebar slides over the main content as an overlay with slight backdrop
- **Persistence**: Sidebar state saved in `localStorage` so it remembers user preference

### Left Sidebar (~25% width, collapsible)
1. **Campaigns panel**
   - Purple "➕ New" button (full-width, admin only)
   - Campaigns table: `ID` | `Campaign` columns
   - Selected campaign highlighted with purple/lavender background
   - Result count below table (e.g., "3 results")
   - Small action icons: filter, download, refresh
2. **History panel** (below campaigns)
   - Table: `Timestamp` | `Campaign` columns
   - Sorted by date descending
   - Scrollable independently

### Right Main Area (~75% width)
1. **Filter bar** (top)
   - "Search clients" text input
   - "Account manager (ACM)" dropdown (deduplicated list)
   - "System type" dropdown — options: All / Muza / BP1
   - "✕ Clear" button to reset filters
2. **Selection summary card**
   - Shows count of selected clients: "Selected clients: **N** — In this campaign"
   - Small icon/badge
3. **Clients table**
   - Header: `client_id` | `client_name ↕` (sortable) | `Typ systému` | `Selected` (checkbox)
   - Rows are the filtered company list
   - Sortable by client_name
4. **"💾 Save selection" button** — purple, top-right of clients section

### Header Bar
- Title: "Newsletter Recipients" (left-aligned, bold)
- **"Send"** button — purple/primary with icon (top-right, admin only)

### Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#9333ea` (purple-600) | Buttons, active states, highlights |
| `--primary-light` | `#f3e8ff` (purple-50) | Selected row background |
| `--primary-hover` | `#7e22ce` (purple-700) | Button hover states |
| `--bg-page` | `#f9fafb` (gray-50) | Page background |
| `--bg-card` | `#ffffff` | Cards, panels |
| `--border` | `#e5e7eb` (gray-200) | Card borders, table dividers |
| `--text-primary` | `#111827` (gray-900) | Main text |
| `--text-secondary` | `#6b7280` (gray-500) | Labels, subtitles |

### Component Library
Use **Tailwind CSS** with **shadcn/ui** components for consistent styling:
- `<Button>` — primary (purple), secondary (outlined), destructive
- `<Table>` — with sortable headers
- `<Select>` — for dropdowns (account manager, system type)
- `<Input>` — search fields
- `<Checkbox>` — client selection
- `<Card>` — panels (campaigns, selected summary)
- `<Badge>` — status indicators

## Design Decisions

### Technical Approach

- **Architecture**: Monorepo with separate backend (ASP.NET Core 9 Web API) and frontend (Next.js 15 + React 19 + TypeScript)
- **API Style**: RESTful JSON API
- **Auth (POC)**: Username/password with JWT tokens
- **Auth (Production)**: Azure AD / Entra ID SSO (all users have Microsoft accounts)
- **Key Components**:
  - `NewsLetterSender.Api` — ASP.NET Core Web API
  - `NewsLetterSender.Core` — Domain models, interfaces
  - `NewsLetterSender.Infrastructure` — EF Core, external API clients (Raynet, Ecomail, Power BI)
  - `newsletter-sender-web` — Next.js frontend

### Data Storage

- **Database**: PostgreSQL
- **ORM**: Entity Framework Core with Npgsql provider
- **Schema**: Campaigns, CompanyDecisions, Users, CampaignHistory
- **Caching**: In-memory cache for Raynet company list (refresh on demand)

### Constraints

- **Performance**: ~15 concurrent users, ~190 companies per campaign — lightweight load
- **Compatibility**: Modern browsers (Chrome, Edge — internal tool)
- **Security**:
  - JWT auth for API
  - Role-based access (admin vs regular user)
  - API keys stored in environment variables / secrets (never in code)
  - HTTPS required in production
- **Scalability**: Current scale is sufficient; no need for horizontal scaling in POC

### Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Power BI data lake connection method unknown | High — blocks employee fetch feature | Investigate early; mock data as fallback |
| Raynet API rate limits or auth complexity | Medium | Cache company data; test auth in spike |
| Ecomail API changes | Low | Abstract behind interface; version pin |
| Single admin user is bottleneck | Medium | Design allows promoting additional admins later |

## Acceptance Criteria

### Functional Acceptance
- [ ] Admin can create a campaign with name, status, and plan date
- [ ] Admin can edit existing campaign properties
- [ ] Regular users see a list of all campaigns
- [ ] Clicking a campaign shows ~190 companies from Raynet
- [ ] Companies can be filtered by account manager (deduplicated)
- [ ] Companies can be filtered by system type (Muza vs BP1)
- [ ] Users can check/uncheck companies and see a selection summary
- [ ] Save button persists selections to PostgreSQL
- [ ] Admin "Update Database" fetches employees from Power BI data lake
- [ ] Admin "Update Database" updates subscriber list in Ecomail (does not send)
- [ ] Campaign history shows past campaigns with filters (AM, name, date)
- [ ] Only admin can create/edit campaigns and trigger "Update Database"

### Quality Standards
- [ ] Code follows C# conventions (nullable reference types, async/await)
- [ ] TypeScript strict mode on frontend
- [ ] Unit tests for business logic (xUnit for .NET, Jest/Vitest for frontend)
- [ ] API endpoints documented with OpenAPI/Swagger
- [ ] No secrets committed to source control

### User Acceptance
- [ ] Account manager can complete full workflow in under 5 minutes
- [ ] Table loads within 3 seconds with 190 companies
- [ ] Clear error messages when external APIs fail
- [ ] Mobile-responsive is NOT required (internal desktop tool)

## Execution Phases

### Phase 1: Foundation & POC Setup
**Goal**: Project scaffolding, database, and auth
- [ ] Initialize ASP.NET Core Web API project with solution structure
- [ ] Initialize Next.js frontend project
- [ ] Set up PostgreSQL with EF Core (migrations, seed data)
- [ ] Implement basic auth (username/password + JWT) for POC
- [ ] Create user roles (Admin, AccountManager)
- [ ] Set up Swagger/OpenAPI documentation
- **Deliverables**: Running API + frontend locally, auth working, DB seeded

### Phase 2: Campaign Management
**Goal**: Core campaign CRUD and company selection
- [ ] Campaign CRUD API endpoints (admin-only create/edit)
- [ ] Campaign list page (frontend)
- [ ] Raynet API client — fetch companies with account managers
- [ ] Company table with filters (account manager, system type)
- [ ] Checkbox selection with summary panel
- [ ] Save decisions to database
- **Deliverables**: Account managers can select companies per campaign

### Phase 3: External Integrations
**Goal**: Power BI and Ecomail connections
- [ ] Investigate and implement Power BI data lake connection
- [ ] "Update Database" flow — fetch employees for selected companies
- [ ] Ecomail API client — update subscriber list with employee emails
- [ ] Admin finalization workflow (Power BI → Ecomail subscriber update)
- **Deliverables**: Full end-to-end campaign creation workflow

### Phase 4: History & Polish
**Goal**: Campaign history and production readiness
- [ ] Campaign history API and UI
- [ ] History filters (account manager, campaign name, date)
- [ ] Error handling for all external API failures
- [ ] UI polish, loading states, empty states
- [ ] Production auth investigation (Azure AD SSO)
- **Deliverables**: Complete feature set, ready for deployment planning

### Phase 5: Deployment (Future)
**Goal**: Production deployment
- [ ] Determine deployment target (Azure App Service vs on-prem IIS)
- [ ] CI/CD pipeline
- [ ] Azure AD SSO integration
- [ ] Production PostgreSQL setup
- [ ] Monitoring and logging
- **Deliverables**: Production-ready deployment

---

**Document Version**: 1.0
**Created**: 2026-04-26
**Clarification Rounds**: 4
**Quality Score**: 91/100

### Open Investigation Items
1. **Power BI data lake connection** — determine access method (REST API, direct SQL, Azure Data Lake)
2. **Raynet API auth** — test API key or OAuth setup
3. **Production deployment target** — Azure App Service vs on-prem IIS
4. **Azure AD SSO** — implementation details for production auth
