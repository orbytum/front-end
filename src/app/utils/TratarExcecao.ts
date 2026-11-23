import { ErroResponse } from "../models/dto/ErroResponse";
import { HttpError } from "./HttpError";
import { ZodError } from "zod";
import { RouterRef } from "./RouterRef";

export class TratarExcecao {
    public static tratar(error: ErroResponse | any): void {
        if (error instanceof HttpError) {
            this.tratarHttpError(error);
        } else if (error instanceof ZodError) {
            this.exibirAlerta(null, "O servidor retornou uma resposta em formato inesperado.");
        } else {
            this.tratarException(error);
        }
    }

    private static tratarHttpError(error: HttpError): void {
        if (error.status === 401) {
            RouterRef.navigate("/login");
            return;
        }
        this.exibirAlerta(null, error.message);
    }

    private static tratarException(error: any): void {
        const mensagem = error?.message || "Ocorreu um erro inesperado.";
        this.exibirAlerta(null, mensagem);
    }

    private static exibirAlerta(titulo: string | null, mensagem: string): void {
        window.dispatchEvent(new CustomEvent("app:error", { detail: { titulo, mensagem } }));
    }
}