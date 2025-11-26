@echo off
REM Script para criar o banco de dados FeiraSmart no Windows
REM Requer PostgreSQL instalado e no PATH

echo ========================================
echo  Criando Banco de Dados FeiraSmart
echo ========================================
echo.

REM Verificar se psql está disponível
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: PostgreSQL nao encontrado!
    echo.
    echo Por favor, instale o PostgreSQL primeiro:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo Certifique-se de que o PostgreSQL esta no PATH do Windows.
    pause
    exit /b 1
)

echo PostgreSQL encontrado!
echo.

REM Solicitar informações do banco
echo Por favor, informe os dados de conexao:
echo.
set /p DB_USER="Usuario (padrao: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_PASSWORD="Senha do usuario %DB_USER%: "
if "%DB_PASSWORD%"=="" (
    echo ERRO: Senha e obrigatoria!
    pause
    exit /b 1
)

set /p DB_HOST="Host (padrao: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Porta (padrao: 5432): "
if "%DB_PORT%"=="" set DB_PORT=5432

set DB_NAME=feira_smart

echo.
echo ========================================
echo  Configuracao:
echo  Host: %DB_HOST%
echo  Porta: %DB_PORT%
echo  Usuario: %DB_USER%
echo  Banco: %DB_NAME%
echo ========================================
echo.

REM Criar variável de ambiente temporária para senha
set PGPASSWORD=%DB_PASSWORD%

REM Criar banco de dados
echo Criando banco de dados...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Aviso: Banco pode ja existir. Continuando...
) else (
    echo Banco de dados criado com sucesso!
)
echo.

REM Executar schema
echo Executando schema.sql...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao executar schema.sql!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Banco de dados criado com sucesso!
echo ========================================
echo.
set /p SEED="Deseja popular com dados de exemplo? (S/N): "
if /i "%SEED%"=="S" (
    echo.
    echo Executando seed.sql...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f seed.sql
    if %ERRORLEVEL% NEQ 0 (
        echo Aviso: Erro ao executar seed.sql
    ) else (
        echo Dados de exemplo inseridos com sucesso!
    )
)

echo.
echo ========================================
echo  Pronto! Configure as variaveis de ambiente:
echo ========================================
echo.
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo.
pause




