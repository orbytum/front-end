import { z } from "zod";

export const noticiaStatusSchema = z.enum(["PENDENTE", "APROVADA", "REJEITADA"]);

export type NoticiaStatus = z.infer<typeof noticiaStatusSchema>;

export const NoticiaStatusLabels: Record<NoticiaStatus, string> = {
  PENDENTE: "Aguardando Aprovação",
  APROVADA: "Publicada",
  REJEITADA: "Rejeitada",
};

export const noticiaResponseSchema = z.object({
  id: z.number(),
  uuid: z.string().nullable().optional(),
  grupoId: z.number().nullable().optional(),
  grupoNome: z.string().nullable().optional(),
  autorId: z.number().nullable().optional(),
  autorNome: z.string().nullable().optional(),
  aprovadorId: z.number().nullable().optional(),
  titulo: z.string(),
  conteudo: z.string(),
  referencia: z.string().nullable().optional(),
  assunto: z.string(),
  dataInicioExibicao: z.string().nullable().optional(),
  dataFimExibicao: z.string().nullable().optional(),
  motivoRejeicao: z.string().nullable().optional(),
  status: noticiaStatusSchema,
  dthRegistro: z.string(),
  dthAprovacao: z.string().nullable().optional(),
  isAtivo: z.boolean(),
  isExpirada: z.boolean().optional().default(false),
});

export type NoticiaResponse = z.infer<typeof noticiaResponseSchema>;

export const noticiaPaginadaResponseSchema = z.object({
  items: z.array(noticiaResponseSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export type NoticiaPaginadaResponse = z.infer<typeof noticiaPaginadaResponseSchema>;

export const linkPreviewSchema = z.object({
  url: z.string(),
  titulo: z.string().nullable(),
  descricao: z.string().nullable(),
});

export type LinkPreview = z.infer<typeof linkPreviewSchema>;

export interface ListarNoticiasParams {
  grupoId: number;
  assunto?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  size?: number;
}

export interface ListarNoticiasPendentesParams {
  grupoId: number;
  page?: number;
  size?: number;
}

export interface CriarNoticiaData {
  grupoId: number;
  titulo: string;
  conteudo: string;
  referencia?: string | null;
  assunto: string;
  dataInicioExibicao?: string | null;
  dataFimExibicao?: string | null;
}

export interface EditarNoticiaData {
  titulo: string;
  conteudo: string;
  referencia?: string | null;
  assunto: string;
  dataInicioExibicao?: string | null;
  dataFimExibicao?: string | null;
}
