# Script para iniciar backend en red local
# Uso: .\start-network.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Taller Autos - Backend (Red Local)  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
.\.venv\Scripts\activate

# Obtener IP local
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "✓ Backend estará disponible en:" -ForegroundColor Green
Write-Host "  - Local:   http://localhost:8000" -ForegroundColor White
Write-Host "  - Red:     http://${ipAddress}:8000" -ForegroundColor White
Write-Host "  - Swagger: http://${ipAddress}:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "⚠ Asegúrate de que el firewall permita conexiones al puerto 8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
