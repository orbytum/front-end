/**
 * Aplica a máscara de telefone brasileiro enquanto o usuário digita:
 * (41) 3333-4444 para fixos (10 dígitos) e (41) 99999-0000 para celulares (11 dígitos).
 */
export function formatarTelefone(valor: string): string {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    if (!digitos) return "";
    if (digitos.length <= 2) return `(${digitos}`;
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}

/** Padrão HTML (atributo `pattern`) de um telefone completo já formatado, com DDD. */
export const PADRAO_TELEFONE = "\\(\\d{2}\\) \\d{4,5}-\\d{4}";

/** Mensagem exibida quando o telefone não está completo (usada no atributo `title`). */
export const MENSAGEM_TELEFONE_INVALIDO = "Informe o telefone com DDD, ex.: (41) 99999-0000.";
