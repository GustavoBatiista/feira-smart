# 🍎 FeiraSmart

Uma plataforma moderna e inteligente para conectar consumidores e produtores em feiras livres. Reserve produtos, organize suas compras e gerencie suas vendas com facilidade.

## 📋 Sobre o Projeto

O FeiraSmart é uma aplicação web que revoluciona a experiência das feiras livres, permitindo que consumidores encontrem e reservem produtos diretamente com os feirantes antes mesmo de chegarem à feira. Para os feirantes, oferece uma solução completa de gestão de produtos e pedidos.

## ✨ Funcionalidades

### Para Consumidores 👥
- **Busca de Feiras**: Descubra feiras próximas com produtos frescos e de qualidade
- **Catálogo de Produtos**: Navegue pelos produtos disponíveis de cada feirante
- **Carrinho de Compras**: Adicione produtos ao carrinho e faça suas reservas
- **Gestão de Pedidos**: Acompanhe o status dos seus pedidos em tempo real
- **Perfis de Feirantes**: Conheça os produtores locais e suas avaliações

### Para Feirantes 🏪
- **Dashboard**: Visão geral do seu negócio e estatísticas
- **Gestão de Produtos**: Cadastre, edite e gerencie seu catálogo de produtos
- **Gestão de Pedidos**: Receba, confirme e acompanhe os pedidos dos clientes
- **Controle de Estoque**: Monitore a disponibilidade dos seus produtos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server rápido
- **React Router** - Roteamento de páginas
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI modernos e acessíveis
- **React Query** - Gerenciamento de estado servidor e cache
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

### Backend & Database
- **Supabase** - Backend como serviço (BaaS)
  - Autenticação de usuários
  - Banco de dados PostgreSQL
  - Storage para imagens
- **PostgreSQL** - Banco de dados relacional (também suportado via scripts na pasta `database/`)

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Processamento de CSS
- **Lucide React** - Ícones modernos

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou bun
- Conta no Supabase (para configuração do backend)

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd feira-smart
```

2. **Instale as dependências**
```bash
npm install
# ou
bun install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Configure o banco de dados**

   **Opção A: Usando Supabase (padrão)**
   
   Certifique-se de que as migrações do Supabase foram executadas. Os arquivos de migração estão em `supabase/migrations/`.

   **Opção B: Usando PostgreSQL standalone**
   
   Se preferir usar um banco PostgreSQL próprio, consulte a pasta `database/` para scripts SQL completos:
   ```bash
   # Usando Docker (recomendado)
   cd database
   docker-compose up -d
   
   # Ou execute o script SQL manualmente
   psql -U postgres -d feira_smart -f schema.sql
   ```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
bun dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
feira-smart/
├── public/                 # Arquivos estáticos
├── src/
│   ├── assets/            # Imagens e recursos
│   ├── components/        # Componentes React
│   │   ├── layout/       # Componentes de layout (Navbar, etc)
│   │   └── ui/           # Componentes UI do Shadcn
│   ├── hooks/            # Custom hooks (useAuth, useCart)
│   ├── integrations/     # Integrações externas
│   │   └── supabase/     # Cliente e tipos do Supabase
│   ├── lib/              # Utilitários e helpers
│   ├── pages/            # Páginas da aplicação
│   │   ├── auth/        # Login e Registro
│   │   ├── consumer/    # Páginas do consumidor
│   │   └── feirante/    # Páginas do feirante
│   ├── types/            # Definições de tipos TypeScript
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Entry point
├── database/             # Scripts SQL para PostgreSQL standalone
│   ├── schema.sql        # Schema completo do banco de dados
│   ├── seed.sql          # Dados de exemplo (opcional)
│   ├── connection.example.js  # Exemplo de conexão
│   ├── docker-compose.yml     # Docker para PostgreSQL
│   └── README.md         # Documentação do banco
├── supabase/             # Configuração e migrações do Supabase
│   ├── migrations/       # Migrações do banco de dados
│   └── config.toml       # Configuração do Supabase
└── package.json          # Dependências e scripts
```

## 🚀 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run build:dev` - Cria o build em modo desenvolvimento
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📱 Rotas da Aplicação

### Públicas
- `/` - Página inicial
- `/login` - Página de login
- `/register` - Página de registro

### Consumidor
- `/feiras` - Lista de feiras disponíveis
- `/feira/:id/detalhes` - Detalhes de uma feira
- `/feirante/:id/produtos` - Produtos de um feirante
- `/carrinho` - Carrinho de compras
- `/pedidos` - Histórico de pedidos

### Feirante
- `/feirante/dashboard` - Dashboard do feirante
- `/feirante/produtos` - Lista de produtos
- `/feirante/produtos/novo` - Cadastrar novo produto
- `/feirante/produtos/:id/editar` - Editar produto
- `/feirante/pedidos` - Pedidos recebidos

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **profiles** - Perfis de usuários (clientes e feirantes)
- **feiras** - Informações das feiras
- **feirantes** - Informações dos estandes/feirantes
- **produtos** - Catálogo de produtos
- **pedidos** - Pedidos realizados pelos clientes

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📝 Licença

Este projeto está sob a licença MIT.


FeiraSmart - Conectando consumidores e produtores de forma inteligente.
