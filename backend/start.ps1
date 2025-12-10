# Script para iniciar el backend del Taller Autos

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Backend - Taller Autos" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe el entorno virtual
if (-not (Test-Path ".venv")) {
    Write-Host "No se encontró el entorno virtual. Creándolo..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "Entorno virtual creado." -ForegroundColor Green
}

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Verificar si hay dependencias instaladas
if (-not (Test-Path ".venv\Lib\site-packages\fastapi")) {
    Write-Host ""
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "Dependencias instaladas." -ForegroundColor Green
}

# Verificar estructura de directorios
Write-Host ""
Write-Host "Verificando estructura de directorios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "uploads\images" | Out-Null
New-Item -ItemType Directory -Force -Path "uploads\processed" | Out-Null
New-Item -ItemType Directory -Force -Path "uploads\pdfs" | Out-Null
Write-Host "Directorios verificados." -ForegroundColor Green

# Iniciar servidor
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Servidor iniciando en:" -ForegroundColor Cyan
Write-Host "  http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

python main.py
