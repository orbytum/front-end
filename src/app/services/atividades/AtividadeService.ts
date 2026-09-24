import { z } from "zod";
import { BaseService } from "../BaseService";
import {
  AtividadeResponse,
  atividadeResponseSchema,
  CriarAtividadeRequest,
  EditarAtividadeRequest,
} from "../../models/dto/atividades/Atividade";

export class AtividadeService extends BaseService {
  async listarPorProjeto(projetoId: number): Promise<AtividadeResponse[]> {
    return this.get(`/atividades/projeto/${projetoId}`, {}, z.array(atividadeResponseSchema));
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
