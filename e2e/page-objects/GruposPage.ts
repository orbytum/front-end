import { expect, type Page } from "@playwright/test";

export class GruposPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/grupos");
    await expect(this.page.getByRole("heading", { name: "Gestão de Grupos de Pesquisa" })).toBeVisible();
  }

  async abrirNovoGrupo(): Promise<void> {
    await this.page.getByRole("button", { name: "Novo Grupo" }).click();
    await expect(this.page.getByRole("heading", { name: "Novo Grupo de Pesquisa" })).toBeVisible();
  }

  async criarGrupo(nome: string, emailLider: string): Promise<void> {
    await this.abrirNovoGrupo();
    await this.page.getByPlaceholder("Inteligência Artificial").fill(nome);
    await this.page.getByPlaceholder("lider@universidade.edu.br").fill(emailLider);
    await this.page.getByRole("button", { name: "Criar Grupo e Convidar Líder" }).click();
  }

  async concluirCriacao(): Promise<void> {
    await this.page.getByRole("button", { name: "Concluir" }).click();
  }

  async editarGrupo(nomeAtual: string, novoNome: string): Promise<void> {
    const linha = this.page.getByRole("row", { name: new RegExp(nomeAtual) });
    await linha.getByTitle("Editar grupo").click();
    await expect(this.page.getByRole("heading", { name: "Editar Grupo de Pesquisa" })).toBeVisible();
    const campoNome = this.page.locator('label:has-text("Nome do Grupo")').locator("..").locator("input");
    await campoNome.fill(novoNome);
    await this.page.getByRole("button", { name: "Salvar Alterações" }).click();
  }

  async filtrarPorNome(nome: string): Promise<void> {
    await this.page.getByPlaceholder("Filtrar por nome do grupo...").fill(nome);
  }

  async abrirParticipantes(nome: string): Promise<void> {
    const linha = this.page.getByRole("row", { name: new RegExp(nome) });
    await linha.getByTitle("Ver participantes").last().click();
  }
}
