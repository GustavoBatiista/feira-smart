# Script PowerShell para corrigir a constraint NOT NULL em feirante_id
# Este script executa o ALTER TABLE para tornar feirante_id nullable

Write-Host "`n🔧 Corrigindo constraint NOT NULL em feirante_id...`n" -ForegroundColor Cyan

# Solicitar informações de conexão
$host = Read-Host "Host do PostgreSQL (padrão: localhost)"
if ([string]::IsNullOrWhiteSpace($host)) { $host = "localhost" }

$port = Read-Host "Porta (padrão: 5432)"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "5432" }

$database = Read-Host "Nome do banco de dados"
if ([string]::IsNullOrWhiteSpace($database)) {
    Write-Host "❌ Nome do banco de dados é obrigatório!" -ForegroundColor Red
    exit 1
}

$user = Read-Host "Usuário PostgreSQL (padrão: postgres)"
if ([string]::IsNullOrWhiteSpace($user)) { $user = "postgres" }

Write-Host "`n🔐 Digite a senha do PostgreSQL:" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

Write-Host "`n📝 Executando ALTER TABLE...`n" -ForegroundColor Cyan

# Construir string de conexão
$connectionString = "Host=$host;Port=$port;Database=$database;Username=$user;Password=$password"

try {
    # Tentar usar Npgsql via .NET (se disponível)
    $sqlCommand = "ALTER TABLE public.produtos ALTER COLUMN feirante_id DROP NOT NULL;"
    
    # Verificar se psql está disponível
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    
    if ($psqlPath) {
        Write-Host "✅ Usando psql para executar o comando...`n" -ForegroundColor Green
        
        $env:PGPASSWORD = $password
        $command = "ALTER TABLE public.produtos ALTER COLUMN feirante_id DROP NOT NULL;"
        
        $result = echo $command | psql -h $host -p $port -U $user -d $database 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Constraint NOT NULL removida com sucesso!`n" -ForegroundColor Green
            
            # Verificar se foi aplicada
            Write-Host "🔍 Verificando se a alteração foi aplicada...`n" -ForegroundColor Cyan
            $checkCommand = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'produtos' AND column_name = 'feirante_id';"
            echo $checkCommand | psql -h $host -p $port -U $user -d $database
        } else {
            Write-Host "❌ Erro ao executar o comando:" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
        }
        
        $env:PGPASSWORD = $null
    } else {
        Write-Host "⚠️  psql não encontrado no PATH." -ForegroundColor Yellow
        Write-Host "`nExecute manualmente no seu cliente PostgreSQL:" -ForegroundColor White
        Write-Host "`nALTER TABLE public.produtos ALTER COLUMN feirante_id DROP NOT NULL;`n" -ForegroundColor Gray
        
        Write-Host "Ou instale o PostgreSQL client tools e tente novamente.`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao executar: $_" -ForegroundColor Red
    Write-Host "`nExecute manualmente no seu cliente PostgreSQL:" -ForegroundColor White
    Write-Host "`nALTER TABLE public.produtos ALTER COLUMN feirante_id DROP NOT NULL;`n" -ForegroundColor Gray
}

