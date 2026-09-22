import { z } from "zod";

export const projetoResponseSchema = z.object({
  id: z.number(),
  grupoId: z.number().optional().nullable(),
  status: z.string(),
  titulo: z.string(),
  assunto: z.string().optional().nullable(),
  dthRegistro: z.string().optional().nullable(),
  isAtivo: z.boolean().optional().nullable(),
});

export type ProjetoResponse = z.infer<typeof projetoResponseSchema>;

export const criarProjetoRequestSchema = z.object({
  grupoId: z.number(),
  status: z.string(),
  titulo: z.string(),
  assunto: z.string(),
});

export type CriarProjetoRequest = z.infer<typeof criarProjetoRequestSchema>;
