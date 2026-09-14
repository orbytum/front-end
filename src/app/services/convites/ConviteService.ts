import { BaseService } from "../BaseService";
import {
    AceitarConviteCadastroRequest,
    AceitarConviteCadastroResponse,
    aceitarConviteCadastroResponseSchema,
} from "../../models/dto/convites/AceitarConviteCadastro";
import {
    GerarConviteCadastroRequest,
    GerarConviteCadastroResponse,
    gerarConviteCadastroResponseSchema,
} from "../../models/dto/convites/GerarConviteCadastro";
import {
    ConviteCadastroPaginadoResponse,
    ListarConvitesCadastroParams,
    conviteCadastroPaginadoResponseSchema,
} from "../../models/dto/convites/ListarConvitesCadastro";
import {
    ConviteGrupoDetalhe,
    conviteGrupoDetalheSchema,
    AceitarConviteGrupoResponse,
    aceitarConviteGrupoResponseSchema,
} from "../../models/dto/convites/ConviteGrupoDetalhe";

export class ConviteService extends BaseService {
    async aceitarCadastro(token: string, data: AceitarConviteCadastroRequest): Promise<AceitarConviteCadastroResponse> {
        return this.post(
            `/convites/aceitar/cadastro/${encodeURIComponent(token)}`,
            data,
            {},
            aceitarConviteCadastroResponseSchema
        );
    }

    async listarCadastros(params: ListarConvitesCadastroParams = {}): Promise<ConviteCadastroPaginadoResponse> {
        const searchParams = new URLSearchParams();
        searchParams.append("page", String(params.page ?? 1));
        searchParams.append("size", String(params.size ?? 5));
        searchParams.append("status", params.status ?? "ativos");
        if (params.email) {
            searchParams.append("email", params.email);
        }
        return this.get(`/convites/cadastro?${searchParams.toString()}`, {}, conviteCadastroPaginadoResponseSchema);
    }

    async gerarCadastro(data: GerarConviteCadastroRequest): Promise<GerarConviteCadastroResponse> {
        return this.post("/convites/cadastro", data, {}, gerarConviteCadastroResponseSchema);
    }

    async revogarCadastro(id: number): Promise<void> {
        return this.delete(`/convites/cadastro/${id}`);
    }

    async buscarConviteGrupo(token: string): Promise<ConviteGrupoDetalhe> {
        return this.get(
            `/convites/aceitar/grupo/${encodeURIComponent(token)}`,
            {},
            conviteGrupoDetalheSchema
        );
    }

    async aceitarConviteGrupo(token: string): Promise<AceitarConviteGrupoResponse> {
        return this.post(
            `/convites/aceitar/grupo/${encodeURIComponent(token)}`,
            {},
            {},
            aceitarConviteGrupoResponseSchema
        );
    }
}
