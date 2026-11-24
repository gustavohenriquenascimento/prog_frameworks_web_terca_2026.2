# Via Livre — Sistema de Locação de Veículos

Aplicação de locação com API REST em Node.js, Express e Prisma, banco MySQL/MariaDB, autenticação JWT e interface React.

## Integrante

- Gustavo Henrique Nascimento Silva

## Requisitos

- Node.js 20 ou superior e npm
- MySQL ou MariaDB

## Configuração

1. Instale as dependências da API:

   ```bash
   npm install
   ```

2. Crie o arquivo local de ambiente (ou adicione as variáveis que faltarem ao `.env` local existente):

   ```bash
   copy .env.example .env
   ```

   `DATABASE_URL` é usada pelo Prisma CLI. `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` configuram a conexão da aplicação.
   `JWT_SECRET` deve ser um segredo aleatório com pelo menos 32 caracteres. Não compartilhe nem versione o arquivo `.env`.

3. Gere o cliente Prisma e aplique as migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Carregue veículos de demonstração no banco:

   ```bash
   npm run db:seed
   ```

   O comando cria três veículos de exemplo e pode ser executado novamente sem sobrescrever dados existentes. Crie uma conta pela interface para demonstrar locações.

5. Inicie a API:

   ```bash
   npm run dev
   ```

   A API usa a porta `3000` por padrão. `GET /health` confirma que o servidor HTTP está respondendo.

## Interface React

Em outro terminal, instale e inicie o cliente:

```bash
npm install --prefix frontend
npm run dev:frontend
```

Abra `http://localhost:5173`. A interface consome a API real, sem listas fixas de demonstração. O filtro inicia mostrando veículos disponíveis; os dados para demonstração podem ser carregados no banco com `npm run db:seed`. Se a API estiver em outro endereço, copie `frontend/.env.example` para `frontend/.env.local` e ajuste `VITE_API_URL`.

## API

Exceto cadastro e login, as rotas abaixo exigem `Authorization: Bearer <token>`. O token é emitido pelo login e representa o usuário autenticado. IDs de usuário não são aceitos como forma de escolher o proprietário de uma locação.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Cadastra usuário com nome, e-mail e senha (mínimo 8 caracteres). |
| `POST` | `/auth/login` | Público | Valida credenciais e retorna usuário e token JWT. |
| `GET` | `/auth/me` | Autenticado | Retorna o perfil do usuário autenticado. |
| `GET` | `/veiculos` | Autenticado | Lista veículos; aceita `?disponiveis=true` ou `?disponiveis=false`. Sem filtro, lista todos. |
| `POST` | `/veiculos` | Autenticado | Cadastra veículo com marca, modelo, placa, ano e valor da diária. |
| `POST` | `/locacoes` | Autenticado | Registra locação informando veículo e período; o usuário vem do token. |
| `GET` | `/locacoes` | Autenticado | Lista o histórico do usuário autenticado com os veículos relacionados. |
| `PATCH` | `/locacoes/:id/finalizar` | Autenticado | Finaliza locação própria e disponibiliza novamente o veículo. |
| `GET` | `/health` | Público | Verifica se o servidor HTTP está ativo. |

As respostas de erro usam JSON com `error` e `code`; erros de validação também podem incluir `details`. E-mails e placas são normalizados e únicos. Senhas são armazenadas com bcrypt e não aparecem em respostas.

## Organização

- `src/routes`: rotas HTTP e composição de middlewares.
- `src/controllers`: entrada e resposta HTTP.
- `src/services`: acesso ao Prisma e regras de negócio.
- `src/schemas`: validação de payloads com Zod.
- `src/middlewares`: autenticação, validação e tratamento de erros.
- `prisma/schema.prisma` e `prisma/migrations`: modelo relacional e histórico versionado do banco.
- `frontend/src`: interface e consumo da API com `fetch`.

## Testes e build

```bash
npm test
npm run build:frontend
```

Os testes da API usam o executor nativo do Node.js. O build da interface verifica a compilação de produção do React.

Para criar e versionar uma migration durante o desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_mudanca
```
