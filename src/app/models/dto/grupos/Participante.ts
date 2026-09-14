import { z } from "zod";

export const participanteResponseSchema = z.object({
    usuarioId: z.number(),
    nome: z.string(),
    email: z.string(),
    telefone: z.string().nullable().optional(),
    titulo: z.string().nullable().optional(),
    grupoId: z.number(),
    cargo: z.string().nullable().optional(),
    isLider: z.boolean(),
});

export type ParticipanteResponse = z.infer<typeof participanteResponseSchema>;
export type PesquisadorResponse = ParticipanteResponse;
export const pesquisadorResponseSchema = participanteResponseSchema;

export const editParticipanteRequestSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório"),
    telefone: z.string().min(1, "O telefone é obrigatório"),
    titulo: z.string().min(1, "O título acadêmico é obrigatório"),
});

export type EditParticipanteRequest = z.infer<typeof editParticipanteRequestSchema>;