import { TipoRecorrencia } from "../models/dto/lembretes/Lembrete";

const MS_DIA = 24 * 60 * 60 * 1000;

function somarMeses(base: Date, meses: number): Date {
    const dia = base.getDate();
    const resultado = new Date(base.getFullYear(), base.getMonth() + meses, 1,
        base.getHours(), base.getMinutes(), base.getSeconds());
    const ultimoDia = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
    resultado.setDate(Math.min(dia, ultimoDia));
    return resultado;
}

/**
 * Retorna a próxima ocorrência (>= agora) de um evento. Para eventos sem recorrência
 * ou ainda no futuro, devolve a própria data base. Eventos recorrentes nunca terminam,
 * então sempre resultam numa data futura.
 */
export function proximaOcorrencia(
    dataBase: Date,
    recorrencia: TipoRecorrencia | null | undefined,
    agora: Date = new Date()
): Date {
    if (!recorrencia || recorrencia === "Nenhuma" || dataBase.getTime() >= agora.getTime()) {
        return dataBase;
    }

    switch (recorrencia) {
        case "Diária":
        case "Semanal": {
            const passo = (recorrencia === "Diária" ? 1 : 7) * MS_DIA;
            const k = Math.ceil((agora.getTime() - dataBase.getTime()) / passo);
            const dias = k * (recorrencia === "Diária" ? 1 : 7);
            // Soma em dias de calendário para respeitar horário de verão
            const candidata = new Date(dataBase);
            candidata.setDate(candidata.getDate() + dias);
            return candidata;
        }
        case "Mensal":
        case "Anual": {
            const mesesPorPasso = recorrencia === "Mensal" ? 1 : 12;
            const diffMeses = (agora.getFullYear() - dataBase.getFullYear()) * 12
                + (agora.getMonth() - dataBase.getMonth());
            let k = Math.max(0, Math.floor(diffMeses / mesesPorPasso));
            let candidata = somarMeses(dataBase, k * mesesPorPasso);
            while (candidata.getTime() < agora.getTime()) {
                k += 1;
                candidata = somarMeses(dataBase, k * mesesPorPasso);
            }
            return candidata;
        }
        default:
            return dataBase;
    }
}
