import { z } from "zod";

export const materialResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    descricao: z.string(),
    categoria: z.string().nullable().optional(),
    identificador: z.string(),
    quantidade: z.number(),
    localizacao: z.string(),
    status: z.string(),
    dthCompra: z.string().nullable().optional(),
    dthRegistro: z.string().nullable().optional(),
    isAtivo: z.boolean(),
    quantidadeEmprestada: z.number().nullable().optional(),
    quantidadeDisponivel: z.number().nullable().optional(),
    usuarioEmUsoNome: z.string().nullable().optional(),
    dthDevolucao: z.string().nullable().optional(),
});

export type MaterialResponse = z.infer<typeof materialResponseSchema>;

export const criarMaterialRequestSchema = z.object({
    nome: z.string(),
    descricao: z.string(),
    categoria: z.string(),
    identificador: z.string(),
    quantidade: z.number(),
    localizacao: z.string(),
    dthCompra: z.string(),
    status: z.string().optional(),
});

export type CriarMaterialRequest = z.infer<typeof criarMaterialRequestSchema>;

export const editarMaterialRequestSchema = z.object({
    nome: z.string(),
    descricao: z.string(),
    categoria: z.string(),
    identificador: z.string(),
    quantidade: z.number(),
    localizacao: z.string(),
    dthCompra: z.string(),
    status: z.string(),
    isAtivo: z.boolean(),
});

export type EditarMaterialRequest = z.infer<typeof editarMaterialRequestSchema>;

export const MATERIAL_STATUS = ["DISPONIVEL", "EM_USO", "MANUTENCAO"] as const;

export type MaterialStatus = (typeof MATERIAL_STATUS)[number];

export const MaterialStatusLabels: Record<string, string> = {
    DISPONIVEL: "Disponível",
    EM_USO: "Em Uso",
    MANUTENCAO: "Manutenção",
};