import { z } from "zod";

/**
 * Nível do usuário no grupo. O "Líder de projeto" não é um nível de grupo:
 * vem da flag liderProjeto do participante do projeto (ou isLiderDeProjeto do grupo atual).
 */
export const nivelMembroSchema = z.enum(["LIDER", "MEMBRO", "COLABORADOR"]);

export type NivelMembro = z.infer<typeof nivelMembroSchema>;

export const NivelMembroLabels: Record<NivelMembro, string> = {
    LIDER: "Líder",
    MEMBRO: "Pesquisador",
    COLABORADOR: "Colaborador",
};

export function nivelEhLider(nivel?: NivelMembro | null): boolean {
    return nivel === "LIDER";
}

/** Colaborador tem acesso somente de leitura. */
export function nivelPodeEscrever(nivel?: NivelMembro | null): boolean {
    return nivel === "LIDER" || nivel === "MEMBRO";
}
