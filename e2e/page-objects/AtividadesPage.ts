import { expect, type Page } from "@playwright/test";

export class AtividadesPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/atividades");
    await expect(this.page.getByRole("heading", { name: "Atividades" })).toBeVisible();
  }

  async selecionarProjeto(titulo: string): Promise<void> {
    await this.page.getByTitle("Alternar projeto selecionado").click();
    await this.page.getByRole("button", { name: new RegExp(titulo) }).last().click();
  }

  async criarAtividade(titulo: string, descricao: string): Promise<void> {
    await this.page.getByRole("button", { name: "Nova Atividade" }).click();
    await expect(this.page.getByRole("heading", { name: "Nova Atividade" })).toBeVisible();
    await this.page.getByPlaceholder("Ex: Coletar amostras").fill(titulo);
    await this.page.getByPlaceholder("Descreva o que deve ser feito").fill(descricao);
    await this.page.getByPlaceholder("dd/MM/yyyy HH:mm").fill("31/12/2026 10:00");
    await this.page.getByRole("combobox").first().selectOption({ index: 1 });
    await this.page.getByRole("button", { name: "Criar Atividade" }).click();
  }
}
