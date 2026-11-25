import { expect, type Page } from "@playwright/test";

export class MateriaisPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/materiais");
    await expect(this.page.getByRole("heading", { name: "Materiais e Equipamentos" })).toBeVisible();
  }

  async criarMaterial(nome: string, descricao: string): Promise<void> {
    await this.page.getByRole("button", { name: "Novo Material" }).click();
    await expect(this.page.getByRole("heading", { name: "Novo Material" })).toBeVisible();
    await this.page.getByPlaceholder("Ex.: Projetor Epson").fill(nome);
    await this.page.locator("textarea").first().fill(descricao);
    await this.page.getByPlaceholder("Ex.: Equipamento").fill("Equipamento");
    await this.page.getByPlaceholder("Ex.: PAT-001").fill(`PAT-${Date.now()}`);
    await this.page.getByRole("spinbutton", { name: "Ex.: 3" }).fill("1");
    await this.page.getByPlaceholder("Ex.: Sala 2").fill("Laboratório");
    await this.page.getByPlaceholder("dd/MM/yyyy HH:mm").fill("31/12/2026 10:00");
    await this.page.getByRole("button", { name: "Cadastrar Material" }).click();
  }
}
