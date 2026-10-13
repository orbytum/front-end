import { BaseService } from "../BaseService";
import {
  CriarNoticiaData,
  EditarNoticiaData,
  LinkPreview,
  ListarNoticiasParams,
  ListarNoticiasPendentesParams,
  NoticiaPaginadaResponse,
  NoticiaResponse,
  linkPreviewSchema,
  noticiaPaginadaResponseSchema,
  noticiaResponseSchema,
} from "../../models/dto/noticias/Noticia";

export class NoticiaService extends BaseService {
  async previewLink(url: string): Promise<LinkPreview> {
    const searchParams = new URLSearchParams();
    searchParams.append("url", url);
    return this.get(`/noticias/preview?${searchParams.toString()}`, {}, linkPreviewSchema);
  }

  async listar(params: ListarNoticiasParams): Promise<NoticiaPaginadaResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("grupoId", String(params.grupoId));
    searchParams.append("page", String(params.page ?? 1));
    searchParams.append("size", String(params.size ?? 10));

    if (params.assunto && params.assunto.trim()) {
      searchParams.append("assunto", params.assunto.trim());
    }
    if (params.dataInicio) {
      searchParams.append("dataInicio", params.dataInicio);
    }
    if (params.dataFim) {
      searchParams.append("dataFim", params.dataFim);
    }

    return this.get(`/noticias?${searchParams.toString()}`, {}, noticiaPaginadaResponseSchema);
  }

  async listarPendentes(params: ListarNoticiasPendentesParams): Promise<NoticiaPaginadaResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("grupoId", String(params.grupoId));
    searchParams.append("page", String(params.page ?? 1));
    searchParams.append("size", String(params.size ?? 10));

    return this.get(`/noticias/pendentes?${searchParams.toString()}`, {}, noticiaPaginadaResponseSchema);
  }

  async buscarPorId(id: number): Promise<NoticiaResponse> {
    return this.get(`/noticias/${id}`, {}, noticiaResponseSchema);
  }

  async criar(data: CriarNoticiaData): Promise<NoticiaResponse> {
    return this.post("/noticias", data, {}, noticiaResponseSchema);
  }

  async atualizar(id: number, data: EditarNoticiaData): Promise<NoticiaResponse> {
    return this.put(`/noticias/${id}`, data, {}, noticiaResponseSchema);
  }

  async aprovar(id: number): Promise<NoticiaResponse> {
    return this.patch(`/noticias/${id}/aprovar`, {}, {}, noticiaResponseSchema);
  }

  async rejeitar(id: number, motivo?: string): Promise<NoticiaResponse> {
    return this.patch(`/noticias/${id}/rejeitar`, { motivo: motivo ?? null }, {}, noticiaResponseSchema);
  }

  async remover(id: number): Promise<void> {
    return this.delete(`/noticias/${id}`);
  }
}
