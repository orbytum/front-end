import { APIRequestContext } from "@playwright/test";

export type UsuarioSeed = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  titulo: string;
};

export type GrupoSeed = {
  id: number;
  nome: string;
};

export const ADMIN_INICIAL = {
  email: "admin.inicial@orbytum.com",
  senha: "AdminInit@123",
};

export async function login(api: APIRequestContext, email: string, senha: string): Promise<string | null> {
  const resposta = await api.post("/auth/login", { data: { email, senha } });
  if (!resposta.ok()) return null;
  const corpo = await resposta.json();
  return corpo.token ?? null;
}

export async function registrarAdmin(api: APIRequestContext, token: string, usuario: UsuarioSeed): Promise<void> {
  const resposta = await api.post("/auth/register-admin", {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      telefone: usuario.telefone,
      titulo: usuario.titulo,
    },
  });
  if (!resposta.ok()) {
    throw new Error(`Falha ao registrar admin: ${resposta.status()} ${await resposta.text()}`);
  }
}

export async function criarUsuarioPorConvite(
  api: APIRequestContext,
  tokenAdmin: string,
  usuario: UsuarioSeed,
): Promise<string> {
  const existente = await login(api, usuario.email, usuario.senha);
  if (existente) return existente;

  const convite = await api.post("/convites/cadastro", {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
    data: { email: usuario.email, diasValidade: 7 },
  });
  if (!convite.ok()) {
    throw new Error(`Falha ao gerar convite para ${usuario.email}: ${convite.status()} ${await convite.text()}`);
  }
  const { token } = await convite.json();

  const aceite = await api.post(`/convites/aceitar/cadastro/${token}`, {
    data: {
      nome: usuario.nome,
      senha: usuario.senha,
      telefone: usuario.telefone,
      titulo: usuario.titulo,
      email: usuario.email,
    },
  });
  if (!aceite.ok()) {
    throw new Error(`Falha ao aceitar convite para ${usuario.email}: ${aceite.status()} ${await aceite.text()}`);
  }
  const corpo = await aceite.json();
  return corpo.token;
}

export async function obterOuCriarGrupo(
  api: APIRequestContext,
  tokenAdmin: string,
  nome: string,
  emailLider: string,
): Promise<GrupoSeed> {
  const lista = await api.get(`/grupos?page=1&size=100&nome=${encodeURIComponent(nome)}`, {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
  });
  if (lista.ok()) {
    const corpo = await lista.json();
    const encontrado = corpo.items?.find((grupo: GrupoSeed) => grupo.nome === nome);
    if (encontrado) return encontrado;
  }

  const criacao = await api.post("/grupos", {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
    data: { nome, emailLider },
  });
  if (!criacao.ok()) {
    throw new Error(`Falha ao criar grupo: ${criacao.status()} ${await criacao.text()}`);
  }
  return criacao.json();
}

export async function adicionarAoGrupo(
  api: APIRequestContext,
  tokenAdmin: string,
  grupoId: number,
  usuario: UsuarioSeed,
  nivel: "LIDER" | "PESQUISADOR" | "COLABORADOR",
): Promise<void> {
  const convite = await api.post("/convites/grupo", {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
    data: { idGrupo: grupoId, nivel, diasValidade: 7 },
  });
  if (!convite.ok()) {
    const texto = await convite.text();
    if (texto.includes("já") || texto.includes("Ja")) return;
    throw new Error(`Falha ao gerar convite de grupo para ${usuario.email}: ${convite.status()} ${texto}`);
  }
  const { token } = await convite.json();

  const tokenUsuario = await login(api, usuario.email, usuario.senha);
  if (!tokenUsuario) return;

  const aceite = await api.post(`/convites/aceitar/grupo/${token}`, {
    headers: { Authorization: `Bearer ${tokenUsuario}` },
  });
  if (!aceite.ok()) {
    const texto = await aceite.text();
    if (texto.includes("já") || texto.includes("Ja")) return;
    throw new Error(`Falha ao aceitar convite de grupo para ${usuario.email}: ${aceite.status()} ${texto}`);
  }
}
