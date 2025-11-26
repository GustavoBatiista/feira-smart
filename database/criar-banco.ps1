# Script PowerShell para criar o banco de dados FeiraSmart
# Requer PostgreSQL instalado e no PATH

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Criando Banco de Dados FeiraSmart" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se psql está disponível
try {
    $psqlVersion = & psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "psql não encontrado"
    }
    Write-Host "✅ PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o PostgreSQL primeiro:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Certifique-se de que o PostgreSQL está no PATH do Windows." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Solicitar informações do banco
Write-Host "Por favor, informe os dados de conexão:" -ForegroundColor Yellow
Write-Host ""

$DB_USER = Read-Host "Usuário (padrão: postgres)"
if ([string]::IsNullOrWhiteSpace($DB_USER)) {
    $DB_USER = "postgres"
}

$securePassword = Read-Host "Senha do usuário $DB_USER" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$DB_HOST = Read-Host "Host (padrão: localhost)"
if ([string]::IsNullOrWhiteSpace($DB_HOST)) {
    $DB_HOST = "localhost"
}

$DB_PORT = Read-Host "Porta (padrão: 5432)"
if ([string]::IsNullOrWhiteSpace($DB_PORT)) {
    $DB_PORT = "5432"
}

$DB_NAME = "feira_smart"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Configuração:" -ForegroundColor Cyan
Write-Host " Host: $DB_HOST" -ForegroundColor White
Write-Host " Porta: $DB_PORT" -ForegroundColor White
Write-Host " Usuário: $DB_USER" -ForegroundColor White
Write-Host " Banco: $DB_NAME" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Definir variável de ambiente para senha
$env:PGPASSWORD = $DB_PASSWORD

# Obter diretório atual do script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Criar banco de dados
Write-Host "Criando banco de dados..." -ForegroundColor Yellow
$createDbResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>&1
if ($LASTEXITCODE -ne 0) {
    if ($createDbResult -like "*already exists*") {
        Write-Host "⚠️  Banco já existe. Continuando..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ ERRO ao criar banco de dados:" -ForegroundColor Red
        Write-Host $createDbResult -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "✅ Banco de dados criado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# Executar schema
$schemaPath = Join-Path $scriptDir "schema.sql"
Write-Host "Executando schema.sql..." -ForegroundColor Yellow
$schemaResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $schemaPath 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO ao executar schema.sql:" -ForegroundColor Red
    Write-Host $schemaResult -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
} else {
    Write-Host "✅ Schema executado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# Perguntar sobre seed
$seedAnswer = Read-Host "Deseja popular com dados de exemplo? (S/N)"
if ($seedAnswer -eq "S" -or $seedAnswer -eq "s" -or $seedAnswer -eq "Sim" -or $seedAnswer -eq "sim") {
    Write-Host ""
    Write-Host "Executando seed.sql..." -ForegroundColor Yellow
    $seedPath = Join-Path $scriptDir "seed.sql"
    $seedResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $seedPath 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Aviso ao executar seed.sql:" -ForegroundColor Yellow
        Write-Host $seedResult -ForegroundColor Yellow
    } else {
        Write-Host "✅ Dados de exemplo inseridos com sucesso!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ✅ Pronto! Configure as variáveis de ambiente:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "DB_HOST=$DB_HOST" -ForegroundColor White
Write-Host "DB_PORT=$DB_PORT" -ForegroundColor White
Write-Host "DB_NAME=$DB_NAME" -ForegroundColor White
Write-Host "DB_USER=$DB_USER" -ForegroundColor White
Write-Host "DB_PASSWORD=$DB_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "Ou use DATABASE_URL:" -ForegroundColor Yellow
Write-Host "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -ForegroundColor White
Write-Host ""

# Limpar senha da memória
$DB_PASSWORD = ""
$env:PGPASSWORD = ""

Read-Host "Pressione Enter para sair"




