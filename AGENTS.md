# AGENTS.md — Padrões do Front-end (Orbytum)

Este arquivo orienta IAs e desenvolvedores sobre os padrões obrigatórios deste projeto. Siga-o rigorosamente ao criar ou modificar código.

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **React Router 7** (`react-router`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Zod** para validação de respostas da API
- **lucide-react** para ícones (preferir; MUI e Radix existem no projeto, mas novas telas usam lucide + Tailwind)
- Alias `@` aponta para `./src`

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção (use para validar mudanças)
```

Não há testes configurados — valide sempre com `npm run build`.

## Estrutura de diretórios

```
src/
├── app/
│   ├── components/     # Componentes reutilizáveis (DataTable, Layout, ui/ do shadcn)
│   ├── models/
│   │   └── dto/        # DTOs com schemas Zod, organizados por domínio (auth/, convites/, ...)
│   ├── pages/          # Páginas/rotas da aplicação
│   ├── services/       # Camada de acesso à API (PADRÃO OBRIGATÓRIO — ver abaixo)
│   │   ├── BaseService.ts
│   │   ├── auth/
│   │   └── convites/
│   └── utils/          # HttpRequest, HttpError, TratarExcecao, RouterRef
└── styles/             # CSS global
```

## Padrão de camada de API (OBRIGATÓRIO)

Toda comunicação HTTP passa por **classes de Service** em `src/app/services/`. **NUNCA** crie clientes HTTP alternativos (objetos literais `xxxApi`, wrappers de `fetch`, pastas `src/api/`, etc.).

### BaseService

`src/app/services/BaseService.ts` expõe `get/post/put/delete/patch` com assinatura:

```ts
this.post<T>(path, data, headers = {}, schema?)
```

- `schema` é um **Zod schema** que valida a resposta.
- Erros são tratados centralmente por `TratarExcecao` (exibe alerta global e redireciona ao login em 401) e **relançados** como `HttpError` para o chamador.

### Como criar um novo Service

1. **Crie os DTOs com schemas Zod** em `src/app/models/dto/<dominio>/<Nome>.ts`:

```ts
import { z } from "zod";

export const meuResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
});

export type MeuResponse = z.infer<typeof meuResponseSchema>;
```

2. **Crie a classe de Service** em `src/app/services/<dominio>/<Nome>Service.ts` estendendo `BaseService`:

```ts
import { BaseService } from "../BaseService";
import { MeuResponse, meuResponseSchema } from "../../models/dto/<dominio>/Meu";

export class MeuService extends BaseService {
    async listar(): Promise<MeuResponse[]> {
        return this.get("/meus-recursos", {}, z.array(meuResponseSchema));
    }

    async criar(data: MeuRequest): Promise<MeuResponse> {
        return this.post("/meus-recursos", data, {}, meuResponseSchema);
    }
}
```

- Services são **classes instanciadas no componente**: `const meuService = new MeuService();` (padrão usado em `Login.tsx`, `GestaoConvitesCadastro.tsx`).
- **Query params**: o `HttpRequest` não tem suporte nativo — monte a query string com `URLSearchParams` e concatene no path (ver `ConviteService.listarCadastros`).
- Services sem HTTP (ex.: utilitários de sessão como `AuthService`) não precisam estender `BaseService`.

### Tratamento de erro no componente

Capture `HttpError` (de `src/app/utils/HttpError.ts`) e leia a mensagem em `err.response?.mensagem`:

```ts
import { HttpError } from "../utils/HttpError";

try {
    await meuService.criar(payload);
} catch (err) {
    if (err instanceof HttpError) {
        setErro(err.response?.mensagem || err.message);
    } else {
        setErro("Mensagem genérica de falha.");
    }
}
```

`HttpError` tem `status: number` e `response: ErroResponse | null` (`ErroResponse` = `{ status, mensagem, timestamp }`).

### Autenticação / sessão

- Token JWT em `localStorage["token"]`, tipo em `localStorage["token_tipo"]`.
- `AuthService` (`services/auth/AuthService.ts`) centraliza: `getToken()`, `isAuthenticated()`, `logout()`, `getUserAccessLevel()` (decodifica o JWT) e `isAdminOrInitialAdmin()`.
- Em **401**, `TratarExcecao` já redireciona para `/login` automaticamente.

## Convenções de código

- **Idioma**: português (pt-BR) para nomes de métodos, variáveis, mensagens de UI e comentários; inglês apenas onde o ecossistema impõe (ex.: nomes de campos de DTO que espelham a API).
- **Indentação**: services/models/utils usam 4 espaços; componentes/páginas usam 2 espaços (siga o arquivo que estiver editando).
- **Componentes**: function components nomeados (`export function MinhaPagina()`).
- **Páginas** ficam em `src/app/pages/` e são registradas nas rotas em `src/main.tsx`.
- **Estilo visual**: tema escuro. Paleta recorrente: fundo `#121212`, cards `#1e1e1e`, bordas `#2e2e2e`, texto primário `white`, texto secundário `#9e9e9e`, destaque/acento `#ff8c42` (laranja), sucesso `#10b981`, erro `#ef4444`. Cantos arredondados (`rounded-xl`/`rounded-2xl`).
- **Ícones**: `lucide-react`.
- **Não criar** novos arquivos de configuração, clientes HTTP ou pastas fora da estrutura acima sem necessidade.

## Proibido

- ❌ Recriar `src/api/` ou qualquer padrão de API baseado em objetos literais (`xxxApi = { ... }`).
- ❌ Chamar `fetch` diretamente fora de `HttpRequest`.
- ❌ Ignorar o schema Zod nas respostas (sempre passe o `schema` quando houver DTO).
- ❌ Duplicar lógica de token/JWT fora do `AuthService`.
