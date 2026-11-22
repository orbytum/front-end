import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { SolicitacoesPage } from "../page-objects/SolicitacoesPage";

const seed = lerSeed();

test.describe("Solicitações", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("lista as solicitações", async ({ page }) => {
    const solicitacoes = new SolicitacoesPage(page);
    await solicitacoes.goto();
    await expect(page.getByText(seed.solicitacao.titulo)).toBeVisible();
  });

  test("cria uma nova solicitação", async ({ page }) => {
    const solicitacoes = new SolicitacoesPage(page);
    await solicitacoes.goto();
    const titulo = `Solicitação Playwright ${Date.now()}`;
    await solicitacoes.criarSolicitacao(titulo, "Justificativa criada pela suíte E2E");
    await expect(page.getByText(titulo)).toBeVisible();
  });
});
