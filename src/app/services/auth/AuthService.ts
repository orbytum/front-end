import { AccessLevelType } from "../../models/dto/auth/AccessLevel";

export class AuthService {
    /**
     * Remove tokens, dados de sessão e encerra a sessão
     */
    logout(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("token_tipo");
        localStorage.removeItem("grupo_atual");
        localStorage.removeItem("grupo_id");
        sessionStorage.removeItem("grupo_atual");
        sessionStorage.removeItem("grupo_id");
    }

    /**
     * Retorna o token atual armazenado
     */
    getToken(): string | null {
        return localStorage.getItem("token");
    }

    /**
     * Decodifica e retorna o payload do token JWT
     */
    getTokenPayload(): any {
        const token = this.getToken();
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
            return JSON.parse(jsonPayload)?.accessLevel?.toLowerCase() ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Verifica se o token existe e ainda não expirou
     */
    isTokenValid(): boolean {
        const payload = this.getTokenPayload();
        if (!payload) return false;

        if (payload.exp && typeof payload.exp === "number") {
            const nowInSeconds = Math.floor(Date.now() / 1000);
            if (nowInSeconds >= payload.exp) {
                this.logout();
                return false;
            }
        }
        return true;
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        return this.isTokenValid();
    }

    /**
     * Extrai o accessLevel do payload do token JWT
     */
    getUserAccessLevel(): AccessLevelType {
        const payload = this.getTokenPayload();
        if (!payload) return null;
        const level = payload.accessLevel;
        if (typeof level === "string") {
            return level.toLowerCase() as AccessLevelType;
        }
        return null;
    }

    /**
     * Verifica se o usuário logado possui perfil de administrador
     */
    isAdmin(): boolean {
        const level = this.getUserAccessLevel();
        return level === "admin";
    }

    /**
     * Verifica se o usuário logado possui perfil de administrador inicial ou administrador
     */
    isAdminOrInitialAdmin(): boolean {
        const level = this.getUserAccessLevel();
        return level === "admin" || level === "initial_admin";
    }
}
