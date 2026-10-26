import { z } from "zod";

export const participanteProjetoResponseSchema = z.object({
  usuarioId: z.number(),
  nome: z.string(),
  email: z.string(),
  liderProjeto: z.boolean().optional().default(false),
  isAtivo: z.boolean().optional().default(true),
});

export type ParticipanteProjetoResponse = z.infer<typeof participanteProjetoResponseSchema>;

export const adicionarParticipanteRequestSchema = z.object({
  usuarioId: z.number(),
  /** true torna o participante o líder do projeto (substitui o líder atual). */
  liderProjeto: z.boolean().optional(),
});

export type AdicionarParticipanteRequest = z.infer<typeof adicionarParticipanteRequestSchema>;
