import { BaseService } from "../BaseService";
import { ProjetoResponse, projetoResponseSchema } from "../../models/dto/projetos/Projeto";
import { z } from "zod";

export class ProjetoService extends BaseService {
  async listarProjetosPorGrupo(grupoId: number): Promise<ProjetoResponse[]> {
    return this.get(`/projetos/grupo/${grupoId}`, {}, z.array(projetoResponseSchema));
  }

  async buscarProjetoPorId(id: number): Promise<ProjetoResponse> {
    return this.get(`/projetos/${id}`, {}, projetoResponseSchema);
  }
}
