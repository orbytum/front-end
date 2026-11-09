import { z } from "zod";

export const editalResponseSchema = z.object({
    id: z.number(),
    organizador: z.string(),
    descricao: z.string(),
    valor: z.number().nullable().optional(),
    uri: z.string(),
    dthAbertura: z.string(),
    dthEncerramento: z.string(),
});

export type EditalResponse = z.infer<typeof editalResponseSchema>;

export const editalPaginadoResponseSchema = z.object({
    items: z.array(editalResponseSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
});

export type EditalPaginadoResponse = z.infer<typeof editalPaginadoResponseSchema>;

export interface ListarEditaisParams {
    grupoId: number;
    palavraChave?: string;
    organizacao?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    size?: number;
}

export interface SalvarEditalData {
    organizador: string;
    descricao: string;
    valor?: number | null;
    uri: string;
    dthAbertura: string;
    dthEncerramento: string;
}