import { z } from "zod";

export const gerarConviteGrupoRequestSchema = z.object({
  idGrupo: z.number(),
  idsProjeto: z.array(z.number()).optional(),
  diasValidade: z.number().optional(),
  limiteUso: z.number().optional().nullable(),
  idRole: z.number().optional().nullable(),
});

export type GerarConviteGrupoRequest = z.infer<typeof gerarConviteGrupoRequestSchema>;

export const conviteGrupoResponseSchema = z.object({
  idConvite: z.number(),
  token: z.string(),
  urlConvite: z.string(),
  idGrupo: z.number(),
  nomeGrupo: z.string(),
  idsProjeto: z.array(z.number()).optional().nullable(),
  dthRegistro: z.string().optional().nullable(),
  dthExpiracao: z.string().optional().nullable(),
  isAtivo: z.boolean().optional(),
  cargo: z.string().optional().nullable(),
  limiteUso: z.number().optional().nullable(),
  usos: z.number().optional().nullable(),
});

export type ConviteGrupoResponse = z.infer<typeof conviteGrupoResponseSchema>;

export const enviarConviteGrupoRequestSchema = z.object({
  idGrupo: z.number(),
  email: z.string().email("E-mail em formato inválido"),
  idsProjeto: z.array(z.number()).optional(),
  diasValidade: z.number().optional(),
  idRole: z.number().optional().nullable(),
});

export type EnviarConviteGrupoRequest = z.infer<typeof enviarConviteGrupoRequestSchema>;

export const conviteGrupoEnviadoResponseSchema = z.object({
  id: z.number(),
  idGrupo: z.number(),
  nomeGrupo: z.string(),
  emailConvidado: z.string().optional().nullable(),
  projetoIds: z.array(z.number()).optional().nullable(),
  dthRegistro: z.string().optional().nullable(),
  dthExpiracao: z.string().optional().nullable(),
  isAtivo: z.boolean().optional(),
});

export type ConviteGrupoEnviadoResponse = z.infer<typeof conviteGrupoEnviadoResponseSchema>;
