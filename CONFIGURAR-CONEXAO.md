# ⚙️ Configurar Conexão do Banco de Dados

## 📋 Passo a Passo

### 1. Criar arquivo `.env` na raiz do projeto

O arquivo deve estar em: `C:\Users\Gustavo\Desktop\feira-smart\.env`

### 2. Adicionar as variáveis de ambiente

Adicione o seguinte conteúdo (substitua `sua_senha` pela senha do PostgreSQL):

```env
# Conexão PostgreSQL Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Ou use a string de conexão completa:
# DATABASE_URL=postgresql://postgres:sua_senha_aqui@localhost:5432/feira_smart
```

### 3. Salvar o arquivo

⚠️ **Importante**: 
- O arquivo `.env` não deve ser commitado no Git (já deve estar no `.gitignore`)
- Mantenha a senha segura

---

## 🔧 Usar no Código

Exemplo de como usar as variáveis no código:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'feira_smart',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});
```

---

## ✅ Verificar se está funcionando

Depois de configurar, teste a conexão executando um comando simples na aplicação.

---

**Pronto para usar! 🎉**

