import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { LembretesPage } from "../page-objects/LembretesPage";

const seed = lerSeed();

test.describe("Lembretes", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("lista os lembretes", async ({ page }) => {
    const lembretes = new LembretesPage(page);
    await lembretes.goto();
    await lembretes.buscar(seed.lembrete.titulo);
    await expect(page.getByText(seed.lembrete.titulo).first()).toBeVisible();
  });

  test("cria um novo lembrete", async ({ page }) => {
    const lembretes = new LembretesPage(page);
    await lembretes.goto();
    const titulo = `Lembrete Playwright ${Date.now()}`;
    await lembretes.criarLembrete(titulo, "Lembrete criado pela suíte E2E");
    await lembretes.buscar(titulo);
    await expect(page.getByText(titulo).first()).toBeVisible();
  });
});
