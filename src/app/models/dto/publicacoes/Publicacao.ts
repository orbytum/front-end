import { z } from "zod";

export const publicacaoResponseSchema = z.object({
  id: z.number(),
  uuid: z.string().nullable().optional(),
  titulo: z.string(),
  descricao: z.string(),
  projetoId: z.number().nullable().optional(),
  projetoTitulo: z.string().nullable().optional(),
  url: z.string(),
  dthRegistro: z.string(),
  isAtivo: z.boolean(),
});

export type PublicacaoResponse = z.infer<typeof publicacaoResponseSchema>;

export const publicacaoPaginadaResponseSchema = z.object({
  items: z.array(publicacaoResponseSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export type PublicacaoPaginadaResponse = z.infer<typeof publicacaoPaginadaResponseSchema>;

export interface ListarPublicacoesParams {
  titulo?: string;
  dataInicio?: string;
  dataFim?: string;
  projetoId?: number;
  page?: number;
  size?: number;
}

export interface CreatePublicacaoData {
  titulo: string;
  descricao: string;
  projetoId: number;
  arquivo: File;
}
