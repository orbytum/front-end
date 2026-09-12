import { z } from "zod";
import { grupoDetalheSchema } from "./GrupoDetalhe";

export type ListarGruposParams = {
    page?: number;
    size?: number;
    nome?: string;
    usuario?: string;
};

export const grupoPaginadoResponseSchema = z.object({
    items: z.array(grupoDetalheSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
});

export type GrupoPaginadoResponse = z.infer<typeof grupoPaginadoResponseSchema>;
