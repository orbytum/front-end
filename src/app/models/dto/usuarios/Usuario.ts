import { z } from "zod";

export const usuarioResponseSchema = z.object({
    id: z.number(),
    nome: z.string(),
    email: z.string(),
    telefone: z.string().nullable().optional(),
    titulo: z.string().nullable().optional(),
    accessLevel: z.string().nullable().optional(),
    isAtivo: z.boolean().optional(),
    dthRegistro: z.string().nullable().optional(),
});

export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;

export const usuarioPaginadoResponseSchema = z.object({
    items: z.array(usuarioResponseSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    page: z.number(),
    size: z.number(),
});

export type UsuarioPaginadoResponse = z.infer<typeof usuarioPaginadoResponseSchema>;

export interface EditUsuarioRequest {
    nome: string;
    email: string;
    telefone: string;
    titulo: string;
}
