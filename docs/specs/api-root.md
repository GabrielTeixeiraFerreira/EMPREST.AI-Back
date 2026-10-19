# Spec: API do backend com endpoint raiz

- Escopo: backend (`EMPREST.AI-Back/`)
- Status: aguardando aprovação para implementação

## Contexto e objetivo

Inicializar o backend do EMPREST.AI utilizando a stack definida na ADR-001 (Node.js LTS, NestJS com Express, TypeScript). O objetivo desta etapa é colocar a API de pé com um endpoint raiz (`GET /`) que responda HTTP 200 e um JSON padrão com "Hello World", além de testes automatizados com supertest e build funcional.

## Fora de escopo

- Configuração de banco de dados e execução de migrations;
- Autenticação com Supabase Auth e guards JWT;
- Regras de negócio de empréstimos, catálogo ou devolução;
- Qualquer alteração no frontend (`EMPREST.AI/`).

## Usuários ou sistemas envolvidos

- Desenvolvedor e pipeline de CI executando build e testes;
- Clientes HTTP ou frontend consumindo a verificação básica de conectividade / saúde da API.

## Comportamento esperado

1. O servidor HTTP NestJS inicializa com sucesso escutando na porta configurada (variável `PORT` ou padrão 3000).
2. Requisições `GET /` retornam HTTP status 200 com Content-Type `application/json`.
3. O payload JSON retornado possui formato padrão estruturado contendo a mensagem "Hello World".

## Regras de negócio e arquitetura

- Utilizar NestJS conforme ADR-001;
- Respeitar Arquitetura Limpa e princípios SOLID (SRP e DIP):
  - `SystemController` lida com a requisição HTTP;
  - `SystemService` provê a lógica de retorno;
  - Injeção de dependência via NestJS.
- O endpoint raiz não requer autenticação.

## Critérios de aceitação

- CA-01: O backend inicializa via NestJS sem erros.
- CA-02: O endpoint `GET /` responde com status HTTP 200.
- CA-03: A resposta de `GET /` é um JSON contendo `{"message": "Hello World"}` (ou estrutura equivalente com status/mensagem).
- CA-04: O build da aplicação TypeScript executa com sucesso (`npm run build`).
- CA-05: A suíte de testes com Jest e supertest valida a resposta 200 e o payload JSON de `GET /`, terminando sem erros (`npm test`).

## Dependências e riscos

- Dependência de pacotes `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`.
- Dependência de pacotes de teste `@nestjs/testing`, `supertest`, `jest`, `ts-jest`.

