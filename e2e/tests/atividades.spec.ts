import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { AtividadesPage } from "../page-objects/AtividadesPage";

const seed = lerSeed();

test.describe("Atividades", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("abre o quadro de atividades do projeto", async ({ page }) => {
    const atividades = new AtividadesPage(page);
    await atividades.goto();
    await atividades.selecionarProjeto(seed.projeto.titulo);
    await expect(page.getByRole("button", { name: "Nova Atividade" })).toBeVisible();
  });

  test("cria uma nova atividade", async ({ page }) => {
    const atividades = new AtividadesPage(page);
    await atividades.goto();
    await atividades.selecionarProjeto(seed.projeto.titulo);
    const titulo = `Atividade Playwright ${Date.now()}`;
    await atividades.criarAtividade(titulo, "Atividade criada pela suíte E2E");
    await expect(page.getByText(titulo)).toBeVisible();
  });
});
