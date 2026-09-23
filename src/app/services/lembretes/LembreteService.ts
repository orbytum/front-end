import { BaseService } from "../BaseService";
import {
  CreateLembreteRequest,
  EditLembreteRequest,
  Lembrete,
  LembretePaginado,
  TipoLembrete,
} from "../../models/dto/lembretes/Lembrete";

export class LembreteService extends BaseService {
  async listarLembretes(
    grupoId?: number,
    tipo?: TipoLembrete | "all",
    busca?: string,
    page: number = 1,
    size: number = 50
  ): Promise<LembretePaginado> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(page));
    searchParams.append("size", String(size));

    if (grupoId) {
      searchParams.append("grupoId", String(grupoId));
    }
    if (tipo && tipo !== "all") {
      searchParams.append("tipo", tipo);
    }
    if (busca && busca.trim()) {
      searchParams.append("busca", busca.trim());
    }

    return this.get<LembretePaginado>(`/lembretes?${searchParams.toString()}`);
  }

  async criarLembrete(data: CreateLembreteRequest): Promise<Lembrete> {
    return this.post<Lembrete>("/lembretes", data);
  }

  async atualizarLembrete(id: number, data: EditLembreteRequest): Promise<Lembrete> {
    return this.put<Lembrete>(`/lembretes/${id}`, data);
  }

  async inativarLembrete(id: number): Promise<void> {
    return this.delete<void>(`/lembretes/${id}`);
  }

  async anexarAta(id: number, file: File): Promise<Lembrete> {
    const formData = new FormData();
    formData.append("file", file);
    return this.post<Lembrete>(`/lembretes/${id}/ata`, formData);
  }

  async removerAta(id: number): Promise<Lembrete> {
    return this.delete<Lembrete>(`/lembretes/${id}/ata`);
  }

  obterUrlDownloadAta(id: number): string {
    const baseUrl = import.meta.env.VITE_BASE_URL || "/api";
    return `${baseUrl}/lembretes/${id}/ata/download`;
  }
}
