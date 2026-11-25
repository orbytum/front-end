import { BaseService } from "../BaseService";
import {
    EditUsuarioRequest,
    UsuarioPaginadoResponse,
    UsuarioResponse,
    usuarioPaginadoResponseSchema,
    usuarioResponseSchema,
} from "../../models/dto/usuarios/Usuario";

export class UsuarioService extends BaseService {
    async listar(page = 1, size = 10, busca = ""): Promise<UsuarioPaginadoResponse> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (busca.trim()) {
            params.append("busca", busca.trim());
        }
        return this.get(`/usuarios?${params.toString()}`, {}, usuarioPaginadoResponseSchema);
    }

    async atualizar(id: number, data: EditUsuarioRequest): Promise<UsuarioResponse> {
        return this.put(`/usuarios/${id}`, data, {}, usuarioResponseSchema);
    }

    async inativar(id: number): Promise<void> {
        return this.patch(`/usuarios/${id}/inativar`, {});
    }
}
