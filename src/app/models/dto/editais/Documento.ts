import { z } from "zod";

export const documentoResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    extensao: z.string().nullable().optional(),
    contentType: z.string().nullable().optional(),
    tamanho: z.number().nullable().optional(),
    dthCriacao: z.string().nullable().optional(),
});

export type DocumentoResponse = z.infer<typeof documentoResponseSchema>;
