# 🚀 API Backend - FeiraSmart

API REST para conectar a aplicação React ao PostgreSQL local.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL rodando localmente
- Banco de dados `feira_smart` criado

## 🔧 Configuração

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `server/`:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (mude em produção!)
JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
```

**⚠️ Importante:** Substitua `sua_senha_aqui` pela senha real do PostgreSQL.

### 3. Iniciar o Servidor

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

## 📚 Rotas Disponíveis

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter perfil do usuário autenticado

### Feiras
- `GET /api/feiras` - Listar feiras (query: `?status=ativa`)
- `GET /api/feiras/:id` - Obter feira por ID
- `POST /api/feiras` - Criar feira
- `PUT /api/feiras/:id` - Atualizar feira
- `DELETE /api/feiras/:id` - Deletar feira

### Produtos
- `GET /api/produtos` - Listar produtos (query: `?feirante_id=xxx&disponivel=true`)
- `GET /api/produtos/:id` - Obter produto por ID
- `POST /api/produtos` - Criar produto (requer autenticação)
- `PUT /api/produtos/:id` - Atualizar produto (requer autenticação)
- `DELETE /api/produtos/:id` - Deletar produto (requer autenticação)

### Feirantes
- `GET /api/feirantes` - Listar feirantes (query: `?feira_id=xxx&user_id=xxx`)
- `GET /api/feirantes/:id` - Obter feirante por ID
- `POST /api/feirantes` - Cadastrar-se em uma feira (requer autenticação)
- `PUT /api/feirantes/:id` - Atualizar feirante (requer autenticação)

### Pedidos
- `GET /api/pedidos` - Listar pedidos do usuário (requer autenticação)
- `GET /api/pedidos/:id` - Obter pedido por ID (requer autenticação)
- `POST /api/pedidos` - Criar pedido (requer autenticação, apenas clientes)
- `PATCH /api/pedidos/:id/status` - Atualizar status do pedido (requer autenticação, apenas feirantes)

## 🔐 Autenticação

A maioria das rotas requer autenticação via JWT. Envie o token no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 📝 Exemplo de Uso

### Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123",
    "nome": "João Silva",
    "tipo": "cliente"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

### Criar Produto (com autenticação)

```bash
curl -X POST http://localhost:3001/api/produtos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "feirante_id": "uuid-aqui",
    "nome": "Tomate",
    "preco": 5.90,
    "unidade": "kg",
    "estoque": 50,
    "categoria": "Legumes"
  }'
```

## 🗂️ Estrutura do Projeto

```
server/
├── src/
│   ├── config/
│   │   └── database.js       # Configuração do PostgreSQL
│   ├── middleware/
│   │   └── auth.js           # Middleware de autenticação
│   ├── routes/
│   │   ├── auth.js           # Rotas de autenticação
│   │   ├── feiras.js         # Rotas de feiras
│   │   ├── produtos.js       # Rotas de produtos
│   │   ├── feirantes.js      # Rotas de feirantes
│   │   └── pedidos.js        # Rotas de pedidos
│   └── index.js              # Arquivo principal
├── .env                      # Variáveis de ambiente (criar)
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

1. Verifique se o PostgreSQL está rodando
2. Verifique as credenciais no arquivo `.env`
3. Verifique se o banco `feira_smart` existe

### Erro: "relation does not exist"

Execute o script `database/schema.sql` no PostgreSQL para criar as tabelas.

### Porta 3001 já está em uso

Altere a porta no arquivo `.env`:
```env
PORT=3002
```

## 📦 Scripts

- `npm run dev` - Iniciar servidor em modo desenvolvimento (com watch)
- `npm start` - Iniciar servidor em modo produção

## ✅ Próximos Passos

Depois de configurar a API, atualize a aplicação React para usar esta API ao invés do Supabase.

