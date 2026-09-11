$root = $PSScriptRoot
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   VYOM SPACE MISSION DIGITAL TWIN       " -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[1/2] Starting Backend (FastAPI on port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root/vyom-backend'; python run.py"

Write-Host "[2/2] Starting Frontend (Vite on port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; npm run dev"

Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Frontend Web App: http://localhost:5173" -ForegroundColor Green
