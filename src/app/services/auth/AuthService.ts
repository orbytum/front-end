import { AccessLevelType } from "../../models/dto/auth/AccessLevel";

export class AuthService {

    logout(): void {
        localStorage.removeItem("token");
        localStorage.removeItem("token_tipo");
    }

    getToken(): string | null {
        return localStorage.getItem("token");
    }

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
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    isTokenValid(): boolean {
        const payload = this.getTokenPayload();
        if (!payload) {
            return false;
        }

        if (payload.exp && typeof payload.exp === "number") {
            const nowInSeconds = Math.floor(Date.now() / 1000);
            if (nowInSeconds >= payload.exp) {
                this.logout();
                return false;
            }
        }
        return true;
    }

    isAuthenticated(): boolean {
        return this.isTokenValid();
    }

    getUserAccessLevel(): AccessLevelType {
        const payload = this.getTokenPayload();
        if (!payload) return null;
        const level = payload.accessLevel;
        if (typeof level === "string") {
            return level.toLowerCase() as AccessLevelType;
        }
        return null;
    }

    isAdmin(): boolean {
        const level = this.getUserAccessLevel();
        return level === "admin";
    }

    isInitialAdmin(): boolean {
        const level = this.getUserAccessLevel();
        return level === "initial_admin";
    }

    isAdminOrInitialAdmin(): boolean {
        return this.isAdmin();
    }
}
