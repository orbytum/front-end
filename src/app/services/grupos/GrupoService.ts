import { BaseService } from "../BaseService";
import { EditGroupRequest } from "../../models/dto/grupos/EditGroup";                                                                                                                                                                                                               
import { grupoDetalheSchema } from "../../models/dto/grupos/GrupoDetalhe";
import {
    GrupoDetalhe,
} from "../../models/dto/grupos/GrupoDetalhe";
import {
    CreateGroupRequest,
    createGroupResponseSchema,
} from "../../models/dto/grupos/CreateGroup";
import {
    GrupoPaginadoResponse,
    ListarGruposParams,
    grupoPaginadoResponseSchema,
} from "../../models/dto/grupos/ListarGrupos";

import {
    CreateLeaderRequest,
    LiderResponse,
    liderResponseSchema
} from "../../models/dto/grupos/Lider"
export class GrupoService extends BaseService {
    async listarGrupos(params: ListarGruposParams = {}): Promise<GrupoPaginadoResponse> {
        const searchParams = new URLSearchParams();
        searchParams.append("page", String(params.page ?? 1));
        searchParams.append("size", String(params.size ?? 10));
        if (params.nome && params.nome.trim()) {
            searchParams.append("nome", params.nome.trim());
        }
        if (params.usuario && params.usuario.trim()) {
            searchParams.append("usuario", params.usuario.trim());
        }
        return this.get(`/grupos?${searchParams.toString()}`, {}, grupoPaginadoResponseSchema);
    }

    async criarGrupo(data: CreateGroupRequest): Promise<GrupoDetalhe> {
        return this.post("/grupos", data, {}, createGroupResponseSchema);
    }

    async removerGrupo(id: number): Promise<void> {
        return this.delete(`/grupos/${id}`);
    }

    async atualizarGrupo(id: number, data: EditGroupRequest): Promise<GrupoDetalhe> {
        return this.put(`/grupos/${id}`, data, {}, grupoDetalheSchema);
    }

    async cadastrarLider(grupoId: number, data: CreateLeaderRequest): Promise<LiderResponse> {
        return this.post(`/grupos/${grupoId}/lideres`, data, {}, liderResponseSchema);
    }
}
