export type TipoLembrete = "EDITAL" | "REUNIAO" | "APRESENTACAO" | "WORKSHOP";
export type TipoRecorrencia = "NENHUMA" | "DIARIA" | "SEMANAL" | "MENSAL" | "ANUAL";

export interface ParticipanteLembrete {
  id: number;
  nome: string;
  email: string;
}

export interface Lembrete {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoLembrete;
  dataHora: string;
  localizacao?: string;
  link?: string;
  recorrencia: TipoRecorrencia;
  grupoId: number;
  grupoNome: string;
  organizadorId: number;
  organizadorNome: string;
  organizadorEmail: string;
  participantes: ParticipanteLembrete[];
  ataNomeOriginal?: string;
  ataUrl?: string;
  temAta: boolean;
  dthCriacao: string;
}

export interface CreateLembreteRequest {
  titulo: string;
  descricao?: string;
  tipo: TipoLembrete;
  dataHora: string;
  localizacao?: string;
  link?: string;
  recorrencia: TipoRecorrencia;
  grupoId: number;
  participantesIds?: number[];
}

export interface EditLembreteRequest {
  titulo: string;
  descricao?: string;
  tipo: TipoLembrete;
  dataHora: string;
  localizacao?: string;
  link?: string;
  recorrencia: TipoRecorrencia;
  participantesIds?: number[];
}

export interface LembretePaginado {
  items: Lembrete[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
