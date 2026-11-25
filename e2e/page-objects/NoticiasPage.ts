import { expect, type Page } from "@playwright/test";

export class NoticiasPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/noticias");
    await expect(this.page.getByRole("heading", { name: "Notícias" })).toBeVisible();
  }

  async criarNoticia(titulo: string, conteudo: string, assunto: string): Promise<void> {
    await this.page.getByRole("button", { name: "Nova Notícia" }).click();
    await this.page.getByPlaceholder("Título da notícia").fill(titulo);
    await this.page.getByPlaceholder("Descrição / conteúdo da notícia").fill(conteudo);
    await this.page.getByPlaceholder("Ex: Inteligência Artificial, Editais, Eventos...").fill(assunto);
    await this.page.getByRole("button", { name: /Cadastrar|Publicar|Salvar/i }).last().click();
  }

  async abrirAprovacoes(): Promise<void> {
    await this.page.getByRole("button", { name: "Aprovações" }).click();
  }

  async abrirAprovacoesEBuscar(titulo: string): Promise<void> {
    await this.abrirAprovacoes();
    const proxima = this.page.getByRole("button").last();
    for (let i = 0; i < 20; i++) {
      if (await this.page.getByText(titulo).first().isVisible().catch(() => false)) return;
      if (await proxima.isDisabled().catch(() => true)) return;
      await proxima.click();
    }
  }
}
