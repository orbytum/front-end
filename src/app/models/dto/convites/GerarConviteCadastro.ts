import { z } from "zod";

export const gerarConviteCadastroRequestSchema = z.object({
    email: z.string(),
    diasValidade: z.number().optional(),
});

export type GerarConviteCadastroRequest = z.infer<typeof gerarConviteCadastroRequestSchema>;

export const gerarConviteCadastroResponseSchema = z.object({
    idConvite: z.number(),
    token: z.string(),
    urlConvite: z.string(),
    dthExpiracao: z.string(),
});

export type GerarConviteCadastroResponse = z.infer<typeof gerarConviteCadastroResponseSchema>;
