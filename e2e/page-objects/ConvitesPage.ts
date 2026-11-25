import { expect, type Page } from "@playwright/test";

export class ConvitesPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/gestao-convites");
    await expect(this.page.getByRole("heading", { name: "Gestão de Convites de Cadastro", exact: true })).toBeVisible();
  }

  async gerarConvite(email: string): Promise<void> {
    await this.page.getByRole("button", { name: "Novo Convite" }).click();
    await expect(this.page.getByRole("heading", { name: "Novo Convite" })).toBeVisible();
    await this.page.getByPlaceholder("usuario@exemplo.com").fill(email);
    await this.page.getByRole("button", { name: "Gerar e Enviar Convite" }).click();
  }
}
