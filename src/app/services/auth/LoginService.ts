import { BaseService } from "../BaseService";
import { LoginResponse, loginResponseSchema } from "../../models/dto/auth/LoginResponse";

export class LoginService extends BaseService {
    async login(data: unknown): Promise<LoginResponse> {
        return this.post("/auth/login", data, {}, loginResponseSchema);
    }
}