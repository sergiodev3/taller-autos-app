# Script de inicio completo - Taller Autos

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SISTEMA TALLER AUTOS" -ForegroundColor Cyan
Write-Host "  Iniciando Backend y Frontend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar Backend en una nueva ventana
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\start.ps1"

# Esperar 5 segundos para que el backend inicie
Start-Sleep -Seconds 5

# Iniciar Frontend en una nueva ventana
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; .\start.ps1"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ¡Sistema iniciado!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cierra las ventanas de PowerShell para detener los servidores" -ForegroundColor Yellow
