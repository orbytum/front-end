import { z } from "zod";
import { BaseService } from "../BaseService";
import {
    CriarLembreteRequest,
    FiltrosLembrete,
    LembreteResponse,
    SalvarLembreteData,
    LembretePaginado,
    lembretePaginadoSchema,
    lembreteResponseSchema,
} from "../../models/dto/lembretes/Lembrete";

export class LembreteService extends BaseService {
    async listarPorGrupo(grupoId: number, filtros: FiltrosLembrete = {}): Promise<LembretePaginado> {
        const params = new URLSearchParams();
        params.append("page", String(filtros.page ?? 1));
        params.append("size", String(filtros.size ?? 10));
        if (filtros.tipo) {
            // A API espera o nome da constante do enum (ex.: REUNIAO), sem acento
            params.append("tipo", filtros.tipo.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase());
        }
        if (filtros.busca && filtros.busca.trim()) {
            params.append("busca", filtros.busca.trim());
        }
        const query = params.toString();
        return this.get(
            `/lembretes/grupo/${grupoId}?${query}`,
            {},
            lembretePaginadoSchema
        );
    }

    async listarTodosPorGrupo(grupoId: number): Promise<LembreteResponse[]> {
        return this.get(
            `/lembretes/grupo/${grupoId}/todos`,
            {},
            z.array(lembreteResponseSchema)
        );
    }

    async criar(data: CriarLembreteRequest): Promise<LembreteResponse> {
        return this.post("/lembretes", data, {}, lembreteResponseSchema);
    }

    async atualizar(id: number, data: SalvarLembreteData): Promise<LembreteResponse> {
        return this.put(`/lembretes/${id}`, data, {}, lembreteResponseSchema);
    }

    async excluir(id: number): Promise<void> {
        return this.delete(`/lembretes/${id}`);
    }

    async alternarPresenca(id: number): Promise<LembreteResponse> {
        return this.patch(`/lembretes/${id}/presenca`, {}, {}, lembreteResponseSchema);
    }

    async inserirAta(id: number, arquivo: File): Promise<LembreteResponse> {
        const formData = new FormData();
        formData.append("arquivo", arquivo);
        return this.post(`/lembretes/${id}/ata`, formData, {}, lembreteResponseSchema);
    }

    /** Baixa os lembretes do grupo em formato iCalendar (.ics). */
    async exportarIcs(grupoId: number): Promise<Blob> {
        return this.getBlob(`/lembretes/grupo/${grupoId}/ics`);
    }
}
