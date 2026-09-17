import { z } from "zod";

export const pesquisadorResponseSchema = z.object({
  usuarioId: z.number().optional().nullable(),
  id: z.number().optional().nullable(),
  nome: z.string(),
  email: z.string(),
  telefone: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  grupoId: z.number().optional().nullable(),
  cargo: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  isLider: z.boolean().optional().nullable(),
});

export type PesquisadorResponse = z.infer<typeof pesquisadorResponseSchema>;

export const pesquisadorPaginadoResponseSchema = z.object({
  items: z.array(pesquisadorResponseSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  page: z.number(),
  size: z.number(),
});

export type PesquisadorPaginadoResponse = z.infer<typeof pesquisadorPaginadoResponseSchema>;

export interface ListarPesquisadoresParams {
  page?: number;
  size?: number;
  nome?: string;
}
