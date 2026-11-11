import { z } from "zod";
import { BaseService } from "../BaseService";
import {
    MaterialResponse,
    materialResponseSchema,
    CriarMaterialRequest,
    EditarMaterialRequest,
} from "../../models/dto/materiais/Material";

export class MaterialService extends BaseService {
    async listar(): Promise<MaterialResponse[]> {
        return this.get("/materiais", {}, z.array(materialResponseSchema));
    }

    async buscarPorId(id: number): Promise<MaterialResponse> {
        return this.get(`/materiais/${id}`, {}, materialResponseSchema);
    }

    async criar(data: CriarMaterialRequest): Promise<MaterialResponse> {
        return this.post("/materiais", data, {}, materialResponseSchema);
    }

    async atualizar(id: number, data: EditarMaterialRequest): Promise<MaterialResponse> {
        return this.put(`/materiais/${id}`, data, {}, materialResponseSchema);
    }

    async remover(id: number): Promise<void> {
        return this.delete(`/materiais/${id}`);
    }
}