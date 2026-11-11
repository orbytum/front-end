import { BaseService } from "../BaseService";
import {
    EditalPaginadoResponse,
    EditalResponse,
    ListarEditaisParams,
    SalvarEditalData,
    editalPaginadoResponseSchema,
    editalResponseSchema,
} from "../../models/dto/editais/Edital";

export class EditalService extends BaseService {
    async listar(params: ListarEditaisParams): Promise<EditalPaginadoResponse> {
        const searchParams = new URLSearchParams();
        searchParams.append("page", String(params.page ?? 1));
        searchParams.append("size", String(params.size ?? 10));

        if (params.projetoId) {
            searchParams.append("projetoId", String(params.projetoId));
        }
        if (params.palavraChave && params.palavraChave.trim()) {
            searchParams.append("palavraChave", params.palavraChave.trim());
        }
        if (params.organizacao && params.organizacao.trim()) {
            searchParams.append("organizacao", params.organizacao.trim());
        }
        if (params.dataInicio) {
            searchParams.append("dataInicio", params.dataInicio);
        }
        if (params.dataFim) {
            searchParams.append("dataFim", params.dataFim);
        }

        return this.get(
            `/grupos/${params.grupoId}/editais?${searchParams.toString()}`,
            {},
            editalPaginadoResponseSchema
        );
    }

    async buscar(grupoId: number, id: number): Promise<EditalResponse> {
        return this.get(`/grupos/${grupoId}/editais/${id}`, {}, editalResponseSchema);
    }

    async criar(grupoId: number, data: SalvarEditalData): Promise<EditalResponse> {
        return this.post(`/grupos/${grupoId}/editais`, data, {}, editalResponseSchema);
    }

    async atualizar(grupoId: number, id: number, data: SalvarEditalData): Promise<EditalResponse> {
        return this.put(`/grupos/${grupoId}/editais/${id}`, data, {}, editalResponseSchema);
    }

    async remover(grupoId: number, id: number): Promise<void> {
        return this.delete(`/grupos/${grupoId}/editais/${id}`);
    }
}