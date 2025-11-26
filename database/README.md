# 🗄️ FeiraSmart - Banco de Dados PostgreSQL

Este diretório contém os scripts SQL para criar e configurar o banco de dados PostgreSQL do FeiraSmart.

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários (clientes e feirantes)
2. **feiras** - Informações das feiras livres
3. **feirantes** - Informações dos estandes/feirantes
4. **produtos** - Catálogo de produtos dos feirantes
5. **pedidos** - Pedidos realizados pelos clientes
6. **pedido_itens** - Itens de cada pedido

### Tipos ENUM

- **user_type**: `'cliente'` | `'feirante'`
- **feira_status**: `'ativa'` | `'encerrada'` | `'agendada'`
- **pedido_status**: `'pendente'` | `'confirmado'` | `'pronto'` | `'entregue'` | `'cancelado'`

## 🚀 Como Usar

### Pré-requisitos

- PostgreSQL 12 ou superior instalado
- Acesso ao servidor PostgreSQL como superusuário (para criar o banco)

### Opção 1: Usando psql (linha de comando)

```bash
# 1. Conecte-se ao PostgreSQL
psql -U postgres

# 2. Crie o banco de dados
CREATE DATABASE feira_smart;

# 3. Saia do psql
\q

# 4. Execute o script de schema
psql -U postgres -d feira_smart -f schema.sql
```

### Opção 2: Usando pgAdmin

1. Abra o pgAdmin
2. Clique com botão direito em "Databases" → "Create" → "Database"
3. Nome: `feira_smart`
4. Clique em "Save"
5. Clique com botão direito no banco `feira_smart` → "Query Tool"
6. Abra o arquivo `schema.sql`
7. Execute o script (F5)

### Opção 3: Usando Docker

```bash
# 1. Inicie um container PostgreSQL
docker run --name feira-smart-db \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=feira_smart \
  -p 5432:5432 \
  -d postgres:15

# 2. Execute o script
docker exec -i feira-smart-db psql -U postgres -d feira_smart < schema.sql
```

## 🔧 Configuração da Conexão

Para conectar sua aplicação ao banco de dados, você precisará configurar as variáveis de ambiente:

```env
# Exemplo de conexão PostgreSQL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/feira_smart
# ou
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=usuario
DB_PASSWORD=senha
```

### Exemplo de Conexão com Node.js/TypeScript

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'feira_smart',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'senha123',
});

export default pool;
```

## 📊 Diagrama ER (Resumo)

```
profiles (1) ──< (N) feirantes (1) ──< (N) produtos
    │                                     │
    │                                     │
    │                                     │
    │                                     │
    │ (N)                                (N)
    │                                     │
    └──────────── pedidos ────────────────┘
                        │
                        │ (1)
                        │
                        │
                  pedido_itens (N) ──> (1) produtos

feiras (1) ──< (N) feirantes
```

## 🔐 Segurança

**Importante:** Este schema não inclui Row Level Security (RLS) por padrão, pois não depende do Supabase Auth. Se você estiver usando autenticação própria, certifique-se de:

1. Implementar autenticação adequada na sua aplicação
2. Usar prepared statements para prevenir SQL injection
3. Aplicar permissões adequadas nas tabelas
4. Considerar implementar RLS se necessário

## 📝 Migrações

Para gerenciar mudanças no schema ao longo do tempo, considere usar uma ferramenta de migração como:
- **Prisma Migrate**
- **Knex.js Migrations**
- **TypeORM Migrations**
- **Alembic** (se usar Python)

## 🧪 Dados de Teste

O script `schema.sql` inclui alguns dados de exemplo. Para desenvolvimento, você pode adicionar mais dados de teste usando o arquivo `seed.sql` (se criado).

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [PostgreSQL UUID Extension](https://www.postgresql.org/docs/current/uuid-ossp.html)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)




