import { z } from "zod";
import { conviteCadastroDetalheSchema } from "./ConviteCadastroDetalhe";

export type ListarConvitesCadastroParams = {
    page?: number;
    size?: number;
    email?: string;
    status?: "ativos" | "inativos" | "todos";
};

export const conviteCadastroPaginadoResponseSchema = z.object({
    items: z.array(conviteCadastroDetalheSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
    totalAtivos: z.number(),
    totalInativos: z.number(),
    totalGeral: z.number(),
});

export type ConviteCadastroPaginadoResponse = z.infer<typeof conviteCadastroPaginadoResponseSchema>;
