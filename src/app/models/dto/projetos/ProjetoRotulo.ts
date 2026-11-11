import { z } from "zod";

export const projetoRotuloSchema = z.object({
  id: z.number(),
  titulo: z.string(),
});

export type ProjetoRotulo = z.infer<typeof projetoRotuloSchema>;
