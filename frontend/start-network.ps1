# Script para iniciar frontend en red local
# Uso: .\start-network.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Taller Autos - Frontend (Red Local)  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtener IP local
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress

Write-Host "⚠ IMPORTANTE: Verifica que frontend/.env tenga:" -ForegroundColor Yellow
Write-Host "   VITE_API_URL=http://${ipAddress}:8000" -ForegroundColor White
Write-Host ""
Write-Host "✓ Frontend estará disponible en:" -ForegroundColor Green
Write-Host "  - Local:   http://localhost:5173" -ForegroundColor White
Write-Host "  - Red:     http://${ipAddress}:5173" -ForegroundColor White
Write-Host ""
Write-Host "📱 Desde tu celular abre: http://${ipAddress}:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor con acceso de red
npm run dev -- --host
