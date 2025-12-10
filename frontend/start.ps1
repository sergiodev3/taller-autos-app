# Script para iniciar el frontend del Taller Autos

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Frontend - Taller Autos" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "No se encontraron las dependencias. Instalando..." -ForegroundColor Yellow
    npm install
    Write-Host "Dependencias instaladas." -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Servidor de desarrollo iniciando en:" -ForegroundColor Cyan
Write-Host "  http://localhost:5173" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev
