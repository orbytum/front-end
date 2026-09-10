import { z } from "zod";

export const aceitarConviteCadastroRequestSchema = z.object({
    nome: z.string(),
    senha: z.string(),
    telefone: z.string(),
    titulo: z.string(),
});

export type AceitarConviteCadastroRequest = z.infer<typeof aceitarConviteCadastroRequestSchema>;

export const aceitarConviteCadastroResponseSchema = z.object({
    token: z.string(),
    tipo: z.string(),
});

export type AceitarConviteCadastroResponse = z.infer<typeof aceitarConviteCadastroResponseSchema>;
