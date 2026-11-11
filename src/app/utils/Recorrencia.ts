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

function ocorrenciaPorIndice(
    dataBase: Date,
    recorrencia: TipoRecorrencia,
    indice: number
): Date {
    switch (recorrencia) {
        case "Diária": {
            const data = new Date(dataBase);
            data.setDate(data.getDate() + indice);
            return data;
        }
        case "Semanal": {
            const data = new Date(dataBase);
            data.setDate(data.getDate() + indice * 7);
            return data;
        }
        case "Mensal":
            return somarMeses(dataBase, indice);
        case "Anual":
            return somarMeses(dataBase, indice * 12);
        default:
            return new Date(dataBase);
    }
}

function indiceInicial(
    dataBase: Date,
    recorrencia: TipoRecorrencia,
    inicio: Date
): number {
    if (inicio.getTime() <= dataBase.getTime()) {
        return 0;
    }
    const diffMs = inicio.getTime() - dataBase.getTime();
    const diffDias = Math.floor(diffMs / MS_DIA);

    switch (recorrencia) {
        case "Diária":
            return Math.max(0, diffDias - 1);
        case "Semanal":
            return Math.max(0, Math.floor(diffDias / 7) - 1);
        case "Mensal": {
            const diffMeses = (inicio.getFullYear() - dataBase.getFullYear()) * 12
                + (inicio.getMonth() - dataBase.getMonth());
            return Math.max(0, diffMeses - 1);
        }
        case "Anual": {
            const diffAnos = inicio.getFullYear() - dataBase.getFullYear();
            return Math.max(0, diffAnos - 1);
        }
        default:
            return 0;
    }
}

/**
 * Expande as ocorrências de um lembrete dentro do intervalo informado.
 * Útil para exibir eventos recorrentes no calendário.
 */
export function ocorrenciasNoIntervalo(
    dataBase: Date,
    recorrencia: TipoRecorrencia | null | undefined,
    inicio: Date,
    fim: Date
): Date[] {
    if (Number.isNaN(dataBase.getTime()) || inicio.getTime() > fim.getTime()) {
        return [];
    }

    if (!recorrencia || recorrencia === "Nenhuma") {
        return dataBase.getTime() >= inicio.getTime() && dataBase.getTime() <= fim.getTime()
            ? [new Date(dataBase)]
            : [];
    }

    const ocorrencias: Date[] = [];
    let indice = indiceInicial(dataBase, recorrencia, inicio);

    // Limite de segurança para recorrências muito antigas ou intervalos muito longos.
    for (let iteracoes = 0; iteracoes < 1000; iteracoes += 1) {
        const ocorrencia = ocorrenciaPorIndice(dataBase, recorrencia, indice);
        if (ocorrencia.getTime() > fim.getTime()) {
            break;
        }
        if (ocorrencia.getTime() >= inicio.getTime()) {
            ocorrencias.push(ocorrencia);
        }
        indice += 1;
    }

    return ocorrencias;
}
