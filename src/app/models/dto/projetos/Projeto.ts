import { z } from "zod";

export const projetoResponseSchema = z.object({
  id: z.number(),
  grupoId: z.number().nullable().optional(),
  status: z.string(),
  titulo: z.string(),
  assunto: z.string().nullable().optional(),
  dthRegistro: z.string().nullable().optional(),
  isAtivo: z.boolean().nullable().optional(),
  isInicial: z.boolean().nullable().optional(),
  isFavorito: z.boolean().nullable().optional(),
});

export type ProjetoResponse = z.infer<typeof projetoResponseSchema>;

export const criarProjetoRequestSchema = z.object({
  grupoId: z.number(),
  status: z.string(),
  titulo: z.string(),
  assunto: z.string(),
});

export type CriarProjetoRequest = z.infer<typeof criarProjetoRequestSchema>;

export const editarProjetoRequestSchema = z.object({
  status: z.string(),
  titulo: z.string(),
  assunto: z.string(),
  isAtivo: z.boolean(),
});

export type EditarProjetoRequest = z.infer<typeof editarProjetoRequestSchema>;

export const PROJETO_STATUS = [
  "PLANEJADO",
  "EM_ANDAMENTO",
  "CONCLUIDO",
  "ENCERRADO",
  "CANCELADO",
] as const;

export type ProjetoStatus = (typeof PROJETO_STATUS)[number];

export const ProjetoStatusLabels: Record<ProjetoStatus, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  ENCERRADO: "Encerrado",
  CANCELADO: "Cancelado",
};

export function projetoEstaAberto(status?: string | null): boolean {
  const normalizado = (status || "").toUpperCase();
  return normalizado === "PLANEJADO" || normalizado === "EM_ANDAMENTO";
}
