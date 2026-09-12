import { AccessLevelType } from "../../models/dto/auth/AccessLevel";

export class AuthService {
    /**
     * Remove tokens e encerra a sessão
     */
    logout(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("token_tipo");
    }

    /**
     * Retorna o token atual armazenado
     */
    getToken(): string | null {
        return localStorage.getItem("token");
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem("token");
    }

    /**
     * Extrai o accessLevel do payload do token JWT
     */
    getUserAccessLevel(): AccessLevelType {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const parts = token.split(".");
            if (parts.length < 2) return null;
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    /**
     * Verifica se o usuário logado possui perfil de administrador inicial ou administrador
     */
    isAdminOrInitialAdmin(): boolean {
        const level = this.getUserAccessLevel();
        return level === "admin" || level === "initial_admin";
    }
}
