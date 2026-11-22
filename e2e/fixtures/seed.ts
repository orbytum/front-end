import fs from "node:fs";
import path from "node:path";
import { APIRequestContext } from "@playwright/test";
import {
  ADMIN_INICIAL,
  adicionarAoGrupo,
  criarAtividade,
  criarEdital,
  criarLembrete,
  criarMaterial,
  criarNoticia,
  criarProjeto,
  criarSolicitacao,
  criarUsuarioPorConvite,
  login,
  obterOuCriarGrupo,
  obterUsuarioId,
  registrarAdmin,
  type UsuarioSeed,
} from "../support/api";

export type UsuarioSeedComId = UsuarioSeed & { id: number };

export type SeedData = {
  admin: UsuarioSeedComId;
  lider: UsuarioSeedComId;
  pesquisador: UsuarioSeedComId;
  colaborador: UsuarioSeedComId;
  grupo: { id: number; nome: string };
  projeto: { id: number; titulo: string };
  atividade: { id: number; titulo: string };
  noticia: { id: number; titulo: string };
  edital: { id: number; descricao: string };
  material: { id: number; nome: string };
  lembrete: { id: number; titulo: string };
  solicitacao: { id: number; titulo: string };
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

async function idDoUsuario(api: APIRequestContext, token: string, grupoId: number): Promise<number> {
  try {
    return await obterUsuarioId(api, token, grupoId);
  } catch {
    return 0;
  }
}

export async function seedDados(api: APIRequestContext): Promise<SeedData> {
  let tokenAdmin = await login(api, ADMIN.email, ADMIN.senha);

  if (!tokenAdmin) {
    const tokenInicial = await login(api, ADMIN_INICIAL.email, ADMIN_INICIAL.senha);
    if (!tokenInicial) {
      throw new Error("Não foi possível autenticar como admin inicial nem admin E2E.");
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

  const adminId = await idDoUsuario(api, tokenAdmin, grupo.id);
  const liderId = await idDoUsuario(api, tokenLider, grupo.id);
  const pesquisadorId = await idDoUsuario(api, tokenPesquisador, grupo.id);
  const colaboradorId = await idDoUsuario(api, tokenColaborador, grupo.id);

  const sufixo = Date.now();
  const projeto = await criarProjeto(api, tokenLider, grupo.id, `Projeto E2E ${sufixo}`);
  const atividade = await criarAtividade(api, tokenLider, projeto.id, liderId, `Atividade E2E ${sufixo}`);
  const noticia = await criarNoticia(api, tokenLider, grupo.id, `Notícia E2E ${sufixo}`, [projeto.id]);
  const edital = await criarEdital(api, tokenLider, grupo.id, `Organização E2E ${sufixo}`, `Edital E2E ${sufixo}`, [projeto.id]);
  const material = await criarMaterial(api, tokenAdmin, `Material E2E ${sufixo}`, `E2E-${sufixo}`);
  const lembrete = await criarLembrete(api, tokenLider, grupo.id, `Lembrete E2E ${sufixo}`);
  const solicitacao = await criarSolicitacao(api, tokenLider, projeto.id, `Solicitação E2E ${sufixo}`);

  salvarStorageState(tokenAdmin, ".auth/admin.json");
  salvarStorageState(tokenLider, ".auth/lider.json");
  salvarStorageState(tokenPesquisador, ".auth/pesquisador.json");
  salvarStorageState(tokenColaborador, ".auth/colaborador.json");

  const dados: SeedData = {
    admin: { ...ADMIN, id: adminId },
    lider: { ...LIDER, id: liderId },
    pesquisador: { ...PESQUISADOR, id: pesquisadorId },
    colaborador: { ...COLABORADOR, id: colaboradorId },
    grupo: { id: grupo.id, nome: grupo.nome },
    projeto: { id: projeto.id, titulo: projeto.titulo },
    atividade: { id: atividade.id, titulo: atividade.titulo },
    noticia: { id: noticia.id, titulo: noticia.titulo },
    edital: { id: edital.id, descricao: edital.descricao },
    material: { id: material.id, nome: material.nome },
    lembrete: { id: lembrete.id, titulo: lembrete.titulo },
    solicitacao: { id: solicitacao.id, titulo: solicitacao.titulo },
  };

  fs.mkdirSync("test-results", { recursive: true });
  fs.writeFileSync("test-results/seed-data.json", JSON.stringify(dados, null, 2));

  return dados;
}

export function lerSeed(): SeedData {
  const caminho = path.resolve("test-results/seed-data.json");
  return JSON.parse(fs.readFileSync(caminho, "utf-8")) as SeedData;
}
