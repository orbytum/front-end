import { z } from "zod";
import { BaseService } from "../BaseService";
import {
  AtividadeResponse,
  atividadeResponseSchema,
  atividadePaginadoResponseSchema,
  CriarAtividadeRequest,
  EditarAtividadeRequest,
} from "../../models/dto/atividades/Atividade";

export interface ListarAtividadesParams {
  page?: number;
  size?: number;
}

export class AtividadeService extends BaseService {
  async listarPorProjeto(
    projetoId: number,
    params: ListarAtividadesParams = {}
  ): Promise<AtividadeResponse[]> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(params.page ?? 1));
    searchParams.append("size", String(params.size ?? 200));
    const response = await this.get(
      `/atividades/projeto/${projetoId}?${searchParams.toString()}`,
      {},
      atividadePaginadoResponseSchema
    );
    return response.items;
  }

  async listarAtrasadasPorProjeto(projetoId: number): Promise<AtividadeResponse[]> {
    return this.get(
      `/atividades/projeto/${projetoId}/atrasadas`,
      {},
      z.array(atividadeResponseSchema)
    );
  }

  async buscarPorId(id: number): Promise<AtividadeResponse> {
    return this.get(`/atividades/${id}`, {}, atividadeResponseSchema);
  }

  async criar(data: CriarAtividadeRequest): Promise<AtividadeResponse> {
    return this.post("/atividades", data, {}, atividadeResponseSchema);
  }

  async atualizar(id: number, data: EditarAtividadeRequest): Promise<AtividadeResponse> {
    return this.put(`/atividades/${id}`, data, {}, atividadeResponseSchema);
  }

  async atualizarStatus(id: number, status: string): Promise<AtividadeResponse> {
    return this.patch(`/atividades/${id}/status`, { status }, {}, atividadeResponseSchema);
  }

  async remover(id: number): Promise<void> {
    return this.delete(`/atividades/${id}`);
  }
}
