import { test, expect } from "../fixtures/auth";
import { GruposPage } from "../page-objects/GruposPage";
import { ParticipantesPage } from "../page-objects/ParticipantesPage";

const GRUPO_SEED = process.env.E2E_GROUP_NAME ?? "Grupo E2E Orbytum";
const LIDER_EMAIL = process.env.E2E_LEADER_EMAIL ?? "lider.e2e@orbytum.com";

test.describe("Gestão de grupos", () => {
  test.use({ storageState: ".auth/admin.json" });

  test("admin vê a tela de gestão de grupos", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    await expect(page.getByRole("heading", { name: "Lista de Grupos de Pesquisa" })).toBeVisible();
  });

  test("admin cria um grupo com líder já cadastrado", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    const nome = `Grupo Playwright ${Date.now()}`;
    await grupos.criarGrupo(nome, LIDER_EMAIL);
    await expect(page.getByText("Grupo criado e convite de Líder enviado com sucesso!")).toBeVisible();
    await grupos.concluirCriacao();
    await grupos.filtrarPorNome(nome);
    await expect(page.getByText(nome)).toBeVisible();
  });

  test("admin cria um grupo com líder ainda não cadastrado", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    const nome = `Grupo Playwright Pendente ${Date.now()}`;
    const email = `lider.pendente.${Date.now()}@orbytum.com`;
    await grupos.criarGrupo(nome, email);
    await expect(page.getByText("Grupo criado e convite de Líder enviado com sucesso!")).toBeVisible();
    await grupos.concluirCriacao();
    await grupos.filtrarPorNome(nome);
    await expect(page.getByText(nome)).toBeVisible();
  });

  test("admin edita o nome de um grupo", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    const nomeOriginal = `Grupo Editável ${Date.now()}`;
    await grupos.criarGrupo(nomeOriginal, LIDER_EMAIL);
    await grupos.concluirCriacao();
    await grupos.filtrarPorNome(nomeOriginal);
    const novoNome = `${nomeOriginal} Editado`;
    await grupos.editarGrupo(nomeOriginal, novoNome);
    await expect(page.getByText(novoNome)).toBeVisible();
  });

  test("admin filtra grupos por nome", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    const nome = `Grupo Filtro ${Date.now()}`;
    await grupos.criarGrupo(nome, LIDER_EMAIL);
    await grupos.concluirCriacao();
    await grupos.filtrarPorNome(nome);
    await expect(page.getByText(nome)).toBeVisible();
  });

  test("admin navega para os participantes do grupo", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    await grupos.abrirParticipantes(GRUPO_SEED);
    const participantes = new ParticipantesPage(page);
    await participantes.expectGrupo(GRUPO_SEED);
  });

  test("admin gera link de convite para o grupo", async ({ page }) => {
    const grupos = new GruposPage(page);
    await grupos.goto();
    await grupos.abrirParticipantes(GRUPO_SEED);
    const participantes = new ParticipantesPage(page);
    await participantes.gerarLink();
  });
});
