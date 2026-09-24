import { z } from "zod";
import { BaseService } from "../BaseService";
import {
  ProjetoResponse,
  projetoResponseSchema,
  CriarProjetoRequest,
  EditarProjetoRequest,
} from "../../models/dto/projetos/Projeto";
import {
  ParticipanteProjetoResponse,
  AdicionarParticipanteRequest,
  participanteProjetoResponseSchema,
} from "../../models/dto/projetos/ParticipanteProjeto";

export class ProjetoService extends BaseService {
  async listarProjetosPorGrupo(grupoId: number): Promise<ProjetoResponse[]> {
    return this.get(`/projetos/grupo/${grupoId}`, {}, z.array(projetoResponseSchema));
  }

  async buscarProjetoPorId(id: number): Promise<ProjetoResponse> {
    return this.get(`/projetos/${id}`, {}, projetoResponseSchema);
  }

  async criarProjeto(data: CriarProjetoRequest): Promise<ProjetoResponse> {
    return this.post("/projetos", data, {}, projetoResponseSchema);
  }

  async atualizarProjeto(id: number, data: EditarProjetoRequest): Promise<ProjetoResponse> {
    return this.put(`/projetos/${id}`, data, {}, projetoResponseSchema);
  }

  async removerProjeto(id: number): Promise<void> {
    return this.delete(`/projetos/${id}`);
  }

  async alternarFavorito(id: number): Promise<ProjetoResponse> {
    return this.patch(`/projetos/${id}/favorito`, {}, {}, projetoResponseSchema);
  }

  async finalizarProjeto(id: number): Promise<ProjetoResponse> {
    return this.post(`/projetos/${id}/finalizar`, {}, {}, projetoResponseSchema);
  }

  async listarParticipantes(id: number): Promise<ParticipanteProjetoResponse[]> {
    return this.get(
      `/projetos/${id}/participantes`,
      {},
      z.array(participanteProjetoResponseSchema)
    );
  }

  async adicionarParticipante(
    id: number,
    data: AdicionarParticipanteRequest
  ): Promise<ParticipanteProjetoResponse> {
    return this.post(`/projetos/${id}/participantes`, data, {}, participanteProjetoResponseSchema);
  }

  async removerParticipante(id: number, usuarioId: number): Promise<void> {
    return this.delete(`/projetos/${id}/participantes/${usuarioId}`);
  }
}
