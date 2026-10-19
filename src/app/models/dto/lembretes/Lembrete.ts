import { z } from "zod";

export const TIPOS_LEMBRETE = ["Edital", "Reunião", "Apresentação", "Workshop"] as const;
export const TIPOS_RECORRENCIA = ["Nenhuma", "Diária", "Semanal", "Mensal", "Anual"] as const;

export const tipoLembreteSchema = z.enum(TIPOS_LEMBRETE);
export const tipoRecorrenciaSchema = z.enum(TIPOS_RECORRENCIA);

export type TipoLembrete = z.infer<typeof tipoLembreteSchema>;
export type TipoRecorrencia = z.infer<typeof tipoRecorrenciaSchema>;

export const participanteLembreteSchema = z.object({
    id: z.number().nullable().optional(),
    usuarioId: z.number().nullable().optional(),
    nome: z.string(),
    presencaConfirmada: z.boolean(),
});

export const lembreteResponseSchema = z.object({
    id: z.number(),
    grupoId: z.number().nullable().optional(),
    grupo: z.string().nullable().optional(),
    criadorId: z.number().nullable().optional(),
    criadorNome: z.string().nullable().optional(),
    titulo: z.string(),
    descricao: z.string().nullable().optional(),
    tipo: tipoLembreteSchema,
    // Data/hora da primeira ocorrência (dthInicio do Evento)
    dataHora: z.string(),
    // Próxima ocorrência calculada pela API (considera a recorrência)
    proximaOcorrencia: z.string().nullable().optional(),
    localizacao: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    recorrencia: tipoRecorrenciaSchema.nullable().optional(),
    organizador: z.string().nullable().optional(),
    participantes: z.array(z.string()).default([]),
    participantesDetalhes: z.array(participanteLembreteSchema).default([]),
    presencaConfirmada: z.boolean().default(false),
    temAta: z.boolean().default(false),
    ataUrl: z.string().nullable().optional(),
    ataNomeArquivo: z.string().nullable().optional(),
    dthRegistro: z.string().nullable().optional(),
    isAtivo: z.boolean().optional(),
});

export type LembreteResponse = z.infer<typeof lembreteResponseSchema>;

export const lembretePaginadoSchema = z.object({
    items: z.array(lembreteResponseSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
    // Total por tipo (chave = rótulo do tipo) considerando a busca, ignorando o filtro de tipo
    totaisPorTipo: z.record(z.string(), z.number()).default({}),
});

export type LembretePaginado = z.infer<typeof lembretePaginadoSchema>;

export interface SalvarLembreteData {
    titulo: string;
    descricao: string;
    tipo: TipoLembrete;
    dataHora: string;
    localizacao?: string;
    link?: string;
    recorrencia: TipoRecorrencia;
}

export interface CriarLembreteRequest extends SalvarLembreteData {
    grupoId: number;
}

export interface FiltrosLembrete {
    tipo?: TipoLembrete;
    busca?: string;
    page?: number;
    size?: number;
}
