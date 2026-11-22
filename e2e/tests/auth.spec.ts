import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { LayoutPage } from "../page-objects/LayoutPage";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin.e2e@orbytum.com";
const ADMIN_SENHA = process.env.E2E_ADMIN_PASSWORD ?? "AdminE2E@123";
const LIDER_EMAIL = process.env.E2E_LEADER_EMAIL ?? "lider.e2e@orbytum.com";
const LIDER_SENHA = process.env.E2E_LEADER_PASSWORD ?? "LiderE2E@123";

test.describe("Autenticação", () => {
  test("login de administrador redireciona para a gestão de grupos", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(ADMIN_EMAIL, ADMIN_SENHA);
    await expect(page).toHaveURL(/\/grupos$/);
    await expect(page.getByRole("heading", { name: "Gestão de Grupos de Pesquisa" })).toBeVisible();
  });

  test("login de líder redireciona para o dashboard", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(LIDER_EMAIL, LIDER_SENHA);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Sistema de Gestão Acadêmica" })).toBeVisible();
  });

  test("credenciais inválidas exibem mensagem de erro", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("invalido@orbytum.com", "senha-errada");
    await expect(page.getByText("Ops! Credenciais inválidas")).toBeVisible();
  });

  test("rota protegida sem token redireciona para o login", async ({ page }) => {
    await page.goto("/grupos");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logout retorna para o login", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(ADMIN_EMAIL, ADMIN_SENHA);
    await expect(page).toHaveURL(/\/grupos$/);
    const layout = new LayoutPage(page);
    await layout.sair();
    await expect(page).toHaveURL(/\/login$/);
  });
});
