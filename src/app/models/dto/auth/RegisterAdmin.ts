import { z } from "zod";

export const registerAdminRequestSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Formato de e-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  telefone: z.string().min(1, "O telefone é obrigatório"),
  titulo: z.string().min(1, "O título acadêmico é obrigatório"),
});

export type RegisterAdminRequest = z.infer<typeof registerAdminRequestSchema>;

export const registerAdminResponseSchema = z.object({
  token: z.string(),
  tipo: z.string(),
});

export type RegisterAdminResponse = z.infer<typeof registerAdminResponseSchema>;
