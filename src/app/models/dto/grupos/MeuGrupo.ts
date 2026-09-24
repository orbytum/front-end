import { z } from "zod";
import { nivelMembroSchema } from "../NivelMembro";

export const meuGrupoResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  role: z.string().optional().nullable(),
  nivel: nivelMembroSchema.optional().nullable(),
  isLider: z.boolean().optional().nullable(),
});

export type MeuGrupoResponse = z.infer<typeof meuGrupoResponseSchema>;
