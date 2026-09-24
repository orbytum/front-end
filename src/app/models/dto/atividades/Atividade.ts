import { z } from "zod";

export const atividadeResponseSchema = z.object({
  id: z.number(),
  projetoId: z.number(),
  responsavelId: z.number().nullable().optional(),
  responsavelNome: z.string().nullable().optional(),
  atividadePaiId: z.number().nullable().optional(),
  titulo: z.string(),
  descricao: z.string().nullable().optional(),
  status: z.string(),
  dthRegistro: z.string().nullable().optional(),
  dthPrazo: z.string().nullable().optional(),
  dthConclusao: z.string().nullable().optional(),
  isAtrasada: z.boolean().optional().default(false),
  isAtivo: z.boolean().optional().default(true),
  projetoPodeSerFinalizado: z.boolean().optional().default(false),
});

export type AtividadeResponse = z.infer<typeof atividadeResponseSchema>;

export const criarAtividadeRequestSchema = z.object({
  projetoId: z.number(),
  responsavelId: z.number(),
  atividadePaiId: z.number().nullable().optional(),
  titulo: z.string(),
  descricao: z.string(),
  dthPrazo: z.string(),
});

export type CriarAtividadeRequest = z.infer<typeof criarAtividadeRequestSchema>;

export const editarAtividadeRequestSchema = z.object({
  responsavelId: z.number().nullable().optional(),
  titulo: z.string(),
  descricao: z.string(),
  dthPrazo: z.string().nullable().optional(),
});

export type EditarAtividadeRequest = z.infer<typeof editarAtividadeRequestSchema>;

export const ATIVIDADE_STATUS = [
  "PENDENTE",
  "EM_ANDAMENTO",
  "AGUARDANDO_CONFIRMACAO",
  "CONCLUIDA",
  "ENCERRADA",
] as const;

export type AtividadeStatus = (typeof ATIVIDADE_STATUS)[number];

export const AtividadeStatusLabels: Record<AtividadeStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  AGUARDANDO_CONFIRMACAO: "Aguardando Confirmação",
  CONCLUIDA: "Concluída",
  ENCERRADA: "Encerrada",
};

const PROXIMO_STATUS: Record<AtividadeStatus, AtividadeStatus | null> = {
  PENDENTE: "EM_ANDAMENTO",
  EM_ANDAMENTO: "AGUARDANDO_CONFIRMACAO",
  AGUARDANDO_CONFIRMACAO: "CONCLUIDA",
  CONCLUIDA: "ENCERRADA",
  ENCERRADA: null,
};

export function proximoStatusAtividade(status: string): AtividadeStatus | null {
  return PROXIMO_STATUS[(status || "").toUpperCase() as AtividadeStatus] ?? null;
}

export function atividadeEstaAberta(status?: string | null): boolean {
  const normalizado = (status || "").toUpperCase();
  return normalizado !== "CONCLUIDA" && normalizado !== "ENCERRADA";
}
