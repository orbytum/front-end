import { z } from "zod";

export const createLeaderRequestSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório"),
    email: z.string().email("Formato de e-mail inválido"),
    telefone: z.string().min(1, "O telefone é obrigatório"),
    titulo: z.string().min(1, "O título acadêmico é obrigatório"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type CreateLeaderRequest = z.infer<typeof createLeaderRequestSchema>;

export const liderResponseSchema = z.object({
    usuarioId: z.number(),
    nome: z.string(),
    email: z.string(),
    telefone: z.string(),
    titulo: z.string(),
    grupoId: z.number(),
    isLider: z.boolean(),
});

export type LiderResponse = z.infer<typeof liderResponseSchema>;