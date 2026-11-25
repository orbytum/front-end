import { expect, type Page } from "@playwright/test";

export class LembretesPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/lembretes");
    await expect(this.page.getByRole("heading", { name: "Lembretes" })).toBeVisible();
  }

  async criarLembrete(titulo: string, descricao: string): Promise<void> {
    await this.page.getByRole("button", { name: "Novo Lembrete" }).click();
    await expect(this.page.getByRole("heading", { name: "Novo Lembrete" })).toBeVisible();
    await this.page.getByPlaceholder("Título do lembrete").fill(titulo);
    await this.page.getByPlaceholder("Detalhes do lembrete").fill(descricao);
    await this.page.getByPlaceholder("dd/MM/yyyy HH:mm").fill("31/12/2026 10:00");
    await this.page.getByRole("button", { name: "Criar Lembrete" }).click();
  }

  async buscar(titulo: string): Promise<void> {
    await this.page.getByPlaceholder("Buscar lembretes...").fill(titulo);
  }
}
