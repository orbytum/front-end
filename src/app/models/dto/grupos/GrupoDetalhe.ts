import { z } from "zod";

export const grupoDetalheSchema = z.object({
    id: z.number(),
    nome: z.string(),
    isAtivo: z.boolean(),
    nomeLider: z.string().nullable().optional(),
    idLider: z.number().nullable().optional(),
    totalParticipantes: z.number().optional().default(0),
});

export type GrupoDetalhe = z.infer<typeof grupoDetalheSchema>;
