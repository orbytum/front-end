import { expect, type Page } from "@playwright/test";

export class ProjetosPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/projetos");
    await expect(this.page.getByRole("button", { name: "Novo Projeto" })).toBeVisible();
  }

  async selecionarProjeto(titulo: string): Promise<void> {
    await this.page.getByTitle("Alternar projeto selecionado").click();
    await this.page.getByRole("button", { name: new RegExp(titulo) }).last().click();
  }

  async criarProjeto(titulo: string, assunto: string): Promise<void> {
    await this.page.getByRole("button", { name: "Novo Projeto" }).click();
    await expect(this.page.getByRole("heading", { name: "Novo Projeto" })).toBeVisible();
    await this.page.getByPlaceholder("Ex: Desenvolvimento de Modelo de Deep Learning").fill(titulo);
    await this.page.getByPlaceholder("Descreva o objetivo do projeto").fill(assunto);
    await this.page.getByRole("button", { name: "Criar Projeto" }).click();
  }

  async favoritarProjeto(): Promise<void> {
    await this.page.getByTitle("Favoritar projeto").click();
  }

  async adicionarParticipante(nome: string): Promise<void> {
    await this.page.getByTitle("Gerenciar participantes").click();
    await this.page.getByRole("combobox").first().selectOption({ label: nome });
    await this.page.getByRole("button", { name: "Adicionar" }).click();
  }

  async abrirAbaPublicacoes(): Promise<void> {
    await this.page.getByRole("button", { name: "Publicações" }).click();
  }
}
