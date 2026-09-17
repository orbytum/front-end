import { z } from "zod";

export const roleResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  isLider: z.boolean().optional().nullable(),
});

export type RoleResponse = z.infer<typeof roleResponseSchema>;
