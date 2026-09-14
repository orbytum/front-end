import { z } from "zod";
import { BaseService } from "../BaseService";
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
    MeuGrupoResponse,
    meuGrupoResponseSchema,
} from "../../models/dto/grupos/MeuGrupo";

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

    async listarMeusGrupos(): Promise<MeuGrupoResponse[]> {
        return this.get("/grupos/meus-grupos", {}, z.array(meuGrupoResponseSchema));
    }

    async criarGrupo(data: CreateGroupRequest): Promise<GrupoDetalhe> {
        return this.post("/grupos", data, {}, createGroupResponseSchema);
    }

    async removerGrupo(id: number): Promise<void> {
        return this.delete(`/grupos/${id}`);
    }
}
