import { ErroResponse } from "../models/dto/ErroResponse";
import { HttpError } from "./HttpError";
import { ZodError } from "zod";
import { RouterRef } from "./RouterRef";

export class TratarExcecao {
    public static tratar(error: ErroResponse | any): void {
        if (error instanceof HttpError) {
            this.tratarHttpError(error);
        } else if (error instanceof ZodError) {
            this.exibirAlerta("Resposta inválida", "O servidor retornou um formato inesperado.");
        } else {
            this.tratarException(error);
        }
    }

    private static tratarHttpError(error: HttpError): void {
        if (error.status === 401) {
            RouterRef.navigate("/login");
            return;
        }
        const mensagem = error.response?.mensagem || "Erro ao processar a requisição.";
        this.exibirAlerta(`Erro ${error.status}`, mensagem);
    }

    private static tratarException(error: any): void {
        const mensagem = error?.message || "Ocorreu um erro inesperado.";
        this.exibirAlerta("Erro inesperado", mensagem);
    }

    private static exibirAlerta(titulo: string, mensagem: string): void {
        window.dispatchEvent(new CustomEvent("app:error", { detail: { titulo, mensagem } }));
    }
}