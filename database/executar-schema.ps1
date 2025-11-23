# Script para executar o schema.sql no banco feira_smart
# Você pode executar este script ou copiar o conteúdo do schema.sql no pgAdmin

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Executando Schema no Banco de Dados" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Adicionar PostgreSQL ao PATH
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$schemaPath = Join-Path $scriptDir "schema.sql"

Write-Host "Opção 1: Executar via PowerShell (vai pedir senha)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Comando:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -d feira_smart -f schema.sql" -ForegroundColor White
Write-Host ""

$executar = Read-Host "Deseja executar agora? (S/N)"

if ($executar -eq "S" -or $executar -eq "s") {
    Write-Host ""
    Write-Host "Executando schema.sql..." -ForegroundColor Yellow
    Write-Host "Digite a senha quando solicitado: postgres" -ForegroundColor Cyan
    Write-Host ""
    
    & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d feira_smart -f $schemaPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host " ✅ Schema executado com sucesso!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Tabelas criadas:" -ForegroundColor Yellow
        Write-Host "  - profiles" -ForegroundColor White
        Write-Host "  - feiras" -ForegroundColor White
        Write-Host "  - feirantes" -ForegroundColor White
        Write-Host "  - produtos" -ForegroundColor White
        Write-Host "  - pedidos" -ForegroundColor White
        Write-Host "  - pedido_itens" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "Para executar via pgAdmin 4:" -ForegroundColor Yellow
    Write-Host "1. Clique com botão direito no banco 'feira_smart'" -ForegroundColor White
    Write-Host "2. Selecione 'Query Tool'" -ForegroundColor White
    Write-Host "3. Abra o arquivo schema.sql (Ctrl+O)" -ForegroundColor White
    Write-Host "4. Execute (F5)" -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione Enter para sair"

