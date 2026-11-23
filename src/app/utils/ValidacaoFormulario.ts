type CampoValidavel = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const ATRIBUTO_INVALIDO = "data-invalido";

function isCampoValidavel(alvo: EventTarget | null): alvo is CampoValidavel {
    return alvo instanceof HTMLInputElement
        || alvo instanceof HTMLSelectElement
        || alvo instanceof HTMLTextAreaElement;
}

/** Traduz o motivo da invalidez nativa do navegador para uma mensagem em português. */
function mensagemEmPortugues(campo: CampoValidavel): string {
    const v = campo.validity;
    if (v.valueMissing) {
        if (campo instanceof HTMLSelectElement) return "Selecione uma opção.";
        if (campo instanceof HTMLInputElement && (campo.type === "checkbox" || campo.type === "radio")) {
            return "Marque esta opção para continuar.";
        }
        if (campo instanceof HTMLInputElement && campo.type === "file") return "Selecione um arquivo.";
        return "Preencha este campo.";
    }
    if (v.typeMismatch) {
        if (campo instanceof HTMLInputElement && campo.type === "email") return "Informe um e-mail válido.";
        if (campo instanceof HTMLInputElement && campo.type === "url") return "Informe um endereço (URL) válido.";
        return "Informe um valor válido.";
    }
    if (v.badInput) return "Informe um valor válido.";
    if (v.tooShort && "minLength" in campo) return `Use pelo menos ${campo.minLength} caracteres.`;
    if (v.tooLong && "maxLength" in campo) return `Use no máximo ${campo.maxLength} caracteres.`;
    if (v.rangeUnderflow && campo instanceof HTMLInputElement) return `O valor deve ser maior ou igual a ${campo.min}.`;
    if (v.rangeOverflow && campo instanceof HTMLInputElement) return `O valor deve ser menor ou igual a ${campo.max}.`;
    if (v.stepMismatch) return "Informe um valor válido.";
    if (v.patternMismatch) return campo.title || "O valor não está no formato esperado.";
    return "Verifique o valor informado.";
}

/** Remove a mensagem traduzida e, se o campo já estiver válido, a marcação de erro. */
function reavaliar(campo: CampoValidavel): void {
    campo.setCustomValidity("");
    if (campo.validity.valid) {
        campo.removeAttribute(ATRIBUTO_INVALIDO);
    }
}

/**
 * Substitui as mensagens de validação nativas do navegador (que seguem o idioma do navegador,
 * ex.: "Please fill out this field") por mensagens em português e marca o campo inválido com
 * o atributo `data-invalido`, estilizado em `styles/theme.css`. Deve ser instalado uma única vez.
 */
export function instalarValidacaoEmPortugues(): void {
    document.addEventListener("invalid", (evento) => {
        const campo = evento.target;
        if (!isCampoValidavel(campo)) return;
        // Limpa uma mensagem anterior para avaliar só a invalidez nativa do valor atual.
        campo.setCustomValidity("");
        if (campo.validity.valid) return;
        campo.setCustomValidity(mensagemEmPortugues(campo));
        campo.setAttribute(ATRIBUTO_INVALIDO, "true");
    }, true);

    const aoAlterar = (evento: Event) => {
        if (isCampoValidavel(evento.target)) reavaliar(evento.target);
    };
    document.addEventListener("input", aoAlterar, true);
    document.addEventListener("change", aoAlterar, true);
    // Valores alterados por código (ex.: seletores de data) não disparam "input"; ao sair do
    // campo a mensagem é limpa para não bloquear um envio que já esteja válido.
    document.addEventListener("focusout", (evento) => {
        if (isCampoValidavel(evento.target)) evento.target.setCustomValidity("");
    }, true);
}
