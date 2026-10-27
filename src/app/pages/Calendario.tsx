import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  FileText,
  Link2,
  Loader2,
  MapPin,
  Presentation,
  RefreshCw,
  Repeat,
  Users,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { AtividadeService } from "../services/atividades/AtividadeService";
import { LembreteService } from "../services/lembretes/LembreteService";
import {
  TIPOS_LEMBRETE,
  type LembreteResponse,
  type TipoLembrete,
  type TipoRecorrencia,
} from "../models/dto/lembretes/Lembrete";
import {
  AtividadeStatusLabels,
  type AtividadeResponse,
  type AtividadeStatus,
} from "../models/dto/atividades/Atividade";
import { ocorrenciasNoIntervalo } from "../utils/Recorrencia";
import { HttpError } from "../utils/HttpError";

const MS_DIA = 24 * 60 * 60 * 1000;

const NOMES_DOS_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_DA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type OrigemItem = "ATIVIDADE" | "LEMBRETE";

interface ItemCalendario {
  chave: string;
  origem: OrigemItem;
  origemId: number;
  titulo: string;
  descricao: string;
  data: Date;
  subtipo: string;
  tipoLembrete?: TipoLembrete;
  status?: string;
  isAtrasada?: boolean;
  local?: string;
  link?: string;
  responsavelNome?: string | null;
  projetoId?: number | null;
  recorrencia?: TipoRecorrencia | null;
}

interface ConfiguracaoItem {
  icone: ElementType;
  cor: string;
  fundo: string;
  borda: string;
}

const CONFIG_LEMBRETE: Record<TipoLembrete, ConfiguracaoItem> = {
  Edital: {
    icone: FileText,
    cor: "text-[#f59e0b]",
    fundo: "bg-[#f59e0b]/15",
    borda: "border-[#f59e0b]/30",
  },
  Reunião: {
    icone: Coffee,
    cor: "text-[#4a9eff]",
    fundo: "bg-[#4a9eff]/15",
    borda: "border-[#4a9eff]/30",
  },
  Apresentação: {
    icone: Presentation,
    cor: "text-[#10b981]",
    fundo: "bg-[#10b981]/15",
    borda: "border-[#10b981]/30",
  },
  Workshop: {
    icone: Users,
    cor: "text-[#a78bfa]",
    fundo: "bg-[#a78bfa]/15",
    borda: "border-[#a78bfa]/30",
  },
};

const CONFIG_ATIVIDADE: ConfiguracaoItem = {
  icone: CalendarIcon,
  cor: "text-[#ff8c42]",
  fundo: "bg-[#ff8c42]/15",
  borda: "border-[#ff8c42]/30",
};

function configDoItem(item: ItemCalendario): ConfiguracaoItem {
  if (item.origem === "ATIVIDADE") {
    return CONFIG_ATIVIDADE;
  }
  return CONFIG_LEMBRETE[item.tipoLembrete ?? "Reunião"];
}

function chaveData(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function formatarDataLonga(chave: string): string {
  const data = new Date(`${chave}T12:00:00`);
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatarHora(data: Date): string {
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function mensagemDeErro(err: unknown, padrao: string): string {
  if (err instanceof HttpError) return err.response?.mensagem || err.message;
  return padrao;
}

function mapearLembrete(lembrete: LembreteResponse, data: Date): ItemCalendario {
  return {
    chave: `lembrete-${lembrete.id}-${data.getTime()}`,
    origem: "LEMBRETE",
    origemId: lembrete.id,
    titulo: lembrete.titulo,
    descricao: lembrete.descricao ?? "",
    data,
    subtipo: lembrete.tipo,
    tipoLembrete: lembrete.tipo,
    local: lembrete.localizacao ?? "",
    link: lembrete.link ?? "",
    recorrencia: lembrete.recorrencia ?? "Nenhuma",
  };
}

function mapearAtividade(atividade: AtividadeResponse): ItemCalendario | null {
  if (!atividade.dthPrazo) return null;
  const data = new Date(atividade.dthPrazo);
  if (Number.isNaN(data.getTime())) return null;

  return {
    chave: `atividade-${atividade.id}`,
    origem: "ATIVIDADE",
    origemId: atividade.id,
    titulo: atividade.titulo,
    descricao: atividade.descricao ?? "",
    data,
    subtipo: AtividadeStatusLabels[atividade.status as AtividadeStatus] ?? atividade.status,
    status: atividade.status,
    isAtrasada: atividade.isAtrasada,
    responsavelNome: atividade.responsavelNome ?? null,
    projetoId: atividade.projetoId,
  };
}

export function Calendario() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const lembreteService = useMemo(() => new LembreteService(), []);
  const atividadeService = useMemo(() => new AtividadeService(), []);

  const [dataAtual, setDataAtual] = useState(() => new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [lembretes, setLembretes] = useState<LembreteResponse[]>([]);
  const [atividades, setAtividades] = useState<AtividadeResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [exportando, setExportando] = useState(false);

  const grupoId = grupoAtual?.id;

  const carregar = useCallback(async () => {
    if (!grupoId) {
      setLembretes([]);
      setAtividades([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro("");
    try {
      const [lembretesDoGrupo, atividadesDoGrupo] = await Promise.all([
        lembreteService.listarTodosPorGrupo(grupoId),
        atividadeService.listarPorGrupo(grupoId),
      ]);
      setLembretes(lembretesDoGrupo);
      setAtividades(atividadesDoGrupo);
    } catch (err) {
      setLembretes([]);
      setAtividades([]);
      setErro(mensagemDeErro(err, "Erro ao carregar o calendário."));
    } finally {
      setCarregando(false);
    }
  }, [grupoId, lembreteService, atividadeService]);

  useEffect(() => {
    setDiaSelecionado(null);
    carregar();
  }, [carregar]);

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  const itensDoMes = useMemo(() => {
    const inicioMes = new Date(ano, mes, 1);
    const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59, 999);

    const itensLembretes = lembretes.flatMap((lembrete) =>
      ocorrenciasNoIntervalo(new Date(lembrete.dataHora), lembrete.recorrencia, inicioMes, fimMes)
        .map((data) => mapearLembrete(lembrete, data))
    );

    const itensAtividades = atividades.flatMap((atividade) => {
      const item = mapearAtividade(atividade);
      if (!item) return [];
      return item.data.getTime() >= inicioMes.getTime() && item.data.getTime() <= fimMes.getTime()
        ? [item]
        : [];
    });

    return [...itensLembretes, ...itensAtividades]
      .sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [lembretes, atividades, ano, mes]);

  const itensPorDia = useMemo(() => {
    const mapa = new Map<string, ItemCalendario[]>();
    for (const item of itensDoMes) {
      const chave = chaveData(item.data);
      const lista = mapa.get(chave) ?? [];
      lista.push(item);
      mapa.set(chave, lista);
    }
    return mapa;
  }, [itensDoMes]);

  const proximos30Dias = useMemo(() => {
    const agora = new Date();
    const fim = new Date(agora.getTime() + 30 * MS_DIA);

    const lembretesProximos = lembretes.flatMap((lembrete) =>
      ocorrenciasNoIntervalo(new Date(lembrete.dataHora), lembrete.recorrencia, agora, fim)
        .map((data) => mapearLembrete(lembrete, data))
    );

    const atividadesProximas = atividades.flatMap((atividade) => {
      const item = mapearAtividade(atividade);
      if (!item) return [];
      return item.data.getTime() >= agora.getTime() && item.data.getTime() <= fim.getTime()
        ? [item]
        : [];
    });

    return [...lembretesProximos, ...atividadesProximas]
      .sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [lembretes, atividades]);

  const itensPainel = diaSelecionado
    ? itensPorDia.get(diaSelecionado) ?? []
    : proximos30Dias;

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
  const chaveHoje = chaveData(new Date());

  const mesAnterior = () => {
    setDataAtual(new Date(ano, mes - 1, 1));
    setDiaSelecionado(null);
  };

  const proximoMes = () => {
    setDataAtual(new Date(ano, mes + 1, 1));
    setDiaSelecionado(null);
  };

  const irParaHoje = () => {
    setDataAtual(new Date());
    setDiaSelecionado(null);
  };

  const exportarCalendario = async () => {
    if (!grupoId) return;
    setExportando(true);
    setErro("");
    try {
      const blob = await lembreteService.exportarIcs(grupoId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lembretes-grupo-${grupoId}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setErro(mensagemDeErro(err, "Erro ao exportar os lembretes para .ics."));
    } finally {
      setExportando(false);
    }
  };

  if (carregandoGrupos) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff8c42]" />
      </div>
    );
  }

  if (!grupoAtual) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="bg-card border border-border/30 rounded-2xl p-8 max-w-md text-center">
          <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-foreground font-semibold mb-2">Nenhum grupo selecionado</h2>
          <p className="text-muted-foreground text-sm">
            Selecione um grupo de pesquisa no cabeçalho para visualizar as atividades e lembretes no calendário.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-foreground mb-2">Calendário</h1>
          <p className="text-muted-foreground">
            Atividades e lembretes do grupo <strong className="text-foreground">{grupoAtual.nome}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregar}
            disabled={carregando}
            title="Recarregar calendário"
            className="p-3 bg-card border border-border/30 rounded-xl text-muted-foreground hover:text-foreground hover:border-[#ff8c42]/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${carregando ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportarCalendario}
            disabled={!grupoId || exportando}
            title="Baixar os lembretes do grupo em formato .ics"
            className="px-5 py-3 disabled:opacity-50 bg-card border border-border/30 text-foreground rounded-xl transition-all duration-300 flex items-center gap-2 font-medium whitespace-nowrap hover:border-[#ff8c42]/50"
          >
            {exportando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Exportar .ics
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{erro}</span>
          <button onClick={carregar} title="Tentar novamente" className="p-1 hover:opacity-70">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="xl:col-span-2">
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-foreground">
                  {NOMES_DOS_MESES[mes]} {ano}
                </h2>
                <button
                  onClick={irParaHoje}
                  className="px-2.5 py-1 text-xs rounded-lg border border-border/30 text-muted-foreground hover:text-foreground hover:border-[#ff8c42]/50 transition-colors"
                >
                  Hoje
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={mesAnterior}
                  title="Mês anterior"
                  className="p-2 hover:bg-border/20 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={proximoMes}
                  title="Próximo mês"
                  className="p-2 hover:bg-border/20 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pt-4">
              <span className="flex items-center gap-1.5 text-xs text-[#ff8c42]">
                <span className="w-2 h-2 rounded-full bg-current" />
                Atividade
              </span>
              {TIPOS_LEMBRETE.map((tipo) => {
                const config = CONFIG_LEMBRETE[tipo];
                return (
                  <span key={tipo} className={`flex items-center gap-1.5 text-xs ${config.cor}`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    Lembrete · {tipo}
                  </span>
                );
              })}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DIAS_DA_SEMANA.map((dia) => (
                  <div key={dia} className="text-center text-sm text-muted-foreground font-medium py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {carregando ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ff8c42]" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: primeiroDiaDoMes }).map((_, i) => (
                    <div key={`vazio-${i}`} className="min-h-[96px]" />
                  ))}

                  {Array.from({ length: diasNoMes }).map((_, i) => {
                    const dia = i + 1;
                    const dataDoDia = new Date(ano, mes, dia);
                    const chave = chaveData(dataDoDia);
                    const itensDoDia = itensPorDia.get(chave) ?? [];
                    const ehHoje = chave === chaveHoje;
                    const selecionado = chave === diaSelecionado;
                    const temAtrasada = itensDoDia.some(
                      (item) => item.origem === "ATIVIDADE" && item.isAtrasada
                    );

                    return (
                      <button
                        type="button"
                        key={dia}
                        onClick={() => setDiaSelecionado(selecionado ? null : chave)}
                        className={`min-h-[96px] p-2 rounded-xl border text-left transition-all duration-200 ${
                          selecionado
                            ? "border-[#ff8c42] bg-[#ff8c42]/10"
                            : ehHoje
                              ? "border-[#ff8c42]/60 bg-[#ff8c42]/5"
                              : itensDoDia.length > 0
                                ? "border-border/40 bg-background hover:border-[#ff8c42]/40"
                                : "border-border/20 bg-background hover:border-border/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-medium ${
                              ehHoje ? "text-[#ff8c42]" : "text-foreground"
                            }`}
                          >
                            {dia}
                          </span>
                          {temAtrasada && (
                            <AlertCircle className="w-3.5 h-3.5 text-[#ef4444]" aria-label="Atividade atrasada" />
                          )}
                        </div>

                        {itensDoDia.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {itensDoDia.slice(0, 2).map((item) => {
                              const config = configDoItem(item);
                              const Icone = config.icone;
                              return (
                                <div
                                  key={item.chave}
                                  title={`${item.origem === "LEMBRETE" ? `Lembrete · ${item.subtipo}` : "Atividade"} — ${item.titulo}`}
                                  className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] border ${config.borda} ${config.fundo} ${config.cor}`}
                                >
                                  <Icone className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{item.titulo}</span>
                                </div>
                              );
                            })}
                            {itensDoDia.length > 2 && (
                              <span className="block text-[11px] text-muted-foreground pl-0.5">
                                +{itensDoDia.length - 2} mais
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Próximos 30 dias / itens do dia */}
        <div className="xl:col-span-1">
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-foreground">
                    {diaSelecionado ? formatarDataLonga(diaSelecionado) : "Próximos 30 dias"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {diaSelecionado
                      ? `${itensPainel.length} item(ns) neste dia`
                      : `${itensPainel.length} item(ns) entre hoje e ${new Date(Date.now() + 30 * MS_DIA).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                {diaSelecionado && (
                  <button
                    onClick={() => setDiaSelecionado(null)}
                    className="text-xs text-[#ff8c42] hover:opacity-80 whitespace-nowrap"
                  >
                    Ver próximos
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3 max-h-[640px] overflow-y-auto">
              {itensPainel.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {diaSelecionado
                      ? "Nenhuma atividade ou lembrete neste dia."
                      : "Nenhuma atividade ou lembrete nos próximos 30 dias."}
                  </p>
                </div>
              ) : (
                itensPainel.map((item) => {
                  const config = configDoItem(item);
                  const Icone = config.icone;
                  return (
                    <div
                      key={item.chave}
                      className={`p-4 rounded-xl border ${config.borda} ${config.fundo}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-background flex flex-col items-center justify-center flex-shrink-0 ${config.cor}`}>
                          <span className="text-[10px] uppercase">
                            {item.data.toLocaleDateString("pt-BR", { month: "short" })}
                          </span>
                          <span className="text-sm font-bold">{item.data.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground text-sm leading-snug">
                              {item.titulo}
                            </h4>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] border bg-background/40 flex items-center gap-1 ${config.borda} ${config.cor}`}
                            >
                              <Icone className="w-3 h-3" />
                              {item.origem === "LEMBRETE"
                                ? `Lembrete · ${item.subtipo}`
                                : "Atividade"}
                            </span>
                          </div>

                          {item.descricao && (
                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                              {item.descricao}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatarHora(item.data)}
                            </span>

                            {item.origem === "ATIVIDADE" && (
                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  item.isAtrasada
                                    ? "bg-[#ef4444]/15 text-[#ef4444]"
                                    : "bg-border/30 text-foreground"
                                }`}
                              >
                                {item.isAtrasada ? "Atrasada" : item.subtipo}
                              </span>
                            )}

                            {item.local && (
                              <span className="flex items-center gap-1 min-w-0">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{item.local}</span>
                              </span>
                            )}

                            {item.responsavelNome && (
                              <span className="flex items-center gap-1 min-w-0">
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{item.responsavelNome}</span>
                              </span>
                            )}

                            {item.recorrencia && item.recorrencia !== "Nenhuma" && (
                              <span className="flex items-center gap-1">
                                <Repeat className="w-3.5 h-3.5" />
                                {item.recorrencia}
                              </span>
                            )}

                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) => event.stopPropagation()}
                                className="flex items-center gap-1 text-[#4a9eff] hover:opacity-80"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                Link
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
