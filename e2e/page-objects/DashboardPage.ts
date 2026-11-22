import { expect, type Page } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page.getByRole("heading", { name: "ORBYTUM" })).toBeVisible();
  }

  async navegarPara(menu: string): Promise<void> {
    await this.page.getByRole("link", { name: menu }).click();
  }
}
