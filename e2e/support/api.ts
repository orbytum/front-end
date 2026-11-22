import { APIRequestContext } from "@playwright/test";

export type UsuarioSeed = {
  id?: number;
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

function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function exigirOk(resposta: Awaited<ReturnType<APIRequestContext["post"]>>, contexto: string): Promise<void> {
  if (!resposta.ok()) {
    throw new Error(`${contexto}: ${resposta.status()} ${await resposta.text()}`);
  }
}

export async function obterUsuarioId(
  api: APIRequestContext,
  token: string,
  grupoId: number,
): Promise<number> {
  const resposta = await api.get("/grupos/meus-grupos", { headers: auth(token) });
  await exigirOk(resposta, "Falha ao listar meus grupos");
  const grupos = (await resposta.json()) as Array<{ id: number; usuarioId: number }>;
  const grupo = grupos.find((item) => item.id === grupoId);
  if (!grupo) throw new Error(`Usuário não pertence ao grupo ${grupoId}`);
  return grupo.usuarioId;
}

export async function criarProjeto(
  api: APIRequestContext,
  token: string,
  grupoId: number,
  titulo: string,
  status = "PLANEJADO",
): Promise<{ id: number; titulo: string }> {
  const resposta = await api.post("/projetos", {
    headers: auth(token),
    data: { grupoId, status, titulo, assunto: "Projeto criado pela suíte E2E" },
  });
  await exigirOk(resposta, "Falha ao criar projeto");
  return resposta.json();
}

export async function criarAtividade(
  api: APIRequestContext,
  token: string,
  projetoId: number,
  responsavelId: number,
  titulo: string,
): Promise<{ id: number; titulo: string }> {
  const prazo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const resposta = await api.post("/atividades", {
    headers: auth(token),
    data: {
      projetoId,
      responsavelId,
      titulo,
      descricao: "Atividade criada pela suíte E2E",
      dthPrazo: prazo,
    },
  });
  await exigirOk(resposta, "Falha ao criar atividade");
  return resposta.json();
}

export async function criarNoticia(
  api: APIRequestContext,
  token: string,
  grupoId: number,
  titulo: string,
  projetoIds: number[] = [],
): Promise<{ id: number; titulo: string }> {
  const resposta = await api.post("/noticias", {
    headers: auth(token),
    data: {
      grupoId,
      titulo,
      conteudo: "Conteúdo criado pela suíte E2E",
      assunto: "E2E",
      projetoIds,
    },
  });
  await exigirOk(resposta, "Falha ao criar notícia");
  return resposta.json();
}

export async function criarEdital(
  api: APIRequestContext,
  token: string,
  grupoId: number,
  organizador: string,
  descricao: string,
  projetoIds: number[] = [],
): Promise<{ id: number; descricao: string }> {
  const abertura = new Date().toISOString().slice(0, 19);
  const encerramento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const resposta = await api.post(`/grupos/${grupoId}/editais`, {
    headers: auth(token),
    data: {
      organizador,
      descricao,
      valor: 1000,
      uri: `https://example.com/edital-e2e-${Date.now()}`,
      dthAbertura: abertura,
      dthEncerramento: encerramento,
      projetoIds,
    },
  });
  await exigirOk(resposta, "Falha ao criar edital");
  return resposta.json();
}

export async function criarMaterial(
  api: APIRequestContext,
  token: string,
  nome: string,
  identificador: string,
): Promise<{ id: number; nome: string }> {
  const resposta = await api.post("/materiais", {
    headers: auth(token),
    data: {
      nome,
      descricao: "Material criado pela suíte E2E",
      categoria: "Equipamento",
      identificador,
      quantidade: 1,
      localizacao: "Sala E2E",
      dthCompra: new Date().toISOString().slice(0, 19),
      status: "DISPONIVEL",
    },
  });
  await exigirOk(resposta, "Falha ao criar material");
  return resposta.json();
}

export async function criarLembrete(
  api: APIRequestContext,
  token: string,
  grupoId: number,
  titulo: string,
): Promise<{ id: number; titulo: string }> {
  const resposta = await api.post("/lembretes", {
    headers: auth(token),
    data: {
      grupoId,
      titulo,
      tipo: "Reunião",
      dataHora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
      paraGrupoInteiro: true,
    },
  });
  await exigirOk(resposta, "Falha ao criar lembrete");
  return resposta.json();
}

export async function criarSolicitacao(
  api: APIRequestContext,
  token: string,
  projetoId: number,
  titulo: string,
): Promise<{ id: number; titulo: string }> {
  const resposta = await api.post("/solicitacoes", {
    headers: auth(token),
    data: {
      titulo,
      descricao: "Solicitação criada pela suíte E2E",
      justificativa: "Teste E2E",
      tipo: "financiamento",
      projetoId,
      valor: 500,
    },
  });
  await exigirOk(resposta, "Falha ao criar solicitação");
  return resposta.json();
}
