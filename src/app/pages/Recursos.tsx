import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, CheckCircle, Hourglass, XCircle, RefreshCw, Info, Users, FolderKanban } from "lucide-react";
import { DataTable, Column } from "../components/DataTable";
import { SolicitacaoService } from "../services/solicitacoes/SolicitacaoService";
import {
  SolicitacaoResponse,
  STATUS_SOLICITACAO_APROVADA as STATUS_APROVADOS,
  STATUS_SOLICITACAO_EM_ANALISE as STATUS_EM_ANALISE,
} from "../models/dto/solicitacoes/Solicitacao";
import { HttpError } from "../utils/HttpError";

/**
 * Recursos financeiros consolidados a partir das solicitações (não há cadastro de orçamento):
 * solicitado = todas; em análise = aguardando o Líder do grupo ou o administrador;
 * aprovado = aprovadas pelo administrador (em andamento, concluídas ou encerradas); rejeitado = rejeitadas.
 */

interface Consolidado {
  chave: string;
  grupo: string;
  projeto?: string;
  solicitacoes: number;
  solicitado: number;
  emAnalise: number;
  aprovado: number;
  rejeitado: number;
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatarValor = (valor: number) => moeda.format(valor);

function somar(destino: Consolidado, s: SolicitacaoResponse) {
  const valor = s.valor ?? 0;
  destino.solicitacoes += 1;
  destino.solicitado += valor;
  if (STATUS_EM_ANALISE.has(s.status)) destino.emAnalise += valor;
  else if (STATUS_APROVADOS.has(s.status)) destino.aprovado += valor;
  else if (s.status === "REJEITADA") destino.rejeitado += valor;
}

function consolidarPor(
  lista: SolicitacaoResponse[],
  chaveDe: (s: SolicitacaoResponse) => string,
  base: (s: SolicitacaoResponse) => Pick<Consolidado, "grupo" | "projeto">
): Consolidado[] {
  const mapa = new Map<string, Consolidado>();
  for (const s of lista) {
    const chave = chaveDe(s);
    if (!mapa.has(chave)) {
      mapa.set(chave, { chave, ...base(s), solicitacoes: 0, solicitado: 0, emAnalise: 0, aprovado: 0, rejeitado: 0 });
    }
    somar(mapa.get(chave)!, s);
  }
  return [...mapa.values()].sort((a, b) => b.solicitado - a.solicitado || a.grupo.localeCompare(b.grupo, "pt-BR"));
}

type Aba = "grupo" | "projeto";

const ABAS: { id: Aba; rotulo: string; icone: typeof Users }[] = [
  { id: "grupo", rotulo: "Por grupo", icone: Users },
  { id: "projeto", rotulo: "Por projeto", icone: FolderKanban },
];

function BarraAprovacao({ aprovado, solicitado }: { aprovado: number; solicitado: number }) {
  if (solicitado <= 0) return <span className="text-xs text-muted-foreground">—</span>;
  const percentual = (aprovado / solicitado) * 100;
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
        <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${Math.min(percentual, 100)}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-9 text-right">{percentual.toFixed(0)}%</span>
    </div>
  );
}

export function Recursos() {
  const solicitacaoService = useMemo(() => new SolicitacaoService(), []);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<Aba>("grupo");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setSolicitacoes(await solicitacaoService.listarTodas());
    } catch (err) {
      setSolicitacoes([]);
      setErro(err instanceof HttpError ? err.response?.mensagem || err.message : "Erro ao carregar as solicitações.");
    } finally {
      setCarregando(false);
    }
  }, [solicitacaoService]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const total = useMemo(() => {
    const acumulado: Consolidado = { chave: "total", grupo: "", solicitacoes: 0, solicitado: 0, emAnalise: 0, aprovado: 0, rejeitado: 0 };
    solicitacoes.forEach((s) => somar(acumulado, s));
    return acumulado;
  }, [solicitacoes]);

  const contagem = useMemo(
    () => ({
      emAnalise: solicitacoes.filter((s) => STATUS_EM_ANALISE.has(s.status)).length,
      aprovadas: solicitacoes.filter((s) => STATUS_APROVADOS.has(s.status)).length,
      rejeitadas: solicitacoes.filter((s) => s.status === "REJEITADA").length,
      grupos: new Set(solicitacoes.map((s) => s.grupoId ?? s.grupoNome)).size,
    }),
    [solicitacoes]
  );

  const porGrupo = useMemo(
    () =>
      consolidarPor(
        solicitacoes,
        (s) => String(s.grupoId ?? s.grupoNome ?? "sem-grupo"),
        (s) => ({ grupo: s.grupoNome ?? "Sem grupo" })
      ),
    [solicitacoes]
  );

  const porProjeto = useMemo(
    () =>
      consolidarPor(
        solicitacoes,
        (s) => String(s.projetoId ?? s.projetoTitulo ?? "sem-projeto"),
        (s) => ({ grupo: s.grupoNome ?? "Sem grupo", projeto: s.projetoTitulo ?? "Sem projeto" })
      ),
    [solicitacoes]
  );

  const percentualAprovado = total.solicitado > 0 ? (total.aprovado / total.solicitado) * 100 : 0;

  const indicadores = [
    {
      rotulo: "Total solicitado",
      valor: formatarValor(total.solicitado),
      detalhe: `${total.solicitacoes} solicitações em ${contagem.grupos} grupo${contagem.grupos === 1 ? "" : "s"}`,
      icone: <Wallet className="w-4 h-4 text-[#4a9eff]" />,
    },
    {
      rotulo: "Aprovado",
      valor: formatarValor(total.aprovado),
      detalhe: `${percentualAprovado.toFixed(0)}% do solicitado · ${contagem.aprovadas} solicitações`,
      icone: <CheckCircle className="w-4 h-4 text-[#10b981]" />,
    },
    {
      rotulo: "Em análise",
      valor: formatarValor(total.emAnalise),
      detalhe: `${contagem.emAnalise} aguardando decisão`,
      icone: <Hourglass className="w-4 h-4 text-[#f59e0b]" />,
    },
    {
      rotulo: "Rejeitado",
      valor: formatarValor(total.rejeitado),
      detalhe: `${contagem.rejeitadas} solicitações`,
      icone: <XCircle className="w-4 h-4 text-[#ef4444]" />,
    },
  ];

  const colunasValores: Column<Consolidado>[] = [
    {
      key: "solicitado",
      header: "Solicitado",
      align: "right",
      className: "px-3!",
      headerClassName: "px-3!",
      render: (c) => <span className="text-foreground font-medium">{formatarValor(c.solicitado)}</span>,
    },
    {
      key: "emAnalise",
      header: "Em análise",
      align: "right",
      className: "px-3!",
      headerClassName: "px-3!",
      render: (c) => <span className="text-[#f59e0b]">{formatarValor(c.emAnalise)}</span>,
    },
    {
      key: "aprovado",
      header: "Aprovado",
      align: "right",
      className: "px-3!",
      headerClassName: "px-3!",
      render: (c) => <span className="text-[#10b981]">{formatarValor(c.aprovado)}</span>,
    },
    {
      key: "rejeitado",
      header: "Rejeitado",
      align: "right",
      className: "px-3!",
      headerClassName: "px-3!",
      render: (c) => <span className="text-[#ef4444]">{formatarValor(c.rejeitado)}</span>,
    },
    {
      key: "aprovacao",
      header: "Aprovação",
      align: "right",
      className: "px-3!",
      headerClassName: "px-3!",
      render: (c) => <BarraAprovacao aprovado={c.aprovado} solicitado={c.solicitado} />,
    },
  ];

  const colunasGrupo: Column<Consolidado>[] = [
    {
      key: "grupo",
      header: "Grupo",
      align: "left",
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0 max-w-[200px]" title={c.grupo}>
            <p className="text-foreground font-medium truncate">{c.grupo}</p>
            <p className="text-xs text-muted-foreground truncate">
              {c.solicitacoes} solicitaç{c.solicitacoes === 1 ? "ão" : "ões"}
            </p>
          </div>
        </div>
      ),
    },
    ...colunasValores,
  ];

  const colunasProjeto: Column<Consolidado>[] = [
    {
      key: "projeto",
      header: "Projeto",
      align: "left",
      render: (c) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#4a9eff]/15 text-[#4a9eff] flex items-center justify-center shrink-0">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="min-w-0 max-w-[200px]" title={`${c.projeto} · ${c.grupo}`}>
            <p className="text-foreground font-medium truncate">{c.projeto}</p>
            <p className="text-xs text-muted-foreground truncate">
              {c.grupo} · {c.solicitacoes} solicitaç{c.solicitacoes === 1 ? "ão" : "ões"}
            </p>
          </div>
        </div>
      ),
    },
    ...colunasValores,
  ];

  return (
    <div className="h-full overflow-auto p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 flex items-start gap-2.5 bg-card rounded-lg px-3.5 py-2.5 border border-border/30 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-[#4a9eff] shrink-0 mt-px" />
          <p>
            Valores consolidados a partir das solicitações de financiamento e compra de todos os grupos. Aprovado
            considera as solicitações aprovadas pelo administrador; solicitações de uso de material não têm valor.
          </p>
        </div>
        <button
          type="button"
          onClick={carregar}
          disabled={carregando}
          className="p-2.5 bg-card rounded-lg border border-border/30 hover:bg-border/20 transition-colors cursor-pointer disabled:opacity-50"
          title="Recarregar"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${carregando ? "animate-spin" : ""}`} />
        </button>
      </div>

      {erro && (
        <div className="bg-destructive/20 text-destructive px-4 py-3 rounded-lg border border-destructive/30 text-sm">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {indicadores.map((indicador) => (
          <div key={indicador.rotulo} className="bg-card rounded-lg px-4 py-3 border border-border/30 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {indicador.icone}
              <span>{indicador.rotulo}</span>
            </div>
            <div className="text-foreground text-xl font-bold mt-1 truncate">
              {carregando ? "…" : indicador.valor}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{carregando ? " " : indicador.detalhe}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-border/30 gap-1 overflow-x-auto">
        {ABAS.map(({ id, rotulo, icone: Icone }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              abaAtiva === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/40"
            }`}
          >
            <Icone className="w-4 h-4" />
            <span>{rotulo}</span>
          </button>
        ))}
      </div>

      <DataTable
        key={abaAtiva}
        data={abaAtiva === "grupo" ? porGrupo : porProjeto}
        columns={abaAtiva === "grupo" ? colunasGrupo : colunasProjeto}
        keyExtractor={(c) => c.chave}
        pageSize={5}
        emptyMessage={carregando ? "Carregando..." : "Nenhuma solicitação registrada."}
      />
    </div>
  );
}
