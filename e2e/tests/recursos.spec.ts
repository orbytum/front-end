import { test } from "../fixtures/auth";
import { RecursosPage } from "../page-objects/RecursosPage";

test.describe("Recursos financeiros", () => {
  test.use({ storageState: ".auth/admin.json" });

  test("abre a tela de recursos", async ({ page }) => {
    const recursos = new RecursosPage(page);
    await recursos.goto();
    await recursos.expectTabelaVisivel();
  });
});
