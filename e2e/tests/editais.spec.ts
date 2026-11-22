import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { EditaisPage } from "../page-objects/EditaisPage";

const seed = lerSeed();

test.describe("Editais", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("lista os editais", async ({ page }) => {
    const editais = new EditaisPage(page);
    await editais.goto();
    await editais.buscar(seed.edital.descricao);
    await expect(page.getByText(seed.edital.descricao).first()).toBeVisible();
  });

  test("cria um novo edital", async ({ page }) => {
    const editais = new EditaisPage(page);
    await editais.goto();
    const titulo = `Edital Playwright ${Date.now()}`;
    await editais.criarEdital(titulo);
    await editais.buscar(titulo);
    await expect(page.getByText(titulo).first()).toBeVisible();
  });
});
