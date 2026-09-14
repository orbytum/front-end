import { z } from "zod";

export const conviteGrupoDetalheSchema = z.object({
    idConvite: z.number().nullable().optional(),
    token: z.string(),
    idGrupo: z.number().nullable().optional(),
    nomeGrupo: z.string(),
    nomeRemetente: z.string().nullable().optional(),
    cargo: z.string().nullable().optional(),
    dthExpiracao: z.string().nullable().optional(),
    isAtivo: z.boolean().optional(),
});

export type ConviteGrupoDetalhe = z.infer<typeof conviteGrupoDetalheSchema>;

export const aceitarConviteGrupoResponseSchema = z.object({
    id: z.number().nullable().optional(),
    idGrupo: z.number(),
    nomeGrupo: z.string(),
    emailConvidado: z.string().nullable().optional(),
    projetoIds: z.array(z.number()).optional(),
    dthRegistro: z.string().nullable().optional(),
    dthExpiracao: z.string().nullable().optional(),
    isAtivo: z.boolean().optional(),
});

export type AceitarConviteGrupoResponse = z.infer<typeof aceitarConviteGrupoResponseSchema>;