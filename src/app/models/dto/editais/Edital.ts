import { z } from "zod";
import { projetoRotuloSchema } from "../projetos/ProjetoRotulo";

export const editalResponseSchema = z.object({
    id: z.number(),
    organizador: z.string(),
    descricao: z.string(),
    valor: z.number().nullable().optional(),
    uri: z.string(),
    dthAbertura: z.string(),
    dthEncerramento: z.string(),
    projetos: z.array(projetoRotuloSchema).default([]),
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
    projetoId?: number;
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
    projetoIds?: number[];
}