# Identidade Visual

This is a code bundle for Identidade Visual. The original project is available at https://www.figma.com/design/IHgEObVZelRcKrdnJRp2gg/Identidade-Visual.

## Stack com Docker

O `docker-compose.yml` deste repositório sobe a aplicação completa:

| Serviço | Descrição | Endereço |
|---|---|---|
| `db` | PostgreSQL 15 | interno (`db:5432`) |
| `api` | API Spring Boot (build de `../api`) | http://localhost:18080 |
| `web` | Front-end (build estático servido por **nginx**) | http://localhost:5173 |

O front-end chama a API em `/api` e o nginx do container `web` encaminha para
`http://api:8080`. Assim não há URL fixa no bundle nem problema de CORS.

### Front-end em produção

O container `web` **não** roda `vite dev`. O `Dockerfile` faz um build
multi-stage:

1. `node:22-alpine` instala as dependências (`npm ci`) e gera o bundle com
   `npm run build`.
2. `nginx:1.29-alpine` serve somente os arquivos estáticos gerados — sem Node,
   sem `node_modules` e sem watcher na imagem final (~60 MB).

O `nginx.conf` cuida do que importa em produção:

- **SPA fallback**: rotas do React Router caem em `index.html`.
- **Cache**: `/assets/*` (arquivos com hash) fica imutável por 1 ano;
  `index.html` é sempre revalidado, então um deploy novo aparece na hora.
- **Compressão**: os estáticos já são pré-comprimidos no build e servidos como
  `.gz` (`gzip_static`), que evita comprimir a cada requisição.
- **Proxy** `/api` → `api:8080`, com resolução de DNS em tempo de requisição
  (o nginx sobe mesmo se a API ainda não estiver pronta) e limite de upload de
  25 MB (compatível com `STORAGE_MAX_FILE_SIZE_BYTES`).
- **Healthcheck** em `/healthz` e container com filesystem read-only.

Para atualizar o front após mudanças no código:

```bash
docker compose up -d --build web
```

### Portas do host

O compose **não usa** as portas `8080`, `5432` e `5433` do host:

- PostgreSQL: sem publicação, acessível apenas na rede interna (`db:5432`).
- API: publicada em `18080` (`API_HOST_PORT`); internamente continua em `8080`.
- Front-end: `5173` (`WEB_PORT`) → porta `80` do nginx no container.

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

Aponte o túnel para `http://localhost:5173`; o nginx aceita qualquer `Host`.
As portas são publicadas apenas em `127.0.0.1` (`BIND_ADDRESS` no `.env`), então
nada fica exposto diretamente na rede. Se o `cloudflared` rodar dentro de outro
container e não conseguir acessar o host, troque para `BIND_ADDRESS=0.0.0.0`.

### Comandos úteis

```bash
docker compose ps                 # status
docker compose logs -f api web    # logs
docker compose restart api        # reiniciar um serviço
docker compose up -d --build web  # rebuild do front
docker compose down               # parar (mantém os dados)
docker compose down -v            # parar e apagar o banco
```

## Rodar o front fora do Docker (desenvolvimento)

Para trabalhar com hot reload, use o Vite na máquina local (com `node_modules`
instalado):

```bash
docker compose up -d db api   # apenas banco + API
npm run dev                   # front em http://localhost:5173
```

O proxy do Vite (`vite.config.ts`) encaminha `/api` para
`http://localhost:18080` (`VITE_PROXY_TARGET` no `.env`).

O hot reload através do domínio público usa WebSocket na porta 443. Se não
conectar, descomente no `.env` as variáveis `VITE_HMR_*` (modelo em
`.env.example`).
