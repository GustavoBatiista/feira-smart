🚀 FeiraSmart – Plataforma de Gestão de Feiras

(Backend Java | Spring Boot + Frontend + PostgreSQL | Docker)

Projeto desenvolvido em grupo (3 integrantes) como Trabalho de Conclusão de Curso (TCC) da FATEC Ourinhos.

O FeiraSmart é uma plataforma que conecta feirantes e consumidores, permitindo a gestão de barracas e produtos. A criação das feiras é realizada exclusivamente pelos desenvolvedores, garantindo organização, controle e padronização do sistema.

👨‍💻 Meu papel no projeto

Atuei principalmente no backend, sendo responsável por:

Desenvolvimento de APIs REST com Java e Spring Boot

Implementação das regras de negócio

Integração com banco de dados PostgreSQL utilizando JPA/Hibernate

Implementação de autenticação e autorização com Spring Security e JWT

Organização da arquitetura em camadas (Controller, Service, Repository)

Containerização da aplicação com Docker, facilitando o setup do ambiente em equipe

⚙️ Funcionalidades

Cadastro e autenticação de usuários

Gerenciamento de barracas e produtos por feirantes

Controle de acesso baseado em perfil (JWT)

Listagem de produtos para visualização do cliente

Carrinho de compras e cálculo de pedidos

🛠️ Stack Tecnológica
Backend

Java 17

Spring Boot

Spring Security

JWT

JPA / Hibernate

Maven

Banco de Dados

PostgreSQL

Infraestrutura

Docker

Docker Compose

▶️ Como executar o projeto com Docker (recomendado)
Pré-requisitos

Docker

Docker Compose

Passos

Clone o repositório:

git clone git@github.com:GustavoBatiista/feira-smart.git


Acesse a pasta do projeto:

cd feira-smart


Suba os containers (frontend, backend e banco):

docker-compose up -d


Após isso:

Backend estará disponível na porta configurada no container

Banco de dados PostgreSQL sobe automaticamente

Não é necessário instalar Java ou PostgreSQL localmente

📌 Observações

Projeto com fins acadêmicos, desenvolvido para aplicação prática de conceitos de backend com Java e Spring Boot, autenticação, persistência de dados, regras de negócio e containerização com Docker para padronização do ambiente de desenvolvimento em equipe.

📫 Contato

LinkedIn: https://www.linkedin.com/in/gustavo-batista-11a570291
