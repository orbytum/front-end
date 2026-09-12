import { z } from "zod";
import { grupoDetalheSchema } from "./GrupoDetalhe";

export const createGroupRequestSchema = z.object({
    nome: z.string().min(1, "O nome do grupo de pesquisa é obrigatório"),
    emailLider: z.string().email("E-mail inválido").optional(),
    idLider: z.number().optional(),
});

export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;

export const createGroupResponseSchema = grupoDetalheSchema;
export type CreateGroupResponse = z.infer<typeof createGroupResponseSchema>;
