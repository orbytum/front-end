import { z } from "zod";
import { BaseService } from "../BaseService";
import {
  SolicitacaoResponse,
  solicitacaoResponseSchema,
  CriarSolicitacaoRequest,
  EditarSolicitacaoRequest,
} from "../../models/dto/solicitacoes/Solicitacao";

export class SolicitacaoService extends BaseService {
  async listarPorProjeto(projetoId: number): Promise<SolicitacaoResponse[]> {
    return this.get(`/solicitacoes/projeto/${projetoId}`, {}, z.array(solicitacaoResponseSchema));
  }

  async buscarPorId(id: number): Promise<SolicitacaoResponse> {
    return this.get(`/solicitacoes/${id}`, {}, solicitacaoResponseSchema);
  }

  async criar(data: CriarSolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.post("/solicitacoes", data, {}, solicitacaoResponseSchema);
  }

  async atualizar(id: number, data: EditarSolicitacaoRequest): Promise<SolicitacaoResponse> {
    return this.put(`/solicitacoes/${id}`, data, {}, solicitacaoResponseSchema);
  }

  async remover(id: number): Promise<void> {
    return this.delete(`/solicitacoes/${id}`);
  }

  async aprovar(id: number): Promise<SolicitacaoResponse> {
    return this.patch(`/solicitacoes/${id}/aprovar`, {}, {}, solicitacaoResponseSchema);
  }

  async rejeitar(id: number): Promise<SolicitacaoResponse> {
    return this.patch(`/solicitacoes/${id}/rejeitar`, {}, {}, solicitacaoResponseSchema);
  }

  async concluir(id: number): Promise<SolicitacaoResponse> {
    return this.patch(`/solicitacoes/${id}/concluir`, {}, {}, solicitacaoResponseSchema);
  }

  async encerrar(id: number): Promise<SolicitacaoResponse> {
    return this.patch(`/solicitacoes/${id}/encerrar`, {}, {}, solicitacaoResponseSchema);
  }
}