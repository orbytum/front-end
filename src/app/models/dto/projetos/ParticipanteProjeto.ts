import { z } from "zod";
import { nivelMembroSchema } from "../NivelMembro";

export const participanteProjetoResponseSchema = z.object({
  usuarioId: z.number(),
  nome: z.string(),
  email: z.string(),
  nivel: nivelMembroSchema.nullable().optional(),
  isAtivo: z.boolean().optional().default(true),
});

export type ParticipanteProjetoResponse = z.infer<typeof participanteProjetoResponseSchema>;

export const adicionarParticipanteRequestSchema = z.object({
  usuarioId: z.number(),
  nivel: nivelMembroSchema.optional(),
});

export type AdicionarParticipanteRequest = z.infer<typeof adicionarParticipanteRequestSchema>;
