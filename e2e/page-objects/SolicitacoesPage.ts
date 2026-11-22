import { expect, type Page } from "@playwright/test";

export class SolicitacoesPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/solicitacoes");
    await expect(this.page.getByRole("heading", { name: "Solicitações de Recursos" })).toBeVisible();
  }

  async criarSolicitacao(titulo: string, justificativa: string): Promise<void> {
    await this.page.getByRole("button", { name: "Nova Solicitação" }).click();
    await expect(this.page.getByRole("heading", { name: "Nova Solicitacao" })).toBeVisible();
    await this.page.getByPlaceholder("Ex.: Verba para participacao em conferencia").fill(titulo);
    await this.page.getByPlaceholder("Descreva detalhadamente a solicitacao").fill("Descrição criada pela suíte E2E");
    await this.page.getByPlaceholder("Justifique a necessidade do recurso").fill(justificativa);
    await this.page.getByRole("combobox").filter({ hasText: "Selecione um projeto" }).selectOption({ index: 1 });
    await this.page.getByRole("button", { name: "Criar Solicitacao" }).click();
  }
}
