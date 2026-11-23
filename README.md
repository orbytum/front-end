# Identidade Visual

This is a code bundle for Identidade Visual. The original project is available at https://www.figma.com/design/IHgEObVZelRcKrdnJRp2gg/Identidade-Visual.

## Stack de desenvolvimento com Docker

O `docker-compose.yml` deste repositório sobe a aplicação completa:

| Serviço | Descrição | Endereço |
|---|---|---|
| `db` | PostgreSQL 15 | interno (`db:5432`) |
| `api` | API Spring Boot (build de `../api`) | http://localhost:18080 |
| `web` | Front-end Vite | http://localhost:5173 |

O front-end chama a API em `/api` e o proxy do Vite encaminha para o container `api`.
Assim não há URL fixa no bundle nem problema de CORS.

### Portas do host

O compose **não usa** as portas `8080`, `5432` e `5433` do host:

- PostgreSQL: sem publicação, acessível apenas na rede interna (`db:5432`).
- API: publicada em `18080` (`API_HOST_PORT`); internamente continua em `8080`.
- Front-end: `5173` (`WEB_PORT`).

Se alguma dessas também estiver ocupada, troque apenas no `.env`.

### Pré-requisitos

- Docker e Docker Compose
- Repositório da API clonado **ao lado** deste: `../api`

### Subir

```bash
# 1) configure as variáveis (só na primeira vez)
cp .env.example .env
# edite JWT_SECRET, DB_PASSWORD e, se quiser e-mail, SPRING_MAIL_*

# 2) suba tudo
docker compose up -d --build
```

> A primeira subida compila a API com o Gradle e pode levar alguns minutos.
> Acompanhe com `docker compose logs -f api`.

Acesse **http://localhost:5173**.

### Login inicial

Na primeira subida, com o banco vazio, a API cria o administrador inicial
usando `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD` do `.env`.
Essa conta serve apenas para cadastrar o primeiro administrador definitivo.

### Cloudflare Tunnel

Com o túnel configurado para `http://localhost:5173`, o domínio
`https://orbytum.luiz-antonio.site` já é aceito pelo Vite (`allowedHosts`).
As portas são publicadas apenas em `127.0.0.1` (`BIND_ADDRESS` no `.env`), então
nada fica exposto diretamente na rede. Se o `cloudflared` rodar dentro de outro
container e não conseguir acessar o host, troque para `BIND_ADDRESS=0.0.0.0`.

O hot reload funciona pelo domínio via WebSocket na porta 443. Se não conectar,
descomente no `.env` as variáveis `VITE_HMR_*` (modelo em `.env.example`).

### Comandos úteis

```bash
docker compose ps                 # status
docker compose logs -f api web    # logs
docker compose restart api        # reiniciar um serviço
docker compose down               # parar (mantém os dados)
docker compose down -v            # parar e apagar banco/node_modules do volume
```

### Rodar o front fora do Docker

Se preferir usar o Vite na máquina local (já com `node_modules` instalado):

```bash
docker compose up -d db api   # apenas banco + API
npm run dev                   # front em http://localhost:5173
```

O proxy continua apontando para `http://localhost:18080`.
