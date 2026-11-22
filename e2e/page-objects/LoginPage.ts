import { expect, type Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.page.getByRole("heading", { name: "ORBYTUM" })).toBeVisible();
  }

  async preencher(email: string, senha: string): Promise<void> {
    await this.page.getByPlaceholder("email@example.com").fill(email);
    await this.page.getByPlaceholder("••••••••").fill(senha);
  }

  async entrar(): Promise<void> {
    await this.page.getByRole("button", { name: "Entrar" }).click();
  }

  async login(email: string, senha: string): Promise<void> {
    await this.preencher(email, senha);
    await this.entrar();
  }

  async expectErro(mensagem: string): Promise<void> {
    await expect(this.page.getByText(mensagem)).toBeVisible();
  }
}
