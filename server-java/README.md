# FeiraSmart API - Spring Boot

API Backend para FeiraSmart desenvolvida com Spring Boot e PostgreSQL.

## Requisitos

- Java 17 ou superior
- Maven 3.6+
- PostgreSQL 12+

## Configuração

1. Configure as variáveis de ambiente no arquivo `.env` ou diretamente no `application.properties`:

```properties
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feira_smart
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
```

2. Compile o projeto:

```bash
mvn clean install
```

3. Execute a aplicação:

```bash
mvn spring-boot:run
```

A API estará disponível em `http://localhost:3001`

## Endpoints

### Health Check
- `GET /health` - Verifica se a API está funcionando

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter perfil do usuário autenticado

### Feiras
- `GET /api/feiras` - Listar todas as feiras
- `GET /api/feiras/{id}` - Obter feira por ID
- `POST /api/feiras` - Criar feira
- `PUT /api/feiras/{id}` - Atualizar feira
- `DELETE /api/feiras/{id}` - Deletar feira

### Feirantes
- `GET /api/feirantes` - Listar feirantes
- `GET /api/feirantes/{id}` - Obter feirante por ID
- `GET /api/feirantes/stats/dashboard` - Estatísticas do dashboard (requer autenticação de feirante)
- `POST /api/feirantes` - Criar feirante (requer autenticação)
- `PUT /api/feirantes/{id}` - Atualizar feirante (requer autenticação)

### Produtos
- `GET /api/produtos` - Listar produtos
- `GET /api/produtos/{id}` - Obter produto por ID
- `POST /api/produtos` - Criar produto (requer autenticação de feirante)
- `PUT /api/produtos/{id}` - Atualizar produto (requer autenticação de feirante)
- `DELETE /api/produtos/{id}` - Deletar produto (requer autenticação de feirante)

### Pedidos
- `GET /api/pedidos` - Listar pedidos do usuário autenticado
- `GET /api/pedidos/{id}` - Obter pedido por ID
- `POST /api/pedidos` - Criar pedido (requer autenticação de cliente)
- `PATCH /api/pedidos/{id}/status` - Atualizar status do pedido (requer autenticação de feirante)

## Estrutura do Projeto

```
server-java/
├── src/
│   ├── main/
│   │   ├── java/com/feirasmart/
│   │   │   ├── config/          # Configurações (Security, JWT, CORS)
│   │   │   ├── controller/      # Controllers REST
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # Entidades JPA
│   │   │   ├── repository/     # Repositories JPA
│   │   │   └── service/         # Services (lógica de negócio)
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## Tecnologias

- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security
- PostgreSQL
- JWT (JSON Web Tokens)
- Maven









