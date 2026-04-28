# NewsLetterSender

Interní nástroj pro Benefit Plus — správa emailových kampaní pro account manažery.

---

## 🚀 Jak spustit

Existují dvě varianty — vyberte si podle toho, co máte k dispozici:

| Varianta | Potřeba admin práv | Náročnost |
|----------|-------------------|-----------|
| **A) S Dockerem** | ✅ Ano | Jednodušší (1 příkaz) |
| **B) Bez Dockeru** | ❌ Ne | Více kroků, ale funguje všude |

### Přihlašovací údaje (obě varianty)

| Uživatel | Heslo | Role |
|----------|-------|------|
| admin | admin123 | Administrátor |
| mariya | pass123 | Account Manager |
| jan.novak | pass123 | Account Manager |
| petra | pass123 | Account Manager |

---

## Varianta A) S Dockerem (doporučeno)

### Požadavky

- **Docker Desktop** — stáhněte z [docker.com](https://www.docker.com/products/docker-desktop/) (vyžaduje admin práva)
- **Git** — stáhněte z [git-scm.com](https://git-scm.com/)

### Spuštění

```bash
# 1. Stáhněte kód (pouze poprvé)
git clone https://github.com/maksym-mishchenko/NewsLetterSender.git
cd NewsLetterSender

# 2. Spusťte vše jedním příkazem
docker compose up --build
```

> ⏳ První spuštění trvá 2–5 minut. Další spuštění do 30 sekund.

### Otevřete v prohlížeči

| Co | Adresa |
|----|--------|
| **Aplikace** | [http://localhost:3000](http://localhost:3000) |
| **API (Swagger)** | [http://localhost:5000/swagger](http://localhost:5000/swagger) |

### Zastavení

```bash
docker compose down          # zastaví (data zůstanou)
docker compose down -v       # zastaví + smaže databázi
```

---

## Varianta B) Bez Dockeru (nevyžaduje admin práva)

### 1. Nainstalujte programy přes PowerShell

Otevřete **PowerShell** a spusťte tyto příkazy (nevyžadují admin práva):

#### .NET 10 SDK

```powershell
# Stáhne a nainstaluje .NET SDK do vašeho profilu
Invoke-WebRequest -Uri "https://dot.net/v1/dotnet-install.ps1" -OutFile "$env:TEMP\dotnet-install.ps1"
& "$env:TEMP\dotnet-install.ps1" -Channel 10.0

# Přidejte do PATH (spustit po každém otevření PowerShell, nebo přidejte do profilu)
$env:DOTNET_ROOT = "$env:LOCALAPPDATA\Microsoft\dotnet"
$env:PATH = "$env:DOTNET_ROOT;$env:DOTNET_ROOT\tools;$env:PATH"

# Ověření
dotnet --version
```

#### Node.js 22 (portable — bez instalátoru)

```powershell
# Stáhne Node.js jako ZIP a rozbalí do vašeho profilu
$nodeVersion = "v22.15.0"
$nodeUrl = "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip"
Invoke-WebRequest -Uri $nodeUrl -OutFile "$env:TEMP\node.zip"
Expand-Archive "$env:TEMP\node.zip" -DestinationPath "$env:LOCALAPPDATA\node" -Force

# Přidejte do PATH
$env:PATH = "$env:LOCALAPPDATA\node\node-$nodeVersion-win-x64;$env:PATH"

# Ověření
node --version
npm --version
```

#### PostgreSQL

PostgreSQL vyžaduje klasickou instalaci — stáhněte z [postgresql.org/download](https://www.postgresql.org/download/windows/).

> 💡 Při instalaci vyberte **"Install for current user"** pokud nemáte admin práva.
> Zapamatujte si heslo pro uživatele `postgres`. Výchozí port je `5432`.

#### Trvalé nastavení PATH (volitelné — aby fungoval po restartu)

Přidejte do svého PowerShell profilu (spustit jednou):

```powershell
# Vytvoří/upraví PowerShell profil
$profileContent = @"
`$env:DOTNET_ROOT = "`$env:LOCALAPPDATA\Microsoft\dotnet"
`$env:PATH = "`$env:DOTNET_ROOT;`$env:DOTNET_ROOT\tools;`$env:LOCALAPPDATA\node\node-v22.15.0-win-x64;`$env:PATH"
"@
New-Item -Path $PROFILE -ItemType File -Force | Out-Null
Add-Content -Path $PROFILE -Value $profileContent
```

### 2. Stáhněte kód

```bash
git clone https://github.com/maksym-mishchenko/NewsLetterSender.git
cd NewsLetterSender
```

### 3. Nastavte databázi

Otevřete **pgAdmin** (nainstaluje se s PostgreSQL) nebo **psql** a vytvořte databázi:

```sql
CREATE DATABASE newsletter_sender;
```

Pokud jste při instalaci PostgreSQL zadali jiné heslo než `postgres`, upravte soubor `src/NewsLetterSender.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=newsletter_sender;Username=postgres;Password=VAŠE_HESLO"
  }
}
```

### 4. Spusťte backend (API)

Otevřete **první** terminál/PowerShell:

```bash
cd NewsLetterSender

# Stáhněte závislosti a spusťte (poprvé to chvíli trvá)
dotnet run --project src/NewsLetterSender.Api --urls http://localhost:5000
```

> Počkejte, než se zobrazí: `Now listening on: http://localhost:5000`
> API automaticky vytvoří tabulky a naplní testovací data.

### 5. Spusťte frontend (web)

Otevřete **druhý** terminál/PowerShell:

```bash
cd NewsLetterSender/web

# Nainstalujte závislosti (pouze poprvé)
npm install

# Spusťte vývojový server
npm run dev
```

> Počkejte, než se zobrazí: `Ready on http://localhost:3000`

### 6. Otevřete v prohlížeči

| Co | Adresa |
|----|--------|
| **Aplikace** | [http://localhost:3000](http://localhost:3000) |
| **API (Swagger)** | [http://localhost:5000/swagger](http://localhost:5000/swagger) |

### Zastavení

V obou terminálech stiskněte **Ctrl+C**.

### Opětovné spuštění

Stačí znovu spustit kroky 4 a 5 (ne 1–3, ty se dělají jen poprvé).

---

## 🔌 Napojení na externí služby

Výchozí režim: **mock data** (testovací firmy, odesílání do konzole). Služby se zapínají jednotlivě — stačí přidat API klíče.

### Raynet CRM (seznam firem a kontaktů)

1. Přihlaste se do [app.raynet.cz](https://app.raynet.cz) → **Nastavení** → **API**
2. Vytvořte nový API klíč
3. Zapamatujte si **název instance** (z URL: `https://app.raynet.cz/api/v2` → instance je název vaší firmy v Raynet)
4. Přidejte do `docker-compose.yml` v sekci `api > environment`:

```yaml
    Raynet__ApiKey: "váš-raynet-api-klíč"
    Raynet__InstanceName: "benefitplus"
```

5. Restartujte: `docker compose down && docker compose up`

✅ Aplikace nyní načítá firmy přímo z Raynet CRM místo testovacích dat.

---

### Ecomail (odesílání emailů)

1. Přihlaste se do [ecomail.cz](https://app.ecomailapp.cz) → **Nastavení** → **API klíče**
2. Zkopírujte API klíč
3. Zjistěte **ID seznamu** kontaktů: **Seznamy kontaktů** → klikněte na seznam → ID je v URL (`/lists/ČÍSLO/...`)
4. Přidejte do `docker-compose.yml` v sekci `api > environment`:

```yaml
    Ecomail__ApiKey: "váš-ecomail-api-klíč"
    Ecomail__DefaultListId: "1"
```

5. Restartujte: `docker compose down && docker compose up`

✅ Při odeslání kampaně se kontakty synchronizují do Ecomail seznamu.

---

### Power BI (reporting a dashboardy)

Power BI se připojuje přímo k PostgreSQL databázi aplikace.

1. Otevřete **Power BI Desktop** → **Získat data** → **PostgreSQL databáze**
2. Zadejte:
   - **Server**: `localhost` (nebo IP počítače kde běží Docker)
   - **Port**: `5432`
   - **Databáze**: `newsletter_sender`
   - **Uživatel**: `postgres`
   - **Heslo**: `postgres`
3. Vyberte tabulky:
   - `campaigns` — seznam kampaní
   - `campaign_decisions` — rozhodnutí (ano/ne/možná) pro každou firmu
   - `audit_logs` — historie všech akcí (kdo, co, kdy)
   - `users` — uživatelé systému
4. Vytvořte si dashboardy a reporty

> 💡 **Tip**: Pro produkci nastavte silnější heslo databáze v `docker-compose.yml` (`POSTGRES_PASSWORD`).

---

### Kompletní příklad `docker-compose.yml` se všemi službami

```yaml
services:
  api:
    environment:
      # ... stávající nastavení ...
      Raynet__ApiKey: "váš-klíč"
      Raynet__InstanceName: "benefitplus"
      Ecomail__ApiKey: "váš-klíč"
      Ecomail__DefaultListId: "1"
```

Každou službu můžete zapnout nezávisle — nemusíte mít všechny klíče najednou.

---

## 🛠️ Řešení problémů

| Problém | Řešení |
|---------|--------|
| `port 5432 already allocated` | Jiná PostgreSQL běží. Zastavte ji nebo změňte port v `docker-compose.yml`. |
| `Cannot connect to Docker daemon` | Docker Desktop neběží. Spusťte ho. |
| Stránka se nenačítá | Počkejte ~30 s po `docker compose up`, služby se startují postupně. |
| Tmavé barvy v prohlížeči | Vypněte rozšíření Dark Reader. |

---

## 📁 Struktura projektu

```
NewsLetterSender/
├── src/                          # Backend (.NET 10)
│   ├── NewsLetterSender.Api/     # REST API, auth, endpointy
│   ├── NewsLetterSender.Core/    # Doménové modely, rozhraní
│   └── NewsLetterSender.Infrastructure/  # EF Core, Raynet, Ecomail
├── web/                          # Frontend (Next.js 15)
│   └── src/app/                  # React komponenty
├── docs/                         # PRD, mockupy
├── docker-compose.yml            # Spouští vše jedním příkazem
├── Dockerfile                    # Build backend image
└── README.md                     # Tento soubor
```

## 📊 Tech Stack

- **Backend**: ASP.NET Core 10, Entity Framework Core, PostgreSQL 17
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Auth**: JWT (dev) → Azure AD/Entra ID (produkce)
- **Integrace**: Raynet CRM, Ecomail (přepínatelné mock/real)
