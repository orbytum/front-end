# syntax=docker/dockerfile:1

# =============================================================================
# Front-end (produção): build estático + nginx. Node existe apenas no build.
# =============================================================================

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Copia só os manifestos primeiro: o cache de camadas evita reinstalar tudo a
# cada mudança no código-fonte.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

ARG VITE_BASE_URL=/api
ENV VITE_BASE_URL=$VITE_BASE_URL

# Gera o build e pré-comprime os estáticos; o nginx serve os .gz direto
# (gzip_static), sem comprimir a cada requisição.
RUN npm run build \
    && find dist -type f \
        \( -name '*.html' -o -name '*.js' -o -name '*.css' \
        -o -name '*.svg' -o -name '*.json' -o -name '*.txt' \) \
        -exec gzip -9 -k {} \;

# ---------- runtime ----------
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
