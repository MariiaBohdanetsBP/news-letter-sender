# NewsLetterSender

Internal tool for Benefit Plus — email campaign management for account managers.

## Quick Start (Docker only — no .NET SDK needed)

```bash
git clone <repo-url>
cd NewsLetterSender
docker compose up --build
```

The API will be available at **http://localhost:5000**. Swagger UI at **http://localhost:5000/swagger**.

## Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| mariya | pass123 | Account Manager |
| jan.novak | pass123 | Account Manager |
| petra | pass123 | Account Manager |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/campaigns` | List active campaigns |
| GET | `/api/campaigns/history` | List sent campaigns |
| POST | `/api/campaigns` | Create campaign |
| PUT | `/api/campaigns/{id}/rename` | Rename campaign |
| GET | `/api/campaigns/{id}/decisions` | Get company decisions |
| PUT | `/api/campaigns/{id}/decisions` | Save company decisions |
| GET | `/health` | Health check |

## Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Stop

```bash
docker compose down        # stop containers
docker compose down -v     # stop + delete database data
```

## Tech Stack

- **Backend**: ASP.NET Core 10, EF Core, PostgreSQL
- **Frontend**: Next.js 15 (coming soon)
- **Auth**: JWT (dev) → Azure AD/Entra ID (production)
