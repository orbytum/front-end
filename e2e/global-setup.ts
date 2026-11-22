import { request } from "@playwright/test";
import { seedDados } from "./fixtures/seed";

export default async function globalSetup(): Promise<void> {
  const apiURL = process.env.E2E_API_URL ?? "http://localhost:8081";
  const api = await request.newContext({ baseURL: apiURL });

  try {
    const saude = await api.get("/v3/api-docs").catch(() => null);
    if (!saude || !saude.ok()) {
      throw new Error(
        `API de teste não está acessível em ${apiURL}. Inicie a API com o banco de teste antes de rodar a suíte.`,
      );
    }

    const dados = await seedDados(api);
    console.log(`Seed concluído: grupo "${dados.grupo.nome}" (id ${dados.grupo.id}).`);
  } finally {
    await api.dispose();
  }
}
