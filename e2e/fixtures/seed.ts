import fs from "node:fs";
import path from "node:path";
import { APIRequestContext } from "@playwright/test";
import {
  ADMIN_INICIAL,
  adicionarAoGrupo,
  criarUsuarioPorConvite,
  login,
  obterOuCriarGrupo,
  registrarAdmin,
  type UsuarioSeed,
} from "../support/api";

export type SeedData = {
  admin: UsuarioSeed;
  lider: UsuarioSeed;
  pesquisador: UsuarioSeed;
  colaborador: UsuarioSeed;
  grupo: { id: number; nome: string };
};

const ADMIN: UsuarioSeed = {
  nome: "Administrador E2E",
  email: process.env.E2E_ADMIN_EMAIL ?? "admin.e2e@orbytum.com",
  senha: process.env.E2E_ADMIN_PASSWORD ?? "AdminE2E@123",
  telefone: "11999990001",
  titulo: "Administrador",
};

const LIDER: UsuarioSeed = {
  nome: "Líder E2E",
  email: process.env.E2E_LEADER_EMAIL ?? "lider.e2e@orbytum.com",
  senha: process.env.E2E_LEADER_PASSWORD ?? "LiderE2E@123",
  telefone: "11999990002",
  titulo: "Líder de Grupo",
};

const PESQUISADOR: UsuarioSeed = {
  nome: "Pesquisador E2E",
  email: process.env.E2E_RESEARCHER_EMAIL ?? "pesquisador.e2e@orbytum.com",
  senha: process.env.E2E_RESEARCHER_PASSWORD ?? "PesqE2E@123",
  telefone: "11999990003",
  titulo: "Pesquisador",
};

const COLABORADOR: UsuarioSeed = {
  nome: "Colaborador E2E",
  email: process.env.E2E_COLLABORATOR_EMAIL ?? "colaborador.e2e@orbytum.com",
  senha: process.env.E2E_COLLABORATOR_PASSWORD ?? "ColabE2E@123",
  telefone: "11999990004",
  titulo: "Colaborador",
};

const GRUPO_NOME = process.env.E2E_GROUP_NAME ?? "Grupo E2E Orbytum";

function salvarStorageState(token: string, destino: string): void {
  const origin = process.env.E2E_BASE_URL ?? "http://localhost:5174";
  const conteudo = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          { name: "token", value: token },
          { name: "token_tipo", value: "Bearer" },
        ],
      },
    ],
  };
  const caminho = path.resolve(destino);
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  fs.writeFileSync(caminho, JSON.stringify(conteudo, null, 2));
}

export async function seedDados(api: APIRequestContext): Promise<SeedData> {
  let tokenAdmin = await login(api, ADMIN.email, ADMIN.senha);

  if (!tokenAdmin) {
    const tokenInicial = await login(api, ADMIN_INICIAL.email, ADMIN_INICIAL.senha);
    if (!tokenInicial) {
      throw new Error("Não foi possível autenticar como admin inicial nem como admin E2E.");
    }
    await registrarAdmin(api, tokenInicial, ADMIN);
    tokenAdmin = await login(api, ADMIN.email, ADMIN.senha);
    if (!tokenAdmin) {
      throw new Error("Admin E2E não autenticou após o registro.");
    }
  }

  const tokenLider = await criarUsuarioPorConvite(api, tokenAdmin, LIDER);
  const tokenPesquisador = await criarUsuarioPorConvite(api, tokenAdmin, PESQUISADOR);
  const tokenColaborador = await criarUsuarioPorConvite(api, tokenAdmin, COLABORADOR);

  const grupo = await obterOuCriarGrupo(api, tokenAdmin, GRUPO_NOME, LIDER.email);
  await adicionarAoGrupo(api, tokenAdmin, grupo.id, PESQUISADOR, "PESQUISADOR");
  await adicionarAoGrupo(api, tokenAdmin, grupo.id, COLABORADOR, "COLABORADOR");

  salvarStorageState(tokenAdmin, ".auth/admin.json");
  salvarStorageState(tokenLider, ".auth/lider.json");
  salvarStorageState(tokenPesquisador, ".auth/pesquisador.json");
  salvarStorageState(tokenColaborador, ".auth/colaborador.json");

  const dados: SeedData = {
    admin: ADMIN,
    lider: LIDER,
    pesquisador: PESQUISADOR,
    colaborador: COLABORADOR,
    grupo: { id: grupo.id, nome: grupo.nome },
  };

  fs.mkdirSync("test-results", { recursive: true });
  fs.writeFileSync("test-results/seed-data.json", JSON.stringify(dados, null, 2));

  return dados;
}
