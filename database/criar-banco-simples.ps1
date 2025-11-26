# Script simplificado para criar o banco de dados
# Adiciona PostgreSQL ao PATH e cria o banco

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Criando Banco de Dados FeiraSmart" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Adicionar PostgreSQL ao PATH
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

Write-Host "✅ PostgreSQL 16 encontrado!" -ForegroundColor Green
Write-Host ""
Write-Host "Por favor, informe a senha do usuário 'postgres' quando solicitado." -ForegroundColor Yellow
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$schemaPath = Join-Path $scriptDir "schema.sql"

# Criar banco de dados
Write-Host "Criando banco de dados 'feira_smart'..." -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE feira_smart;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Banco criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Banco pode já existir. Continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Executando schema.sql..." -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d feira_smart -f $schemaPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " ✅ Banco de dados criado com sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $seedAnswer = Read-Host "Deseja popular com dados de exemplo? (S/N)"
    if ($seedAnswer -eq "S" -or $seedAnswer -eq "s") {
        $seedPath = Join-Path $scriptDir "seed.sql"
        Write-Host ""
        Write-Host "Executando seed.sql..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d feira_smart -f $seedPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dados de exemplo inseridos!" -ForegroundColor Green
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ Erro ao executar schema. Verifique a senha e tente novamente." -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




