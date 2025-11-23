# 🗄️ Guia de Instalação do Banco de Dados - FeiraSmart

Este guia mostra diferentes formas de criar o banco de dados PostgreSQL para o FeiraSmart no Windows.

## 📋 Opções Disponíveis

### Opção 1: PostgreSQL Local (Recomendado para desenvolvimento)

#### Passo 1: Instalar PostgreSQL

1. **Baixar PostgreSQL:**
   - Acesse: https://www.postgresql.org/download/windows/
   - Ou baixe diretamente: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Escolha a versão 15 ou superior

2. **Instalar:**
   - Execute o instalador
   - Durante a instalação, defina uma senha para o usuário `postgres` (ANOTE ESTA SENHA!)
   - Porta padrão: `5432`
   - Deixe marcada a opção para adicionar ao PATH

3. **Verificar instalação:**
   ```powershell
   psql --version
   ```

#### Passo 2: Criar o Banco de Dados

1. **Abrir o SQL Shell (psql) ou PowerShell:**
   - Pressione `Win + R`
   - Digite `psql` e pressione Enter
   - Ou abra PowerShell como Administrador

2. **Conectar ao PostgreSQL:**
   ```powershell
   psql -U postgres
   ```
   - Digite a senha que você definiu durante a instalação

3. **Criar o banco de dados:**
   ```sql
   CREATE DATABASE feira_smart;
   ```

4. **Sair do psql:**
   ```sql
   \q
   ```

5. **Executar o script de schema:**
   ```powershell
   cd C:\Users\Gustavo\Desktop\feira-smart\database
   psql -U postgres -d feira_smart -f schema.sql
   ```

6. **(Opcional) Popular com dados de exemplo:**
   ```powershell
   psql -U postgres -d feira_smart -f seed.sql
   ```

---

### Opção 2: Docker Desktop (Mais fácil de gerenciar)

#### Passo 1: Instalar Docker Desktop

1. **Baixar Docker Desktop:**
   - Acesse: https://www.docker.com/products/docker-desktop/
   - Baixe a versão para Windows
   - Instale e reinicie o computador

2. **Iniciar Docker Desktop:**
   - Abra o Docker Desktop
   - Aguarde até aparecer "Docker is running"

#### Passo 2: Criar o Banco com Docker

1. **Navegar até a pasta database:**
   ```powershell
   cd C:\Users\Gustavo\Desktop\feira-smart\database
   ```

2. **Iniciar o PostgreSQL:**
   ```powershell
   docker-compose up -d
   ```

3. **Verificar se está rodando:**
   ```powershell
   docker-compose ps
   ```

4. **O banco será criado automaticamente com o schema!**

5. **Conectar ao banco:**
   ```powershell
   docker exec -it feira-smart-db psql -U postgres -d feira_smart
   ```

6. **Para parar o banco:**
   ```powershell
   docker-compose down
   ```

---

### Opção 3: Supabase (Nuvem - Grátis)

Se você já usa Supabase, pode continuar usando:

1. Acesse: https://supabase.com
2. Crie uma conta (grátis)
3. Crie um novo projeto
4. Execute as migrações que estão em `supabase/migrations/`

---

### Opção 4: Serviços de PostgreSQL na Nuvem

#### ElephantSQL (Grátis até 20MB)
1. Acesse: https://www.elephantsql.com/
2. Crie uma conta
3. Crie uma instância gratuita
4. Copie a URL de conexão
5. Execute o schema usando o cliente PostgreSQL de sua preferência

#### Neon (Grátis - Serverless PostgreSQL)
1. Acesse: https://neon.tech/
2. Crie uma conta
3. Crie um projeto
4. Use a conexão fornecida

---

## ⚙️ Configuração da Aplicação

Após criar o banco, você precisa configurar a conexão na aplicação.

### Criar arquivo `.env` na raiz do projeto:

```env
# Para PostgreSQL local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Para Docker (usar os mesmos valores do docker-compose.yml)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=senha123

# Ou use DATABASE_URL (formato completo)
DATABASE_URL=postgresql://postgres:senha123@localhost:5432/feira_smart
```

## 🔍 Verificar se o Banco foi Criado Corretamente

Execute no psql ou no cliente SQL:

```sql
-- Listar todas as tabelas
\dt

-- Ver estrutura de uma tabela
\d profiles

-- Contar registros
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM feiras;
SELECT COUNT(*) FROM produtos;
```

## 🆘 Problemas Comuns

### Erro: "psql não é reconhecido"
- PostgreSQL não está no PATH
- Solução: Reinstale o PostgreSQL marcando a opção "Add to PATH"
- Ou adicione manualmente: `C:\Program Files\PostgreSQL\15\bin` ao PATH do Windows

### Erro: "role postgres does not exist"
- Execute: `createuser -s postgres` (no PowerShell como Admin)

### Erro de permissão
- Execute o PowerShell como Administrador
- Ou verifique as permissões do usuário no PostgreSQL

### Docker não inicia
- Verifique se a virtualização está habilitada no BIOS
- Certifique-se de que o WSL2 está instalado (Windows 10/11)

## 📞 Próximos Passos

1. ✅ Banco de dados criado
2. ⏭️ Configurar variáveis de ambiente (.env)
3. ⏭️ Testar conexão na aplicação
4. ⏭️ Executar seed.sql para dados de exemplo (opcional)

---

**Precisa de ajuda?** Verifique o arquivo `database/README.md` para mais detalhes.

