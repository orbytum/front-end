import { expect, type Page } from "@playwright/test";

export class ParticipantesPage {
  constructor(private page: Page) {}

  async expectGrupo(nome: string): Promise<void> {
    await expect(this.page.getByRole("heading", { name: nome })).toBeVisible();
  }

  async abrirConvite(): Promise<void> {
    await this.page.getByRole("button", { name: "Convidar Membro" }).click();
    await expect(this.page.getByRole("heading", { name: "Convidar Membro" })).toBeVisible();
  }

  async gerarLink(): Promise<void> {
    await this.abrirConvite();
    await this.page.getByRole("button", { name: "Gerar Link de Convite" }).click();
    await expect(this.page.getByText("Link de Convite Gerado:")).toBeVisible();
  }
}
