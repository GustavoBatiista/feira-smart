# Script para verificar se a API está funcionando

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " VERIFICAR API - FeiraSmart" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se a porta 3001 está em uso
Write-Host "1. Verificando se API está rodando (porta 3001)..." -ForegroundColor White
$portCheck = netstat -ano | findstr :3001

if ($portCheck) {
    Write-Host "   ✅ Porta 3001 está em uso (API pode estar rodando)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Porta 3001 não está em uso (API não está rodando)" -ForegroundColor Red
    Write-Host "   💡 Inicie a API: cd server && npm run dev`n" -ForegroundColor Yellow
}

# Testar health check
Write-Host "`n2. Testando health check..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ API está respondendo!" -ForegroundColor Green
    Write-Host "   Resposta: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ API não está respondendo" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Verifique se a API está rodando em outro terminal" -ForegroundColor Yellow
}

# Verificar arquivo .env na raiz
Write-Host "`n3. Verificando arquivo .env na raiz..." -ForegroundColor White
if (Test-Path ".env") {
    Write-Host "   ✅ Arquivo .env existe" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_API_URL") {
        Write-Host "   ✅ VITE_API_URL está configurado" -ForegroundColor Green
        $envContent -split "`n" | Where-Object { $_ -match "VITE_API_URL" } | ForEach-Object {
            Write-Host "      $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  VITE_API_URL não encontrado no .env" -ForegroundColor Yellow
        Write-Host "   💡 Adicione: VITE_API_URL=http://localhost:3001/api" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Arquivo .env não existe na raiz" -ForegroundColor Red
    Write-Host "   💡 Crie o arquivo .env com: VITE_API_URL=http://localhost:3001/api" -ForegroundColor Yellow
}

# Verificar arquivo .env no server
Write-Host "`n4. Verificando arquivo server/.env..." -ForegroundColor White
if (Test-Path "server\.env") {
    Write-Host "   ✅ Arquivo server/.env existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ Arquivo server/.env não existe" -ForegroundColor Red
    Write-Host "   💡 Copie server/env.example.txt para server/.env e configure" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " FIM DA VERIFICAÇÃO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

