import { test, expect } from "../fixtures/auth";
import { DashboardPage } from "../page-objects/DashboardPage";

test.describe("Dashboard", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("abre o dashboard do grupo", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });

  test("navega do dashboard para projetos", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.navegarPara("Painel de Projetos");
    await expect(page.getByRole("button", { name: "Novo Projeto" })).toBeVisible();
  });
});
