import { expect, type Page } from "@playwright/test";

export class LayoutPage {
  constructor(private page: Page) {}

  async expectAdminLogado(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: "ORBYTUM" })).toBeVisible();
    await expect(this.page.getByText("Administrador", { exact: true })).toBeVisible();
  }

  async navegarPara(menu: string): Promise<void> {
    await this.page.getByRole("link", { name: menu }).click();
  }

  async sair(): Promise<void> {
    await this.page.getByTitle("Menu do perfil").click();
    await this.page.getByRole("button", { name: "Sair" }).click();
  }
}
