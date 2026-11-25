import { expect, type Page } from "@playwright/test";

export class EditaisPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/editais");
    await expect(this.page.getByRole("heading", { name: "Editais e Eventos" })).toBeVisible();
  }

  async buscar(descricao: string): Promise<void> {
    await this.page.getByPlaceholder("Buscar na descrição...").fill(descricao);
    await this.page.getByRole("button", { name: "Filtrar editais" }).click();
  }

  async criarEdital(descricao: string): Promise<void> {
    await this.page.getByRole("button", { name: "Novo Edital" }).click();
    await expect(this.page.getByRole("heading", { name: "Novo Edital" })).toBeVisible();
    await this.page.getByPlaceholder("Ex.: FAPESP, CNPq, CAPES...").fill("Organização Playwright");
    await this.page.getByPlaceholder("Descreva o edital, requisitos e áreas contempladas...").fill(descricao);
    await this.page.getByPlaceholder("https://...").fill(`https://example.com/edital-${Date.now()}`);
    const datas = this.page.getByPlaceholder("dd/MM/yyyy HH:mm");
    await datas.nth(0).fill("31/12/2026 10:00");
    await datas.nth(1).fill("31/12/2026 18:00");
    await this.page.getByRole("button", { name: "Cadastrar Edital" }).click();
  }
}
