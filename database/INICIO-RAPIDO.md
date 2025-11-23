# 🚀 Início Rápido - Criar Banco de Dados

## Método Mais Rápido (Recomendado)

### Passo 1: Instalar PostgreSQL

1. **Baixe o instalador:**
   - https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Escolha PostgreSQL 15 ou 16 para Windows x86-64
   - Execute o instalador

2. **Durante a instalação:**
   - ⚠️ **IMPORTANTE**: Anote a senha que você definir para o usuário `postgres`
   - Deixe marcado "Add PostgreSQL to PATH" (muito importante!)
   - Porta padrão: 5432 (pode deixar assim)

3. **Após instalar:**
   - Reinicie o PowerShell/Terminal se necessário

### Passo 2: Executar Script Automático

Abra o PowerShell na pasta `database`:

```powershell
cd C:\Users\Gustavo\Desktop\feira-smart\database
.\criar-banco.ps1
```

O script vai:
- ✅ Verificar se o PostgreSQL está instalado
- ✅ Criar o banco de dados `feira_smart`
- ✅ Executar todas as tabelas e estruturas
- ✅ Opcionalmente popular com dados de exemplo

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

---

## Alternativa: Usando Docker (Se tiver Docker instalado)

```powershell
cd C:\Users\Gustavo\Desktop\feira-smart\database
docker-compose up -d
```

Isso cria e inicia o banco automaticamente!

---

## ⚠️ Problemas?

- **PostgreSQL não encontrado?** Reinstale marcando "Add to PATH"
- **Erro de permissão?** Execute o PowerShell como Administrador
- **Mais detalhes?** Veja `INSTALACAO.md`

