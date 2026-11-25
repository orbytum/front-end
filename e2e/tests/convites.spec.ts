import { test, expect } from "../fixtures/auth";
import { ConvitesPage } from "../page-objects/ConvitesPage";

test.describe("Convites de cadastro", () => {
  test.use({ storageState: ".auth/admin.json" });

  test("lista os convites", async ({ page }) => {
    const convites = new ConvitesPage(page);
    await convites.goto();
    await expect(page.getByText("Histórico de Convites")).toBeVisible();
  });

  test("gera um novo convite", async ({ page }) => {
    const convites = new ConvitesPage(page);
    await convites.goto();
    const email = `convite.playwright.${Date.now()}@orbytum.com`;
    await convites.gerarConvite(email);
    await expect(page.getByText(email)).toBeVisible();
  });
});
