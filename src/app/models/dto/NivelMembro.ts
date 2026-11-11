import { z } from "zod";

export const nivelMembroSchema = z.enum([
    "LIDER",
    "COORDENADOR",
    "PESQUISADOR",
    "COLABORADOR",
]);

export type NivelMembro = z.infer<typeof nivelMembroSchema>;

export const NivelMembroLabels: Record<NivelMembro, string> = {
    LIDER: "Líder",
    COORDENADOR: "Coordenador",
    PESQUISADOR: "Pesquisador",
    COLABORADOR: "Colaborador",
};

export function nivelEhCoordenadorOuAcima(nivel?: NivelMembro | null): boolean {
    return nivel === "LIDER" || nivel === "COORDENADOR";
}

export function nivelEhLider(nivel?: NivelMembro | null): boolean {
    return nivel === "LIDER";
}

export function nivelEhColaborador(nivel?: NivelMembro | null): boolean {
    return nivel === "COLABORADOR";
}

/** Perfil com permissão de escrita no escopo do grupo/projeto. */
export function nivelPodeEscrever(nivel?: NivelMembro | null): boolean {
    return !!nivel && nivel !== "COLABORADOR";
}
