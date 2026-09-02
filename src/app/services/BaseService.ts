import { HttpRequest } from "../utils/HttpRequest";
import { TratarExcecao } from "../utils/TratarExcecao";
import { type ZodType } from "zod";

export class BaseService {
    public httpRequest: HttpRequest;

    constructor(baseUrl: string | null = null) {
        this.httpRequest = this.setBaseUrl(baseUrl);
    }

    private async requisitar<T>(executar: () => Promise<unknown>, schema?: ZodType<T>): Promise<T> {
        try {
            const response = await executar();
            return schema ? schema.parse(response) : response as T;
        } catch (error) {
            TratarExcecao.tratar(error);
            throw error;
        }
    }

    public get<T>(path: string, headers: Record<string, string> = {}, schema?: ZodType<T>): Promise<T> {
        return this.requisitar(() => this.httpRequest.get<unknown>(path, headers), schema);
    }
    public post<T>(path: string, data: any, headers: Record<string, string> = {}, schema?: ZodType<T>): Promise<T> {
        return this.requisitar(() => this.httpRequest.post<unknown>(path, data, headers), schema);
    }
    public put<T>(path: string, data: any, headers: Record<string, string> = {}, schema?: ZodType<T>): Promise<T> {
        return this.requisitar(() => this.httpRequest.put<unknown>(path, data, headers), schema);
    }
    public delete<T>(path: string, headers: Record<string, string> = {}, schema?: ZodType<T>): Promise<T> {
        return this.requisitar(() => this.httpRequest.delete<unknown>(path, headers), schema);
    }
    public patch<T>(path: string, data: any, headers: Record<string, string> = {}, schema?: ZodType<T>): Promise<T> {
        return this.requisitar(() => this.httpRequest.patch<unknown>(path, data, headers), schema);
    }



// #region Metódos privados
    private setBaseUrl(baseUrl: string | null = null): HttpRequest {
        if (baseUrl === null) {
            baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';
        }
        this.httpRequest = new HttpRequest(baseUrl!);
        return this.httpRequest;
    }
// #endregion
}