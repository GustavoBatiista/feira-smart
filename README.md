# 🍎 FeiraSmart

Uma plataforma moderna e inteligente para conectar consumidores e produtores em feiras livres. Reserve produtos, organize suas compras e gerencie suas vendas com facilidade.

## 📋 Sobre o Projeto

O FeiraSmart é uma aplicação web full-stack que revoluciona a experiência das feiras livres, permitindo que consumidores encontrem e reservem produtos diretamente com os feirantes antes mesmo de chegarem à feira. Para os feirantes, oferece uma solução completa de gestão de produtos, estoque e pedidos.

## ✨ Funcionalidades

### Para Consumidores 👥
- **Busca de Feiras**: Descubra feiras próximas com produtos frescos e de qualidade
- **Catálogo de Produtos**: Navegue pelos produtos disponíveis de cada feirante
- **Carrinho de Compras**: Adicione produtos ao carrinho e faça suas reservas
- **Gestão de Pedidos**: Acompanhe o status dos seus pedidos em tempo real
- **Perfis de Feirantes**: Conheça os produtores locais e suas especialidades

### Para Feirantes 🏪
- **Dashboard**: Visão geral do negócio com estatísticas em tempo real
- **Gestão de Produtos**: Cadastre, edite e exclua produtos do seu catálogo
- **Cadastro em Feiras**: Inscreva-se em feiras disponíveis
- **Gestão de Pedidos**: Receba, confirme e acompanhe os pedidos dos clientes
- **Controle de Estoque**: Monitore a disponibilidade dos seus produtos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server rápido
- **Tailwind CSS** - Framework CSS utilitário


### Backend
- **Java 17+** - Linguagem de programação
- **Spring Boot** - Framework Java para construção de APIs REST
- **Spring Security** - Autenticação e autorização
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **JPA/Hibernate** - Mapeamento objeto-relacional

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Processamento de CSS
- **pgAdmin 4** - Interface gráfica para PostgreSQL (opcional)

## 📦 Instalação

### Pré-requisitos

- **Node.js** (versão 18 ou superior) - Para o frontend
- **Java 17+** - Para o backend Spring Boot
- **Maven 3.6+** - Gerenciador de dependências Java
- **PostgreSQL** (versão 12 ou superior) instalado localmente
- **npm** ou **bun** (gerenciador de pacotes)
- **pgAdmin 4** (opcional, para visualizar o banco de dados)

### Passo a Passo

#### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd feira-smart
```

#### 2. Instale as dependências do frontend

```bash
npm install
```

#### 3. Configure o banco de dados PostgreSQL

**Opção A: Via pgAdmin 4 (Recomendado)**

1. Abra o pgAdmin 4
2. Conecte-se ao servidor PostgreSQL
3. Clique com botão direito em **Databases** → **Create** → **Database**
4. Nome: `feira_smart`
5. Clique em **Save**
6. Clique com botão direito no banco `feira_smart` → **Query Tool**
7. Abra e execute o arquivo `database/schema.sql`

**Opção B: Via linha de comando**

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE feira_smart;

# Saia do psql
\q

# Execute o schema
psql -U postgres -d feira_smart -f database/schema.sql
```

**Opção C: Via Docker**

```bash
cd database
docker-compose up -d
# Execute o schema.sql no container
```

#### 4. Configure a API Backend (Spring Boot)

Configure o arquivo `server-java/src/main/resources/application.properties`:

```properties
# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/feira_smart
spring.datasource.username=postgres
spring.datasource.password=sua_senha_postgres

# JWT Secret (mude em produção!)
jwt.secret=seu_jwt_secret_aqui_mude_em_producao

# Server Configuration
server.port=3001
```

⚠️ **Importante:** Substitua `sua_senha_postgres` pela senha real do seu PostgreSQL!

Ou crie um arquivo `server-java/src/main/resources/application-local.properties` (não versionado no Git).

#### 5. Configure a aplicação React

Crie o arquivo `.env` na **raiz do projeto**:

```env
# API Backend URL
VITE_API_URL=http://localhost:3001/api
```

#### 6. Inicie os servidores

Você precisará de **2 terminais**:

**Terminal 1 - API Backend (Spring Boot):**

```bash
cd server-java
mvn spring-boot:run
```

Você deve ver:
```
🚀 Spring Boot iniciado!
📡 API rodando em: http://localhost:3001
```

**Terminal 2 - React App:**

```bash
# Na raiz do projeto
npm run dev
```

Você deve ver:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```

#### 7. Acesse a aplicação

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Estrutura do Projeto

```
feira-smart/
├── public/                      # Arquivos estáticos
├── src/                         # Código-fonte do frontend
│   ├── assets/                 # Imagens e recursos
│   ├── components/             # Componentes React
│   │   ├── layout/            # Componentes de layout (Navbar)
│   │   └── ui/                # Componentes UI do Shadcn
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.tsx        # Hook de autenticação
│   │   └── useCart.tsx        # Hook do carrinho
│   ├── lib/                   # Utilitários
│   │   ├── api-client.ts      # Cliente HTTP para API
│   │   └── utils.ts           # Funções utilitárias
│   ├── pages/                 # Páginas da aplicação
│   │   ├── auth/             # Autenticação (Login, Register)
│   │   ├── consumer/         # Páginas do consumidor
│   │   └── feirante/         # Páginas do feirante
│   ├── types/                # Tipos TypeScript
│   ├── App.tsx               # Componente principal
│   └── main.tsx              # Entry point
├── server-java/               # API Backend (Spring Boot)
│   ├── src/main/java/com/feirasmart/
│   │   ├── config/           # Configurações
│   │   ├── controller/       # Controllers REST
│   │   ├── service/          # Lógica de negócio
│   │   ├── repository/       # Repositórios JPA
│   │   ├── model/            # Entidades
│   │   └── dto/              # Data Transfer Objects
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── README.md
├── database/                  # Scripts SQL
│   ├── schema.sql            # Schema completo do banco
│   ├── seed.sql              # Dados de exemplo (opcional)
│   ├── docker-compose.yml    # Docker para PostgreSQL
│   └── README.md
├── .env                       # Variáveis de ambiente (criar)
├── package.json
└── README.md
```

## 🚀 Scripts Disponíveis

### Frontend (raiz do projeto)

- `npm run dev` - Inicia o servidor de desenvolvimento (porta 8080)
- `npm run build` - Cria o build de produção
- `npm run build:dev` - Cria o build em modo desenvolvimento
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

### Backend (pasta server-java/)

- `mvn spring-boot:run` - Inicia a API em modo desenvolvimento (porta 3001)
- `mvn clean package` - Compila e gera o JAR para produção
- `java -jar target/*.jar` - Executa o JAR gerado

### Scripts Combinados

- `npm run dev:api` - Inicia apenas a API
- `npm run dev:all` - Inicia frontend e API juntos (requer `concurrently`)

## 📱 Rotas da Aplicação

### Públicas
- `/` - Página inicial
- `/login` - Página de login
- `/register` - Página de registro

### Consumidor (requer autenticação)
- `/feiras` - Lista de feiras disponíveis
- `/feira/:id/detalhes` - Detalhes de uma feira
- `/feirante/:id/produtos` - Produtos de um feirante
- `/carrinho` - Carrinho de compras
- `/pedidos` - Histórico de pedidos

### Feirante (requer autenticação)
- `/feirante/dashboard` - Dashboard do feirante
- `/feirante/produtos` - Lista de produtos
- `/feirante/produtos/novo` - Cadastrar novo produto
- `/feirante/produtos/:id/editar` - Editar produto
- `/feirante/pedidos` - Pedidos recebidos

## 🔌 API Endpoints

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

**Documentação completa da API:** Veja `server-java/README.md`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **profiles** - Perfis de usuários (clientes e feirantes)
  - Campos: id, email, nome, tipo, telefone, avatar, created_at, updated_at

- **feiras** - Informações das feiras livres
  - Campos: id, nome, localizacao, descricao, data_inicio, data_fim, hora_inicio, hora_fim, imagem, status, created_at, updated_at

- **feirantes** - Informações dos estandes/feirantes
  - Campos: id, user_id, feira_id, nome_estande, descricao, categoria, avatar, avaliacao, num_avaliacoes, created_at, updated_at

- **produtos** - Catálogo de produtos dos feirantes
  - Campos: id, feirante_id, nome, descricao, preco, unidade, categoria, imagem, estoque, disponivel, created_at, updated_at

- **pedidos** - Pedidos realizados pelos clientes
  - Campos: id, cliente_id, feirante_id, feira_id, total, status, observacoes, created_at, updated_at

- **pedido_itens** - Itens de cada pedido
  - Campos: id, pedido_id, produto_id, nome_produto, quantidade, preco, created_at

### Tipos ENUM

- **user_type**: `'cliente'` | `'feirante'`
- **feira_status**: `'ativa'` | `'encerrada'` | `'agendada'`
- **pedido_status**: `'pendente'` | `'confirmado'` | `'pronto'` | `'entregue'` | `'cancelado'`

**Documentação completa do banco:** Veja `database/README.md`

## 🔐 Autenticação

A aplicação usa **JWT (JSON Web Tokens)** para autenticação:

1. O usuário faz login ou se registra via `/api/auth/login` ou `/api/auth/register`
2. A API retorna um token JWT
3. O token é salvo no `localStorage`
4. Todas as requisições autenticadas incluem o token no header:
   ```
   Authorization: Bearer <token>
   ```

## 📊 Fluxo de Dados

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ React App   │ ──────▶ │  API Backend │ ──────▶ │ PostgreSQL  │
│ (Frontend)  │  HTTP   │ (localhost)  │         │  (Local)    │
│ Porta 8080  │         │  Porta 3001  │         │  Porta 5432 │
└─────────────┘         └──────────────┘         └─────────────┘
     │                        │                        │
     │                        │                        │
     └──────────────┬─────────┴────────────────────────┘
                    │
                    ▼
          ✅ Dados salvos no PostgreSQL local
          ✅ Aparecem no pgAdmin 4
          ✅ Controle total sobre os dados
```

## 🧪 Testando a Aplicação

### 1. Verificar se a API está funcionando

Abra no navegador:
```
http://localhost:3001/health
```

Deve retornar:
```json
{"status":"ok","message":"API FeiraSmart está funcionando!"}
```

### 2. Criar uma conta

1. Acesse: http://localhost:8080/register
2. Preencha os dados e escolha o tipo (cliente ou feirante)
3. Clique em "Criar Conta"

### 3. Login

1. Acesse: http://localhost:8080/login
2. Digite email e senha
3. Você será redirecionado automaticamente

### 4. Verificar dados no pgAdmin

1. Abra o pgAdmin 4
2. Conecte ao servidor PostgreSQL
3. Expanda: **Databases** → **feira_smart** → **Schemas** → **public** → **Tables**
4. Clique com botão direito em qualquer tabela → **View/Edit Data** → **All Rows**
5. Você verá os dados criados na aplicação! ✅

## 📝 Adicionar Feiras

As feiras podem ser adicionadas de duas formas:

### Opção 1: Via SQL (pgAdmin)

Execute no Query Tool do pgAdmin:

```sql
INSERT INTO feiras (nome, localizacao, descricao, data_inicio, data_fim, hora_inicio, hora_fim, status)
VALUES (
  'Feira Orgânica Central',
  'Praça da República, São Paulo - SP',
  'Produtos orgânicos frescos diretamente dos produtores',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 day',
  '06:00:00',
  '14:00:00',
  'ativa'
);
```

### Opção 2: Via API

```bash
curl -X POST http://localhost:3001/api/feiras \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Feira Orgânica Central",
    "localizacao": "Praça da República, São Paulo - SP",
    "descricao": "Produtos orgânicos frescos",
    "data_inicio": "2025-12-01",
    "data_fim": "2025-12-01",
    "hora_inicio": "06:00:00",
    "hora_fim": "14:00:00",
    "status": "ativa"
  }'
```

## 🐛 Troubleshooting

### Erro: "Failed to fetch" ao fazer login

1. Verifique se a API está rodando: http://localhost:3001/health
2. Verifique se o arquivo `.env` na raiz tem `VITE_API_URL=http://localhost:3001/api`
3. Reinicie o servidor React após criar/modificar o `.env`

### Erro: "Cannot connect to PostgreSQL"

1. Verifique se o PostgreSQL está rodando
2. Verifique as credenciais no arquivo `server-java/src/main/resources/application.properties`
3. Teste a conexão no pgAdmin 4

### Erro: "relation does not exist"

Execute o script `database/schema.sql` no PostgreSQL para criar as tabelas.

### Porta 3001 já está em uso

Altere a porta no arquivo `server-java/src/main/resources/application.properties`:
```properties
server.port=3002
```

E atualize o `.env` da raiz:
```env
VITE_API_URL=http://localhost:3002/api
```

## 📚 Documentação Adicional

- **API Backend**: `server-java/README.md` - Documentação completa da API
- **Banco de Dados**: `database/README.md` - Documentação do PostgreSQL
- **Como Adicionar Feiras**: Veja exemplos em `database/seed.sql`

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📝 Licença

Este projeto está sob a licença MIT.

---

**FeiraSmart** - Conectando consumidores e produtores de forma inteligente. 🍎✨
