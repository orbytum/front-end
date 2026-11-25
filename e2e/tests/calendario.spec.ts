import { test } from "../fixtures/auth";
import { CalendarioPage } from "../page-objects/CalendarioPage";

test.describe("Calendário", () => {
  test.use({ storageState: ".auth/lider.json" });

  test("abre o calendário do grupo", async ({ page }) => {
    const calendario = new CalendarioPage(page);
    await calendario.goto();
    await calendario.expectAcoesVisiveis();
  });
});
