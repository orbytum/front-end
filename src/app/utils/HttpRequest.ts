import { ErroResponse } from "../models/dto/ErroResponse";
import { HttpError } from "./HttpError";

export class HttpRequest {

    constructor(private baseUrl: string) {
        this.baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    }

    private async validarResposta<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let data: ErroResponse | null = null;
            try {
                data = await response.json() as ErroResponse;
            } catch {
                data = null;
            }
            throw new HttpError(response.status, data);
        }
        if (response.status === 204 || response.status === 205) {
            return undefined as T;
        }
        return response.json() as Promise<T>;
    }

    private async executar<T>(url: string, init: RequestInit): Promise<T> {
        const token = localStorage.getItem("token");
        const tokenTipo = localStorage.getItem("token_tipo") || "Bearer";
        const headers = new Headers(init.headers as HeadersInit || {});
        if (token && !headers.has("Authorization")) {
            headers.set("Authorization", `${tokenTipo} ${token}`);
        }
        init.headers = headers;

        const response = await fetch(url, init);
        return this.validarResposta<T>(response);
    }

    public get<T>(url: string, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'GET',
            headers: headers,
        });
    }
    public post<T>(url: string, data: any, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(data),
        });
    }
    public put<T>(url: string, data: any, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(data),
        });
    }
    public delete<T>(url: string, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'DELETE',
            headers: headers,
        });
    }
    public patch<T>(url: string, data: any, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(data),
        });
    }
}