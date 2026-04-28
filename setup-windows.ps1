# =============================================================
# NewsLetterSender — Instalace na Windows (bez admin prav)
# =============================================================
# Spusteni: Otevrete PowerShell a zadejte:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
#   .\setup-windows.ps1
# =============================================================

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NewsLetterSender — Setup pro Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. .NET 10 SDK ---
Write-Host "[1/4] Instalace .NET 10 SDK..." -ForegroundColor Yellow

$dotnetRoot = "$env:LOCALAPPDATA\Microsoft\dotnet"
if (Test-Path "$dotnetRoot\dotnet.exe") {
    $currentVersion = & "$dotnetRoot\dotnet.exe" --version 2>$null
    if ($currentVersion -like "10.*") {
        Write-Host "  .NET $currentVersion uz je nainstalovany. Preskakuji." -ForegroundColor Green
    } else {
        Write-Host "  Nalezena verze $currentVersion, instaluji .NET 10..."
        Invoke-WebRequest -Uri "https://dot.net/v1/dotnet-install.ps1" -OutFile "$env:TEMP\dotnet-install.ps1" -UseBasicParsing
        & "$env:TEMP\dotnet-install.ps1" -Channel 10.0
    }
} else {
    Invoke-WebRequest -Uri "https://dot.net/v1/dotnet-install.ps1" -OutFile "$env:TEMP\dotnet-install.ps1" -UseBasicParsing
    & "$env:TEMP\dotnet-install.ps1" -Channel 10.0
}

$env:DOTNET_ROOT = $dotnetRoot
$env:PATH = "$dotnetRoot;$dotnetRoot\tools;$env:PATH"
Write-Host "  .NET verze: $(dotnet --version)" -ForegroundColor Green

# --- 2. Node.js 22 ---
Write-Host ""
Write-Host "[2/4] Instalace Node.js 22..." -ForegroundColor Yellow

$nodeVersion = "v22.15.0"
$nodeDir = "$env:LOCALAPPDATA\node\node-$nodeVersion-win-x64"

if (Test-Path "$nodeDir\node.exe") {
    Write-Host "  Node.js $nodeVersion uz je nainstalovany. Preskakuji." -ForegroundColor Green
} else {
    $nodeZip = "$env:TEMP\node-$nodeVersion.zip"
    $nodeUrl = "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip"
    
    Write-Host "  Stahuji Node.js $nodeVersion (~30 MB)..."
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing
    
    $fileSize = (Get-Item $nodeZip).Length / 1MB
    if ($fileSize -lt 20) {
        Write-Host "  CHYBA: Soubor je prilis maly ($([math]::Round($fileSize,1)) MB). Stahnete Node.js rucne z nodejs.org" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  Rozbaluji..."
    Expand-Archive -Path $nodeZip -DestinationPath "$env:LOCALAPPDATA\node" -Force
    Remove-Item $nodeZip -Force
}

$env:PATH = "$nodeDir;$env:PATH"
Write-Host "  Node verze: $(node --version)" -ForegroundColor Green
Write-Host "  npm verze: $(npm --version)" -ForegroundColor Green

# --- 3. Nastaveni PATH pro pristi spusteni ---
Write-Host ""
Write-Host "[3/4] Nastaveni PATH..." -ForegroundColor Yellow

$profileContent = @"

# --- NewsLetterSender PATH ---
`$env:DOTNET_ROOT = "`$env:LOCALAPPDATA\Microsoft\dotnet"
`$env:PATH = "`$env:DOTNET_ROOT;`$env:DOTNET_ROOT\tools;`$env:LOCALAPPDATA\node\node-$nodeVersion-win-x64;`$env:PATH"
"@

if (Test-Path $PROFILE) {
    $existing = Get-Content $PROFILE -Raw
    if ($existing -like "*NewsLetterSender PATH*") {
        Write-Host "  PowerShell profil uz obsahuje PATH nastaveni. Preskakuji." -ForegroundColor Green
    } else {
        Add-Content -Path $PROFILE -Value $profileContent
        Write-Host "  PATH pridan do PowerShell profilu." -ForegroundColor Green
    }
} else {
    New-Item -Path $PROFILE -ItemType File -Force | Out-Null
    Set-Content -Path $PROFILE -Value $profileContent
    Write-Host "  PowerShell profil vytvoren s PATH nastavenim." -ForegroundColor Green
}

# --- 4. Instalace NPM zavislosti ---
Write-Host ""
Write-Host "[4/4] Instalace frontend zavislosti..." -ForegroundColor Yellow

if (Test-Path "web\package.json") {
    Push-Location web
    npm install --silent 2>$null
    Pop-Location
    Write-Host "  npm zavislosti nainstalovany." -ForegroundColor Green
} else {
    Write-Host "  Slozka web/ nenalezena. Preskakuji npm install." -ForegroundColor Yellow
}

# --- Hotovo ---
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INSTALACE DOKONCENA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pro spusteni aplikace:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Ujistete se, ze PostgreSQL bezi a databaze 'newsletter_sender' existuje" -ForegroundColor White
Write-Host ""
Write-Host "  2. Spusteni API (prvni okno PowerShell):" -ForegroundColor White
Write-Host "     dotnet run --project src/NewsLetterSender.Api --urls http://localhost:5000" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Spusteni frontendu (druhe okno PowerShell):" -ForegroundColor White
Write-Host "     cd web; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Otevrete http://localhost:3000" -ForegroundColor White
Write-Host "     Prihlaseni: admin / admin123" -ForegroundColor Gray
Write-Host ""
