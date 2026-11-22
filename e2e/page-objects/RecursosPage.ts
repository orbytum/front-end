import { expect, type Page } from "@playwright/test";

export class RecursosPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/recursos");
    await expect(this.page.getByRole("heading", { name: "Recursos Financeiros" })).toBeVisible();
  }

  async expectTabelaVisivel(): Promise<void> {
    await expect(this.page.getByText("Alocação por Grupo")).toBeVisible();
  }
}
