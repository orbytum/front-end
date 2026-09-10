import { z } from "zod";

export const conviteCadastroDetalheSchema = z.object({
    id: z.number(),
    email: z.string(),
    token: z.string(),
    urlConvite: z.string(),
    dthRegistro: z.string(),
    dthExpiracao: z.string(),
    ativo: z.boolean(),
});

export type ConviteCadastroDetalhe = z.infer<typeof conviteCadastroDetalheSchema>;
