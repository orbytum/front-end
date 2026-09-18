import { BaseService } from "../BaseService";
import {
  CreatePublicacaoData,
  ListarPublicacoesParams,
  PublicacaoPaginadaResponse,
  PublicacaoResponse,
  publicacaoPaginadaResponseSchema,
  publicacaoResponseSchema,
} from "../../models/dto/publicacoes/Publicacao";

export class PublicacaoService extends BaseService {
  async listarPublicacoes(params: ListarPublicacoesParams = {}): Promise<PublicacaoPaginadaResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(params.page ?? 1));
    searchParams.append("size", String(params.size ?? 10));

    if (params.titulo && params.titulo.trim()) {
      searchParams.append("titulo", params.titulo.trim());
    }
    if (params.dataInicio) {
      searchParams.append("dataInicio", params.dataInicio);
    }
    if (params.dataFim) {
      searchParams.append("dataFim", params.dataFim);
    }
    if (params.projetoId) {
      searchParams.append("projetoId", String(params.projetoId));
    }

    return this.get(`/publicacoes?${searchParams.toString()}`, {}, publicacaoPaginadaResponseSchema);
  }

  async criarPublicacao(data: CreatePublicacaoData): Promise<PublicacaoResponse> {
    const formData = new FormData();
    formData.append("titulo", data.titulo);
    formData.append("descricao", data.descricao);
    formData.append("projetoId", String(data.projetoId));
    formData.append("arquivo", data.arquivo);

    return this.post("/publicacoes", formData, {}, publicacaoResponseSchema);
  }

  async inativarPublicacao(id: number): Promise<void> {
    return this.delete(`/publicacoes/${id}`);
  }

  async buscarPorId(id: number): Promise<PublicacaoResponse> {
    return this.get(`/publicacoes/${id}`, {}, publicacaoResponseSchema);
  }
}
