# NewsLetterSender

Interní nástroj pro Benefit Plus — správa emailových kampaní pro account manažery.

---

## 🚀 Jak spustit (krok za krokem)

### Požadavky

Na počítači musíte mít nainstalovaný **Docker Desktop**:

1. Stáhněte z [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Nainstalujte a spusťte (ikona velryby v systémové liště)
3. Počkejte, než se Docker nastartuje (zelená ikona = připraveno)

### Spuštění aplikace

Otevřete **Terminál** (macOS) nebo **PowerShell** (Windows) a spusťte:

```bash
# 1. Stáhněte kód (pouze poprvé)
git clone https://github.com/Konopl9/NewsLetterSender.git
cd NewsLetterSender

# 2. Spusťte vše jedním příkazem
docker compose up --build
```

> ⏳ První spuštění trvá 2–5 minut (stahuje se .NET, Node.js, PostgreSQL).
> Další spuštění už jsou do 30 sekund.

### Otevřete v prohlížeči

| Co | Adresa |
|----|--------|
| **Aplikace** | [http://localhost:3000](http://localhost:3000) |
| **API (Swagger)** | [http://localhost:5000/swagger](http://localhost:5000/swagger) |

### Přihlášení

| Uživatel | Heslo | Role |
|----------|-------|------|
| admin | admin123 | Administrátor |
| mariya | pass123 | Account Manager |
| jan.novak | pass123 | Account Manager |
| petra | pass123 | Account Manager |

---

## ⏹️ Zastavení

```bash
docker compose down          # zastaví kontejnery (data zůstanou)
docker compose down -v       # zastaví + smaže databázi
```

Pro opětovné spuštění:

```bash
docker compose up
```

(Bez `--build` — pokud jste nezměnili kód.)

---

## 🔌 Napojení na Raynet a Ecomail (produkce)

Výchozí režim: **mock data** (testovací firmy). Pro napojení na reálné API přidejte klíče do `docker-compose.yml` v sekci `api > environment`:

```yaml
api:
  environment:
    Raynet__ApiKey: "váš-raynet-api-klíč"
    Raynet__InstanceName: "benefitplus"
    Ecomail__ApiKey: "váš-ecomail-api-klíč"
    Ecomail__DefaultListId: "1"
```

Poté restartujte: `docker compose down && docker compose up`

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
