# 🚀 Criar Banco de Dados - Passo a Passo

Você tem duas opções:

## 📊 Opção 1: Via pgAdmin 4 (Visual)

### Passo 1: Criar o Banco
1. No pgAdmin 4, no lado esquerdo, expanda:
   - **Servers** → **PostgreSQL 16**
2. Clique com o botão direito em **Databases**
3. Selecione **Create** → **Database**
4. Na aba **General**:
   - **Database**: `feira_smart`
   - **Owner**: `postgres` (padrão)
5. Clique em **Save**

### Passo 2: Executar o Schema
Depois de criar o banco, execute no pgAdmin:

1. Clique com o botão direito no banco `feira_smart`
2. Selecione **Query Tool**
3. Abra o arquivo `schema.sql` (Ctrl+O ou File → Open)
4. Selecione o arquivo: `C:\Users\Gustavo\Desktop\feira-smart\database\schema.sql`
5. Clique em **Execute** (F5 ou botão ⚡)

✅ **Pronto!** O banco está criado com todas as tabelas.

### Passo 3 (Opcional): Dados de Exemplo
Se quiser popular com dados de teste:
1. No Query Tool do banco `feira_smart`
2. Abra o arquivo `seed.sql`
3. Execute (F5)

---

## 💻 Opção 2: Via PowerShell (Rápido)

### Passo 1: Executar o Script

Abra o PowerShell e execute:

```powershell
cd C:\Users\Gustavo\Desktop\feira-smart\database
.\criar-banco-simples.ps1
```

O script vai:
1. Pedir a senha do usuário `postgres`
2. Criar o banco `feira_smart`
3. Executar todas as tabelas
4. Perguntar se quer dados de exemplo

---

## ✅ Verificar se Funcionou

Depois de criar, no pgAdmin 4:

1. Expanda o banco `feira_smart`
2. Expanda **Schemas** → **public** → **Tables**
3. Você deve ver estas tabelas:
   - ✅ profiles
   - ✅ feiras
   - ✅ feirantes
   - ✅ produtos
   - ✅ pedidos
   - ✅ pedido_itens

---

## 🔧 Configurar Conexão na Aplicação

Depois de criar o banco, crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

Ou use a string de conexão completa:
```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/feira_smart
```

---

**Qual opção você prefere?** Recomendo a Opção 1 (pgAdmin) se você está mais acostumado com interfaces gráficas! 😊

