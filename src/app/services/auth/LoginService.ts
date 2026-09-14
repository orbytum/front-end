import { BaseService } from "../BaseService";
import { LoginResponse, loginResponseSchema } from "../../models/dto/auth/LoginResponse";
import { RegisterAdminRequest } from "../../models/dto/auth/RegisterAdminRequest";

export class LoginService extends BaseService {
    async login(data: unknown): Promise<LoginResponse> {
        return this.post("/auth/login", data, {}, loginResponseSchema);
    }

    async registerAdmin(data: RegisterAdminRequest): Promise<LoginResponse> {
        return this.post("/auth/register-admin", data, {}, loginResponseSchema);
    }
}