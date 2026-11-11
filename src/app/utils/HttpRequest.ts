import { ErroResponse } from "../models/dto/ErroResponse";
import { HttpError } from "./HttpError";

export class HttpRequest {

    constructor(private baseUrl: string) {
        this.baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    }

    private async criarHttpError(response: Response): Promise<HttpError> {
        let data: ErroResponse | null = null;
        try {
            data = await response.json() as ErroResponse;
        } catch {
            data = null;
        }
        return new HttpError(response.status, data);
    }

    private async validarResposta<T>(response: Response): Promise<T> {
        if (!response.ok) {
            throw await this.criarHttpError(response);
        }
        if (response.status === 204 || response.status === 205) {
            return undefined as T;
        }
        return response.json() as Promise<T>;
    }

    private async validarRespostaBlob(response: Response): Promise<Blob> {
        if (!response.ok) {
            throw await this.criarHttpError(response);
        }
        return response.blob();
    }

    private async executarRequisicao(url: string, init: RequestInit): Promise<Response> {
        const token = localStorage.getItem("token");
        const tokenTipo = localStorage.getItem("token_tipo") || "Bearer";
        const headers = new Headers(init.headers as HeadersInit || {});
        const isLoginEndpoint = url.includes('/auth/login');
        if (token && !headers.has("Authorization") && !isLoginEndpoint) {
            headers.set("Authorization", `${tokenTipo} ${token}`);
        }
        init.headers = headers;

        return fetch(url, init);
    }

    private async executar<T>(url: string, init: RequestInit): Promise<T> {
        const response = await this.executarRequisicao(url, init);
        return this.validarResposta<T>(response);
    }

    public get<T>(url: string, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'GET',
            headers: headers,
        });
    }

    /** Baixa o corpo da resposta como Blob (ex.: arquivos .ics, PDFs). */
    public async getBlob(url: string, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<Blob> {
        const response = await this.executarRequisicao(`${baseUrl}${url}`, {
            method: 'GET',
            headers: headers,
        });
        return this.validarRespostaBlob(response);
    }

    /**
     * Busca uma URL absoluta externa e retorna o corpo como texto puro.
     * Não anexa o token JWT nem o baseUrl da API (uso para leitura de páginas externas).
     */
    public async getExternalText(url: string): Promise<string> {
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new HttpError(response.status, null);
        }
        return response.text();
    }

    public post<T>(url: string, data: any, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'POST',
            headers: {
                ...defaultHeaders,
                ...headers,
            },
            body: isFormData ? data : JSON.stringify(data),
        });
    }
    public put<T>(url: string, data: any, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'PUT',
            headers: {
                ...defaultHeaders,
                ...headers,
            },
            body: isFormData ? data : JSON.stringify(data),
        });
    }
    public delete<T>(url: string, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'DELETE',
            headers: headers,
        });
    }
    public patch<T>(url: string, data: any, headers: Record<string, string> = {}, baseUrl: string = this.baseUrl): Promise<T> {
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
        return this.executar<T>(`${baseUrl}${url}`, {
            method: 'PATCH',
            headers: {
                ...defaultHeaders,
                ...headers,
            },
            body: isFormData ? data : JSON.stringify(data),
        });
    }
}