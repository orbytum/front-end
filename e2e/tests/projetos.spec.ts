import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { ProjetosPage } from "../page-objects/ProjetosPage";

const seed = lerSeed();

test.describe("Painel de Projetos", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("lista os projetos do grupo", async ({ page }) => {
    const projetos = new ProjetosPage(page);
    await projetos.goto();
    await expect(page.getByRole("button", { name: "Novo Projeto" })).toBeVisible();
  });

  test("cria um novo projeto", async ({ page }) => {
    const projetos = new ProjetosPage(page);
    await projetos.goto();
    const titulo = `Projeto Playwright ${Date.now()}`;
    await projetos.criarProjeto(titulo, "Projeto criado pela suíte E2E");
    await expect(page.getByText(titulo).first()).toBeVisible();
  });

  test("favorita um projeto", async ({ page }) => {
    const projetos = new ProjetosPage(page);
    await projetos.goto();
    await projetos.selecionarProjeto(seed.projeto.titulo);
    await projetos.favoritarProjeto();
    await expect(page.getByTitle("Remover dos favoritos")).toBeVisible();
  });

  test("adiciona um participante ao projeto", async ({ page }) => {
    const projetos = new ProjetosPage(page);
    await projetos.goto();
    await projetos.selecionarProjeto(seed.projeto.titulo);
    await projetos.adicionarParticipante(seed.pesquisador.nome);
    await expect(page.getByText(seed.pesquisador.nome)).toBeVisible();
  });

  test("abre a aba de publicações do projeto", async ({ page }) => {
    const projetos = new ProjetosPage(page);
    await projetos.goto();
    await projetos.selecionarProjeto(seed.projeto.titulo);
    await projetos.abrirAbaPublicacoes();
    await expect(page.getByRole("heading", { name: "Publicações" })).toBeVisible();
  });
});
