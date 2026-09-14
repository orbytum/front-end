import { z } from "zod";
import { BaseService } from "../BaseService";
import { RoleResponse, roleResponseSchema } from "../../models/dto/roles/Role";

export class RoleService extends BaseService {
  async listarRoles(): Promise<RoleResponse[]> {
    return this.get("/roles", {}, z.array(roleResponseSchema));
  }
}
