import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  Cpu,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Pencil,
  X,
  Circle,
  RefreshCw,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { SolicitacaoService } from "../services/solicitacoes/SolicitacaoService";
import { ProjetoService } from "../services/projetos/ProjetoService";
import {
  SolicitacaoResponse,
  SolicitacaoStatusLabels,
  TIPOS_SOLICITACAO_CRIAVEIS,
  TipoSolicitacaoLabels,
  podemAprovarOuRejeitar,
  podemConcluirOuEncerrar,
} from "../models/dto/solicitacoes/Solicitacao";
import { HttpError } from "../utils/HttpError";

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm disabled:opacity-50";

const labelClass = "text-xs text-muted-foreground block mb-1.5";

const selectClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm";

const NA = "\u2014";

function obterCorStatus(status: string) {
  switch (status) {
    case "CONCLUIDA": return "bg-[#10b981]/20 text-[#10b981]";
    case "REJEITADA": return "bg-[#ef4444]/20 text-[#ef4444]";
    case "EM_ANDAMENTO": return "bg-[#ff8c42]/20 text-[#ff8c42]";
    case "PENDENTE": return "bg-muted-foreground/20 text-muted-foreground";
    case "ENCERRADA": return "bg-[#7c3aed]/20 text-[#7c3aed]";
    default: return "bg-muted-foreground/20 text-muted-foreground";
  }
}

function obterIconeStatus(status: string) {
  switch (status) {
    case "CONCLUIDA": return <CheckCircle className="w-5 h-5 text-[#10b981]" />;
    case "REJEITADA": return <XCircle className="w-5 h-5 text-[#ef4444]" />;
    case "EM_ANDAMENTO": return <Clock className="w-5 h-5 text-[#ff8c42]" />;
    case "PENDENTE": return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    case "ENCERRADA": return <Circle className="w-5 h-5 text-[#7c3aed]" />;
    default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
  }
}

function obterIconeTipo(isInterna: boolean) {
  return isInterna ? <Cpu className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />;
}

function obterCorTipo(isInterna: boolean) {
  return isInterna
    ? "bg-[#7c3aed]/20 text-[#7c3aed]"
    : "bg-[#10b981]/20 text-[#10b981]";
}

function obterRotuloTipo(isInterna: boolean) {
  return isInterna ? "Uso de Material" : "Financeiro / Compra";
}

function formatarValor(valor: number | null | undefined): string {
  if (valor == null) return NA;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarData(data: string | null | undefined): string {
  if (!data) return NA;
  return new Date(data).toLocaleDateString("pt-BR");
}

export function Solicitacoes() {
  const { grupoAtual } = useGrupo();
  const solicitacaoService = useMemo(() => new SolicitacaoService(), []);
  const projetoService = useMemo(() => new ProjetoService(), []);

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [projetos, setProjetos] = useState<{ id: number; titulo: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoId, setAcaoId] = useState<number | null>(null);

  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formJustificativa, setFormJustificativa] = useState("");
  const [formTipo, setFormTipo] = useState("financiamento");
  const [formProjetoId, setFormProjetoId] = useState<number | "">("");
  const [formValor, setFormValor] = useState("");
  const [formQuantidade, setFormQuantidade] = useState("");

  const [detalheAberto, setDetalheAberto] = useState(false);
  const [solicitacaoDetalhe, setSolicitacaoDetalhe] = useState<SolicitacaoResponse | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  const [edicaoAberta, setEdicaoAberta] = useState(false);
  const [editando, setEditando] = useState<SolicitacaoResponse | null>(null);
  const [formEditJustificativa, setFormEditJustificativa] = useState("");
  const [formEditValor, setFormEditValor] = useState("");
  const [formEditQuantidade, setFormEditQuantidade] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState("");

  const carregarSolicitacoes = useCallback(async () => {
    if (!grupoAtual?.id) { setSolicitacoes([]); setCarregando(false); return; }
    setCarregando(true);
    setErro("");
    try {
      const listaProjetos = await projetoService.listarProjetosPorGrupo(grupoAtual.id);
      setProjetos(listaProjetos.map((p) => ({ id: p.id, titulo: p.titulo })));

      const todas: SolicitacaoResponse[] = [];
      for (const projeto of listaProjetos) {
        try {
          const solicitacoesProjeto = await solicitacaoService.listarPorProjeto(projeto.id);
          todas.push(...solicitacoesProjeto);
        } catch {
        }
      }
      setSolicitacoes(todas);
    } catch (err) {
      setSolicitacoes([]);
      if (err instanceof HttpError) {
        setErro(err.response?.mensagem || err.message);
      } else {
        setErro("Erro ao carregar solicitacoes.");
      }
    } finally {
      setCarregando(false);
    }
  }, [grupoAtual?.id, solicitacaoService, projetoService]);

  useEffect(() => {
    carregarSolicitacoes();
  }, [carregarSolicitacoes]);

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    const termo = termoBusca.toLowerCase();
    const correspondeBusca =
      !termo ||
      s.titulo.toLowerCase().includes(termo) ||
      s.justificativa.toLowerCase().includes(termo) ||
      (s.usuarioNome && s.usuarioNome.toLowerCase().includes(termo)) ||
      (s.projetoTitulo && s.projetoTitulo.toLowerCase().includes(termo));

    const correspondeStatus = filtroStatus === "all" || s.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  const totalValorAprovado = solicitacoes
    .filter((s) => s.status === "CONCLUIDA")
    .reduce((soma, s) => soma + (s.valor ?? 0), 0);

  const estatisticas = {
    total: solicitacoes.length,
    pendentes: solicitacoes.filter((s) => s.status === "PENDENTE").length,
    emAndamento: solicitacoes.filter((s) => s.status === "EM_ANDAMENTO").length,
    concluidas: solicitacoes.filter((s) => s.status === "CONCLUIDA").length,
    rejeitadas: solicitacoes.filter((s) => s.status === "REJEITADA" || s.status === "ENCERRADA").length,
  };

  const tratarErro = (err: unknown, fallback: string) => {
    if (err instanceof HttpError) {
      setErro(err.response?.mensagem || err.message);
    } else {
      setErro(fallback);
    }
  };

  const executarAcao = async (id: number, acao: (id: number) => Promise<SolicitacaoResponse>) => {
    setAcaoId(id);
    try {
      const atualizada = await acao(id);
      setSolicitacoes((prev) => prev.map((s) => (s.id === id ? atualizada : s)));
    } catch (err) {
      tratarErro(err, "Erro ao executar a acao.");
    } finally {
      setAcaoId(null);
    }
  };

  const handleAprovar = (id: number) => executarAcao(id, (i) => solicitacaoService.aprovar(i));
  const handleRejeitar = (id: number) => {
    if (!window.confirm("Tem certeza que deseja rejeitar esta solicitacao?")) return;
    executarAcao(id, (i) => solicitacaoService.rejeitar(i));
  };
  const handleConcluir = (id: number) => executarAcao(id, (i) => solicitacaoService.concluir(i));
  const handleEncerrar = (id: number) => {
    if (!window.confirm("Tem certeza que deseja encerrar esta solicitacao?")) return;
    executarAcao(id, (i) => solicitacaoService.encerrar(i));
  };

  const handleRemover = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta solicitacao?")) return;
    setAcaoId(id);
    try {
      await solicitacaoService.remover(id);
      setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      tratarErro(err, "Erro ao excluir solicitacao.");
    } finally {
      setAcaoId(null);
    }
  };

  const abrirDetalhe = async (id: number) => {
    setDetalheAberto(true);
    setCarregandoDetalhe(true);
    setSolicitacaoDetalhe(null);
    try {
      const detalhe = await solicitacaoService.buscarPorId(id);
      setSolicitacaoDetalhe(detalhe);
    } catch (err) {
      setDetalheAberto(false);
      tratarErro(err, "Erro ao carregar detalhes.");
    } finally {
      setCarregandoDetalhe(false);
    }
  };

  const abrirEdicao = (s: SolicitacaoResponse) => {
    setEditando(s);
    setFormEditJustificativa(s.justificativa ?? "");
    setFormEditValor(s.valor != null ? String(s.valor) : "");
    setFormEditQuantidade(s.quantidade != null ? String(s.quantidade) : "");
    setErroEdicao("");
    setEdicaoAberta(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    if (!formEditJustificativa.trim()) {
      setErroEdicao("A justificativa e obrigatoria.");
      return;
    }
    setSalvandoEdicao(true);
    setErroEdicao("");
    try {
      const atualizada = await solicitacaoService.atualizar(editando.id, {
        titulo: formEditJustificativa.trim(),
        descricao: formEditJustificativa.trim(),
        justificativa: formEditJustificativa.trim(),
        valor: formEditValor ? Number(formEditValor) : undefined,
        quantidade: formEditQuantidade ? Number(formEditQuantidade) : undefined,
      });
      setSolicitacoes((prev) => prev.map((s) => (s.id === atualizada.id ? atualizada : s)));
      setEdicaoAberta(false);
      setEditando(null);
    } catch (err) {
      if (err instanceof HttpError) {
        setErroEdicao(err.response?.mensagem || err.message);
      } else {
        setErroEdicao("Erro ao salvar a solicitacao.");
      }
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const resetForm = () => {
    setFormTitulo("");
    setFormDescricao("");
    setFormJustificativa("");
    setFormTipo("financiamento");
    setFormProjetoId("");
    setFormValor("");
    setFormQuantidade("");
    setErroForm("");
  };

  const abrirModalCriar = () => {
    resetForm();
    setModalCriarAberto(true);
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formDescricao.trim() || !formJustificativa.trim() || !formProjetoId) {
      setErroForm("Preencha todos os campos obrigatorios.");
      return;
    }
    setSalvando(true);
    setErroForm("");
    try {
      const criada = await solicitacaoService.criar({
        titulo: formTitulo.trim(),
        descricao: formDescricao.trim(),
        justificativa: formJustificativa.trim(),
        tipo: formTipo,
        projetoId: Number(formProjetoId),
        valor: formValor ? Number(formValor) : undefined,
        quantidade: formQuantidade ? Number(formQuantidade) : undefined,
      });
      setSolicitacoes((prev) => [...prev, criada]);
      setModalCriarAberto(false);
      resetForm();
    } catch (err) {
      if (err instanceof HttpError) {
        setErroForm(err.response?.mensagem || err.message);
      } else {
        setErroForm("Erro ao criar solicitacao.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const ocupado = acaoId !== null;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground mb-2">Solicitacoes de Recursos</h1>
          <p className="text-muted-foreground">Gerencie solicitacoes de verbas, equipamentos e materiais</p>
        </div>
        <button
          onClick={() => carregarSolicitacoes()}
          className="p-3 bg-card rounded-xl border border-border/30 hover:bg-card/80 transition-colors"
          title="Recarregar"
        >
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {erro && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-xl mb-6 border border-destructive/30">
          <p className="font-medium">{erro}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total</span>
            <FileText className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Pendentes</span>
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.pendentes}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Em Andamento</span>
            <Clock className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.emAndamento}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Concluidas</span>
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.concluidas}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Valor Aprovado</span>
            <DollarSign className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-foreground text-lg font-bold">{formatarValor(totalValorAprovado)}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar solicitacoes..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-3 bg-card rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Status</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="EM_ANDAMENTO">Em Andamento</option>
          <option value="CONCLUIDA">Concluidas</option>
          <option value="REJEITADA">Rejeitadas</option>
          <option value="ENCERRADA">Encerradas</option>
        </select>

        <button
          onClick={abrirModalCriar}
          className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Solicitacao</span>
        </button>
      </div>

      {carregando && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#ff8c42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando solicitacoes...</p>
        </div>
      )}

      {!carregando && (
        <div className="space-y-4">
          {solicitacoesFiltradas.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="bg-card rounded-2xl p-6 border border-border/30 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-3 rounded-xl ${obterCorTipo(solicitacao.isInterna)}`}>
                      {obterIconeTipo(solicitacao.isInterna)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground font-semibold">{solicitacao.titulo}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorTipo(solicitacao.isInterna)}`}>
                          {obterRotuloTipo(solicitacao.isInterna)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{solicitacao.justificativa}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Solicitante</span>
                          <p className="text-sm text-foreground">{solicitacao.usuarioNome ?? NA}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Projeto</span>
                          <p className="text-sm text-foreground">{solicitacao.projetoTitulo ?? NA}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Valor</span>
                          <p className="text-sm text-[#ff8c42] font-semibold">{formatarValor(solicitacao.valor)}</p>
                        </div>
                        {solicitacao.quantidade && (
                          <div>
                            <span className="text-xs text-muted-foreground">Quantidade</span>
                            <p className="text-sm text-foreground">{solicitacao.quantidade}</p>
                          </div>
                        )}
                        {solicitacao.materialNome && (
                          <div>
                            <span className="text-xs text-muted-foreground">Material</span>
                            <p className="text-sm text-foreground">{solicitacao.materialNome}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[180px]">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${obterCorStatus(solicitacao.status)}`}>
                    {obterIconeStatus(solicitacao.status)}
                    <span className="text-sm font-medium">{SolicitacaoStatusLabels[solicitacao.status] ?? solicitacao.status}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Solicitado em:<br />
                    <span className="text-foreground font-medium">
                      {formatarData(solicitacao.dthSolicitacao)}
                    </span>
                  </div>

                  {solicitacao.dthResposta && (
                    <div className="text-xs text-muted-foreground">
                      Respondido em:<br />
                      <span className="text-foreground font-medium">
                        {formatarData(solicitacao.dthResposta)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => abrirDetalhe(solicitacao.id)}
                    className="px-4 py-2 bg-[#4a9eff]/20 text-[#4a9eff] rounded-lg hover:bg-[#4a9eff]/30 transition-colors text-xs font-medium"
                  >
                    Ver detalhes
                  </button>

                  {podemAprovarOuRejeitar(solicitacao.status) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAprovar(solicitacao.id)}
                        disabled={ocupado}
                        className="px-4 py-2 bg-[#10b981]/20 text-[#10b981] rounded-lg hover:bg-[#10b981]/30 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRejeitar(solicitacao.id)}
                        disabled={ocupado}
                        className="px-4 py-2 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => abrirEdicao(solicitacao)}
                        disabled={ocupado}
                        className="px-4 py-2 bg-muted-foreground/20 text-muted-foreground rounded-lg hover:bg-muted-foreground/30 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        <Pencil className="w-4 h-4 inline" />
                        Editar
                      </button>
                    </div>
                  )}

                  {podemConcluirOuEncerrar(solicitacao.status) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConcluir(solicitacao.id)}
                        disabled={ocupado}
                        className="px-4 py-2 bg-[#10b981]/20 text-[#10b981] rounded-lg hover:bg-[#10b981]/30 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        Concluir
                      </button>
                      <button
                        onClick={() => handleEncerrar(solicitacao.id)}
                        disabled={ocupado}
                        className="px-4 py-2 bg-[#7c3aed]/20 text-[#7c3aed] rounded-lg hover:bg-[#7c3aed]/30 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        Encerrar
                      </button>
                    </div>
                  )}

                  {solicitacao.status === "PENDENTE" && (
                    <button
                      onClick={() => handleRemover(solicitacao.id)}
                      disabled={ocupado}
                      className="px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors text-xs font-medium disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!carregando && solicitacoesFiltradas.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/30">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            {solicitacoes.length === 0
              ? "Nenhuma solicitacao encontrada para este grupo"
              : "Nenhuma solicitacao corresponde aos filtros"}
          </p>
          {solicitacoes.length === 0 && (
            <button
              onClick={abrirModalCriar}
              className="mt-4 px-6 py-3 bg-[#ff8c42]/20 text-[#ff8c42] rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5 inline" />
              Criar primeira solicitacao
            </button>
          )}
        </div>
      )}

      {modalCriarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-8 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">Nova Solicitacao</h2>
              <button
                onClick={() => setModalCriarAberto(false)}
                className="p-2 rounded-xl hover:bg-destructive/20 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {erroForm && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-xl mb-4">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className={labelClass}>Titulo *</label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Verba para participacao em conferencia"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Descricao *</label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className={`${inputClass} min-h-[80px]`}
                  placeholder="Descreva detalhadamente a solicitacao"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Justificativa *</label>
                <textarea
                  value={formJustificativa}
                  onChange={(e) => setFormJustificativa(e.target.value)}
                  className={`${inputClass} min-h-[80px]`}
                  placeholder="Justifique a necessidade do recurso"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Projeto *</label>
                <select
                  value={String(formProjetoId)}
                  onChange={(e) => setFormProjetoId(e.target.value ? Number(e.target.value) : "")}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione um projeto</option>
                  {projetos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Tipo *</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  className={selectClass}
                  required
                >
                  {TIPOS_SOLICITACAO_CRIAVEIS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {TipoSolicitacaoLabels[tipo]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  className={inputClass}
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className={labelClass}>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={formQuantidade}
                  onChange={(e) => setFormQuantidade(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: 3"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCriarAberto(false)}
                  className="flex-1 py-3 bg-background rounded-xl border border-border/30 text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-3 bg-[#ff8c42] text-white rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {salvando ? "Salvando..." : "Criar Solicitacao"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {edicaoAberta && editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-8 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">Editar Solicitacao</h2>
              <button
                onClick={() => setEdicaoAberta(false)}
                className="p-2 rounded-xl hover:bg-destructive/20 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {erroEdicao && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-xl mb-4">
                {erroEdicao}
              </div>
            )}

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className={labelClass}>Justificativa *</label>
                <textarea
                  value={formEditJustificativa}
                  onChange={(e) => setFormEditJustificativa(e.target.value)}
                  className={`${inputClass} min-h-[100px]`}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formEditValor}
                  onChange={(e) => setFormEditValor(e.target.value)}
                  className={inputClass}
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className={labelClass}>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={formEditQuantidade}
                  onChange={(e) => setFormEditQuantidade(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: 3"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEdicaoAberta(false)}
                  className="flex-1 py-3 bg-background rounded-xl border border-border/30 text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="flex-1 py-3 bg-[#ff8c42] text-white rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {salvandoEdicao ? "Salvando..." : "Salvar Alteracoes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalheAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-8 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">Detalhes da Solicitacao</h2>
              <button
                onClick={() => setDetalheAberto(false)}
                className="p-2 rounded-xl hover:bg-destructive/20 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {carregandoDetalhe && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#ff8c42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            )}

            {!carregandoDetalhe && solicitacaoDetalhe && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full w-fit ${obterCorStatus(solicitacaoDetalhe.status)}`}>
                  {obterIconeStatus(solicitacaoDetalhe.status)}
                  <span className="text-sm font-medium">
                    {SolicitacaoStatusLabels[solicitacaoDetalhe.status] ?? solicitacaoDetalhe.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={labelClass}>Solicitante</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.usuarioNome ?? NA}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Projeto</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.projetoTitulo ?? NA}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Material</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.materialNome ?? NA}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Quantidade</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.quantidade ?? NA}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Valor</span>
                    <p className="text-sm text-[#ff8c42] font-semibold">{formatarValor(solicitacaoDetalhe.valor)}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Aprovada</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.isAprovada ? "Sim" : "Nao"}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Solicitado em</span>
                    <p className="text-sm text-foreground">{formatarData(solicitacaoDetalhe.dthSolicitacao)}</p>
                  </div>
                  <div>
                    <span className={labelClass}>Respondido em</span>
                    <p className="text-sm text-foreground">{formatarData(solicitacaoDetalhe.dthResposta)}</p>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3 border border-border/30">
                  <span className="text-xs text-muted-foreground block mb-1">Justificativa</span>
                  <p className="text-sm text-foreground">{solicitacaoDetalhe.justificativa}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}