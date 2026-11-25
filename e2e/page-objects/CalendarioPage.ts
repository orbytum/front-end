import { expect, type Page } from "@playwright/test";

export class CalendarioPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/calendario");
    await expect(this.page.getByRole("heading", { name: "Calendário" })).toBeVisible();
  }

  async expectAcoesVisiveis(): Promise<void> {
    await expect(this.page.getByRole("button", { name: "Exportar .ics" })).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Assinar agenda" })).toBeVisible();
  }
}
