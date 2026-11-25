import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { NoticiasPage } from "../page-objects/NoticiasPage";

const seed = lerSeed();

test.describe("Notícias", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("lista as notícias do grupo", async ({ page }) => {
    const noticias = new NoticiasPage(page);
    await noticias.goto();
    await expect(page.getByRole("button", { name: "Nova Notícia" })).toBeVisible();
  });

  test("cria uma nova notícia", async ({ page }) => {
    const noticias = new NoticiasPage(page);
    await noticias.goto();
    const titulo = `Notícia Playwright ${Date.now()}`;
    await noticias.criarNoticia(titulo, "Conteúdo criado pela suíte E2E", "Pesquisa");
    await noticias.abrirAprovacoesEBuscar(titulo);
    await expect(page.getByText(titulo).first()).toBeVisible();
  });
});
