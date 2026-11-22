import { test, expect } from "../fixtures/auth";
import { lerSeed } from "../fixtures/seed";
import { MateriaisPage } from "../page-objects/MateriaisPage";

const seed = lerSeed();

test.describe("Materiais", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("lista os materiais", async ({ page }) => {
    const materiais = new MateriaisPage(page);
    await materiais.goto();
    await expect(page.getByText(seed.material.nome)).toBeVisible();
  });

  test("cria um novo material", async ({ page }) => {
    const materiais = new MateriaisPage(page);
    await materiais.goto();
    const nome = `Material Playwright ${Date.now()}`;
    await materiais.criarMaterial(nome, "Material criado pela suíte E2E");
    await expect(page.getByText(nome)).toBeVisible();
  });
});
