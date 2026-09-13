import { z } from "zod";

export const editGroupRequestSchema = z.object({
    nome: z.string().min(1, "O nome do grupo de pesquisa é obrigatório"),
    isAtivo: z.boolean(),
});

export type EditGroupRequest = z.infer<typeof editGroupRequestSchema>;