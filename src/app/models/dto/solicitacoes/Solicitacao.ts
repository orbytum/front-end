import { z } from "zod";

export const solicitacaoResponseSchema = z.object({
  id: z.number(),
  titulo: z.string(),
  descricao: z.string(),
  justificativa: z.string(),
  status: z.string(),
  isInterna: z.boolean(),
  isAprovada: z.boolean(),
  projetoId: z.number().nullable().optional(),
  projetoTitulo: z.string().nullable().optional(),
  usuarioId: z.number().nullable().optional(),
  usuarioNome: z.string().nullable().optional(),
  materialId: z.number().nullable().optional(),
  materialNome: z.string().nullable().optional(),
  quantidade: z.number().nullable().optional(),
  valor: z.number().nullable().optional(),
  dthSolicitacao: z.string(),
  dthResposta: z.string().nullable().optional(),
});

export type SolicitacaoResponse = z.infer<typeof solicitacaoResponseSchema>;

export const criarSolicitacaoRequestSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  justificativa: z.string(),
  tipo: z.string(),
  projetoId: z.number(),
  materialId: z.number().optional(),
  quantidade: z.number().optional(),
  valor: z.number().optional(),
});

export type CriarSolicitacaoRequest = z.infer<typeof criarSolicitacaoRequestSchema>;

export const editarSolicitacaoRequestSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  justificativa: z.string(),
  quantidade: z.number().optional(),
  valor: z.number().optional(),
});

export type EditarSolicitacaoRequest = z.infer<typeof editarSolicitacaoRequestSchema>;

export const SOLICITACAO_STATUS = [
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "ENCERRADA",
  "REJEITADA",
] as const;

export type SolicitacaoStatus = (typeof SOLICITACAO_STATUS)[number];

export const SolicitacaoStatusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  ENCERRADA: "Encerrada",
  REJEITADA: "Rejeitada",
};

export function podemAprovarOuRejeitar(status?: string | null): boolean {
  return status === "PENDENTE";
}

export function podemConcluirOuEncerrar(status?: string | null): boolean {
  return status === "EM_ANDAMENTO";
}

export function solicitacaoEstaAberta(status?: string | null): boolean {
  return status === "PENDENTE" || status === "EM_ANDAMENTO";
}

export const TIPOS_SOLICITACAO = [
  "uso_material",
  "financiamento",
  "compra_material_catalogado",
  "compra_material",
] as const;

export const TIPOS_SOLICITACAO_CRIAVEIS = [
  "financiamento",
  "compra_material_catalogado",
  "compra_material",
] as const;

export const TipoSolicitacaoLabels: Record<string, string> = {
  uso_material: "Uso de Material",
  financiamento: "Financiamento",
  compra_material_catalogado: "Compra de Material Catalogado",
  compra_material: "Compra de Material",
};