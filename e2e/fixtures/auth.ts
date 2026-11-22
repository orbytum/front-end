import { test as base, expect, type Page } from "@playwright/test";

type Fixtures = {
  adminPage: Page;
  liderPage: Page;
  pesquisadorPage: Page;
  colaboradorPage: Page;
};

export const test = base.extend<Fixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ".auth/admin.json" });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  liderPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ".auth/lider.json" });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  pesquisadorPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ".auth/pesquisador.json" });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  colaboradorPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ".auth/colaborador.json" });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
