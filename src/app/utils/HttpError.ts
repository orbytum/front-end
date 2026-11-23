import { ErroResponse } from "../models/dto/ErroResponse";

/** Mensagens exibidas quando a API responde com erro sem corpo (ex.: 403 vazio). */
const MENSAGENS_PADRAO: Record<number, string> = {
    400: "Não foi possível processar a requisição. Verifique os dados informados.",
    401: "Sua sessão expirou. Faça login novamente.",
    403: "Você não tem permissão para realizar esta ação.",
    404: "O recurso solicitado não foi encontrado.",
    409: "A operação entra em conflito com dados já existentes.",
    413: "O arquivo enviado excede o tamanho máximo permitido.",
};

export class HttpError extends Error {
    constructor(
        public status: number,
        public response: ErroResponse | null = null,
    ) {
        super(HttpError.mensagemPara(status, response));
        this.name = "HttpError";
    }

    /** Mensagem para o usuário: a enviada pela API ou uma genérica, sem expor o código HTTP. */
    private static mensagemPara(status: number, response: ErroResponse | null): string {
        const mensagem = response?.mensagem?.trim();
        if (mensagem) {
            return mensagem;
        }
        if (MENSAGENS_PADRAO[status]) {
            return MENSAGENS_PADRAO[status];
        }
        return status >= 500
            ? "Ocorreu um erro no servidor. Tente novamente em instantes."
            : "Não foi possível concluir a operação.";
    }
}
