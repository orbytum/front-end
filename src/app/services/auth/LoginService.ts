import { BaseService } from "../BaseService";
import { LoginResponse, loginResponseSchema } from "../../models/dto/auth/LoginResponse";
import {
  RegisterAdminRequest,
  RegisterAdminResponse,
  registerAdminResponseSchema,
} from "../../models/dto/auth/RegisterAdmin";

export class LoginService extends BaseService {
  async login(data: unknown): Promise<LoginResponse> {
    return this.post("/auth/login", data, {}, loginResponseSchema);
  }

  async registerAdmin(data: RegisterAdminRequest): Promise<RegisterAdminResponse> {
    return this.post("/auth/register-admin", data, {}, registerAdminResponseSchema);
  }
}
