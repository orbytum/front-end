import { z } from "zod";

export const nivelMembroSchema = z.enum(["LIDER", "COORDENADOR", "PESQUISADOR"]);

export type NivelMembro = z.infer<typeof nivelMembroSchema>;

export const NivelMembroLabels: Record<NivelMembro, string> = {
    LIDER: "Líder",
    COORDENADOR: "Coordenador",
    PESQUISADOR: "Pesquisador",
};

export function nivelEhCoordenadorOuAcima(nivel?: NivelMembro | null): boolean {
    debugger
    return nivel === "LIDER" || nivel === "COORDENADOR";
}
