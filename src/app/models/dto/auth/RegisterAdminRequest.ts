import { z } from "zod";

export const registerAdminRequestSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail em formato inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
  telefone: z.string().min(1, "O telefone é obrigatório"),
  titulo: z.string().min(1, "O título é obrigatório"),
});

export type RegisterAdminRequest = z.infer<typeof registerAdminRequestSchema>;
