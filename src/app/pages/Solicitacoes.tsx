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
  Hourglass,
  Info,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { SolicitacaoService } from "../services/solicitacoes/SolicitacaoService";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { AuthService } from "../services/auth/AuthService";
import { nivelEhLider } from "../models/dto/NivelMembro";
import {
  SolicitacaoResponse,
  SolicitacaoStatusLabels,
  STATUS_SOLICITACAO_APROVADA,
  TIPOS_SOLICITACAO_CRIAVEIS,
  TipoSolicitacaoLabels,
  podeAvaliarSolicitacao,
  podemConcluirOuEncerrar,
} from "../models/dto/solicitacoes/Solicitacao";
import { HttpError } from "../utils/HttpError";
import { useConfirmacao } from "../contexts/ConfirmacaoContext";
import { Seletor } from "../components/Seletor";

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-lg border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm disabled:opacity-50";

const labelClass = "text-xs text-muted-foreground block mb-1.5";

const selectClass =
  "w-full py-2.5 px-4 bg-background rounded-lg border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm";

const NA = "\u2014";

function obterCorStatus(status: string) {
  switch (status) {
    case "CONCLUIDA": return "bg-[#10b981]/20 text-[#10b981]";
    case "REJEITADA": return "bg-[#ef4444]/20 text-[#ef4444]";
    case "EM_ANDAMENTO": return "bg-[#ff8c42]/20 text-[#ff8c42]";
    case "PENDENTE": return "bg-muted-foreground/20 text-muted-foreground";
    case "AGUARDANDO_ADMINISTRADOR": return "bg-[#4a9eff]/20 text-[#4a9eff]";
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
    case "AGUARDANDO_ADMINISTRADOR": return <Hourglass className="w-5 h-5 text-[#4a9eff]" />;
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
  if (valor == null) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarData(data: string | null | undefined): string {
  if (!data) return NA;
  return new Date(data).toLocaleDateString("pt-BR");
}

export function Solicitacoes() {
  const confirmar = useConfirmacao();
  const { grupoAtual } = useGrupo();
  const solicitacaoService = useMemo(() => new SolicitacaoService(), []);
  const projetoService = useMemo(() => new ProjetoService(), []);
  const isAdmin = useMemo(() => new AuthService().isAdminOrInitialAdmin(), []);
  const isLiderGrupo = !isAdmin && nivelEhLider(grupoAtual?.nivel);
  const usuarioId = grupoAtual?.usuarioId ?? null;

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoResponse[]>([]);
  const [projetos, setProjetos] = useState<{ id: number; titulo: string; liderProjetoId?: number | null }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoId, setAcaoId] = useState<number | null>(null);

  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [formTitulo, setFormTitulo] = useState("");
  const [formEditTitulo, setFormEditTitulo] = useState("");
  const [formEditDescricao, setFormEditDescricao] = useState("");
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
    if (isAdmin) {
      setCarregando(true);
      setErro("");
      try {
        setSolicitacoes(await solicitacaoService.listarTodas());
      } catch (err) {
        setSolicitacoes([]);
        setErro(err instanceof HttpError ? err.response?.mensagem || err.message : "Erro ao carregar solicitações.");
      } finally {
        setCarregando(false);
      }
      return;
    }
    if (!grupoAtual?.id) { setSolicitacoes([]); setCarregando(false); return; }
    setCarregando(true);
    setErro("");
    try {
      const [listaProjetos, lista] = await Promise.all([
        projetoService.listarProjetosPorGrupo(grupoAtual.id),
        solicitacaoService.listarPorGrupo(grupoAtual.id),
      ]);
      setProjetos(listaProjetos.map((p) => ({ id: p.id, titulo: p.titulo, liderProjetoId: p.liderProjetoId })));
      setSolicitacoes(lista);
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
  }, [isAdmin, grupoAtual?.id, solicitacaoService, projetoService]);

  // Solicita o líder do projeto (nos seus projetos) ou o Líder do grupo (em qualquer projeto do grupo).
  const projetosQuePodeSolicitar = isAdmin
    ? []
    : projetos.filter((p) => isLiderGrupo || (usuarioId != null && p.liderProjetoId === usuarioId));
  const podeCriar = projetosQuePodeSolicitar.length > 0;
  const perfil = { isAdmin, isLiderGrupo };
  const ehAutor = (s: SolicitacaoResponse) => usuarioId != null && s.usuarioId === usuarioId;
  const podeAlterar = (s: SolicitacaoResponse) =>
    (s.status === "PENDENTE" && (isLiderGrupo || ehAutor(s))) ||
    (s.status === "AGUARDANDO_ADMINISTRADOR" && isLiderGrupo);
  const podeConcluir = (s: SolicitacaoResponse) =>
    podemConcluirOuEncerrar(s.status) && (isAdmin || isLiderGrupo || ehAutor(s));
  const podeEncerrar = (s: SolicitacaoResponse) => podemConcluirOuEncerrar(s.status) && (isAdmin || isLiderGrupo);

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
      (s.projetoTitulo && s.projetoTitulo.toLowerCase().includes(termo)) ||
      (s.grupoNome && s.grupoNome.toLowerCase().includes(termo));

    const correspondeStatus = filtroStatus === "all" || s.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  // Mesma regra da tela de Recursos Financeiros: aprovadas pelo administrador
  const totalValorAprovado = solicitacoes
    .filter((s) => STATUS_SOLICITACAO_APROVADA.has(s.status))
    .reduce((soma, s) => soma + (s.valor ?? 0), 0);

  const estatisticas = {
    total: solicitacoes.length,
    pendentes: solicitacoes.filter((s) => s.status === "PENDENTE").length,
    aguardandoAdmin: solicitacoes.filter((s) => s.status === "AGUARDANDO_ADMINISTRADOR").length,
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
  const handleRejeitar = async (id: number) => {
    const confirmado = await confirmar({
      titulo: "Rejeitar solicitação",
      mensagem: "Tem certeza que deseja rejeitar esta solicitação?",
      textoConfirmar: "Rejeitar",
      perigo: true,
    });
    if (!confirmado) return;
    executarAcao(id, (i) => solicitacaoService.rejeitar(i));
  };
  const handleConcluir = (id: number) => executarAcao(id, (i) => solicitacaoService.concluir(i));
  const handleEncerrar = async (id: number) => {
    const confirmado = await confirmar({
      titulo: "Encerrar solicitação",
      mensagem: "Tem certeza que deseja encerrar esta solicitação?",
      textoConfirmar: "Encerrar",
    });
    if (!confirmado) return;
    executarAcao(id, (i) => solicitacaoService.encerrar(i));
  };

  const handleRemover = async (id: number) => {
    const confirmado = await confirmar({
      titulo: "Excluir solicitação",
      mensagem: "Tem certeza que deseja excluir esta solicitação?",
      textoConfirmar: "Excluir",
      perigo: true,
    });
    if (!confirmado) return;
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
    setFormEditTitulo(s.titulo ?? "");
    setFormEditDescricao(s.descricao ?? "");
    setFormEditJustificativa(s.justificativa ?? "");
    setFormEditValor(s.valor != null ? String(s.valor) : "");
    setFormEditQuantidade(s.quantidade != null ? String(s.quantidade) : "");
    setErroEdicao("");
    setEdicaoAberta(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    if (!formEditTitulo.trim() || !formEditDescricao.trim() || !formEditJustificativa.trim()) {
      setErroEdicao("Preencha título, descrição e justificativa.");
      return;
    }
    setSalvandoEdicao(true);
    setErroEdicao("");
    try {
      const atualizada = await solicitacaoService.atualizar(editando.id, {
        titulo: formEditTitulo.trim(),
        descricao: formEditDescricao.trim(),
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
    <div className="h-full overflow-auto p-5">
      <div className="flex items-start gap-2.5 bg-card rounded-lg px-3.5 py-2.5 border border-border/30 mb-4 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-[#4a9eff] shrink-0 mt-px" />
        <p>
          Solicitações devem ser aprovadas pelo líder do grupo antes de seres encaminhadas para a administração da instituição.
        </p>
      </div>

      {erro && (
        <div className="bg-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 border border-destructive/30 text-sm">
          <p className="font-medium">{erro}</p>
        </div>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {[
          { rotulo: "Total", valor: estatisticas.total, icone: <FileText className="w-4 h-4 text-[#4a9eff]" /> },
          { rotulo: "Aguardando líder", valor: estatisticas.pendentes, icone: <AlertCircle className="w-4 h-4 text-muted-foreground" /> },
          { rotulo: "Aguardando admin.", valor: estatisticas.aguardandoAdmin, icone: <Hourglass className="w-4 h-4 text-[#4a9eff]" /> },
          { rotulo: "Concluídas", valor: estatisticas.concluidas, icone: <CheckCircle className="w-4 h-4 text-[#10b981]" /> },
          { rotulo: "Valor aprovado", valor: formatarValor(totalValorAprovado), icone: <DollarSign className="w-4 h-4 text-[#10b981]" /> },
        ].map((indicador) => (
          <div key={indicador.rotulo} className="bg-card rounded-lg px-3.5 py-2.5 border border-border/30 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {indicador.icone}
              <span className="truncate">{indicador.rotulo}</span>
            </div>
            <div className="text-foreground text-lg font-bold mt-0.5 truncate">{indicador.valor}</div>
          </div>
        ))}
      </div>

      {/* Busca, filtro e ações */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar solicitações..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card rounded-lg border border-border/30 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        <Seletor
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2.5 bg-card rounded-lg border border-border/30 text-foreground text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="all">Todos os Status</option>
          <option value="PENDENTE">Aguardando líder do grupo</option>
          <option value="AGUARDANDO_ADMINISTRADOR">Aguardando administrador</option>
          <option value="EM_ANDAMENTO">Em Andamento</option>
          <option value="CONCLUIDA">Concluídas</option>
          <option value="REJEITADA">Rejeitadas</option>
          <option value="ENCERRADA">Encerradas</option>
        </Seletor>

        <div className="flex gap-3">
          <button
            onClick={() => carregarSolicitacoes()}
            className="p-2.5 bg-card rounded-lg border border-border/30 hover:bg-border/20 transition-colors cursor-pointer"
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${carregando ? "animate-spin" : ""}`} />
          </button>

          {podeCriar && (
            <button
              onClick={abrirModalCriar}
              className="flex-1 md:flex-none px-4 py-2.5 bg-primary text-primary-foreground rounded-lg transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Solicitação</span>
            </button>
          )}
        </div>
      </div>

      {carregando && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#ff8c42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Carregando solicitações...</p>
        </div>
      )}

      {!carregando && (
        <div className="space-y-2">
          {solicitacoesFiltradas.map((solicitacao) => {
            // Linha de metadados: só o que existe, separado por "·"
            const metadados = [
              solicitacao.usuarioNome && `Por ${solicitacao.usuarioNome}`,
              solicitacao.projetoTitulo,
              isAdmin && solicitacao.grupoNome,
              solicitacao.materialNome &&
                `${solicitacao.materialNome}${solicitacao.quantidade ? ` × ${solicitacao.quantidade}` : ""}`,
              !solicitacao.materialNome && solicitacao.quantidade && `Qtd. ${solicitacao.quantidade}`,
              `Solicitada em ${formatarData(solicitacao.dthSolicitacao)}`,
              solicitacao.aprovadorLiderNome &&
                `Aprovada por ${solicitacao.aprovadorLiderNome} em ${formatarData(solicitacao.dthAprovacaoLider)}`,
              solicitacao.dthResposta && `Respondida em ${formatarData(solicitacao.dthResposta)}`,
            ].filter(Boolean) as string[];

            return (
              <div
                key={solicitacao.id}
                role="button"
                tabIndex={0}
                onClick={() => abrirDetalhe(solicitacao.id)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    abrirDetalhe(solicitacao.id);
                  }
                }}
                title="Ver detalhes da solicitação"
                className="bg-card rounded-lg px-4 py-3 border border-border/30 hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary/60 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 [&>svg]:w-4 [&>svg]:h-4 ${obterCorTipo(solicitacao.isInterna)}`}
                    title={obterRotuloTipo(solicitacao.isInterna)}
                  >
                    {obterIconeTipo(solicitacao.isInterna)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-foreground text-sm font-semibold truncate" title={solicitacao.titulo}>
                        {solicitacao.titulo}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-medium ${obterCorTipo(solicitacao.isInterna)}`}
                      >
                        {obterRotuloTipo(solicitacao.isInterna)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate" title={metadados.join(" · ")}>
                      {metadados.join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 shrink-0">
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                      {formatarValor(solicitacao.valor)}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap [&>svg]:w-3.5 [&>svg]:h-3.5 ${obterCorStatus(solicitacao.status)}`}
                    >
                      {obterIconeStatus(solicitacao.status)}
                      {SolicitacaoStatusLabels[solicitacao.status] ?? solicitacao.status}
                    </span>
                  </div>
                </div>

                <div
                  className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 pl-11 border-t border-border/20 empty:hidden cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  {podeAvaliarSolicitacao(solicitacao.status, perfil) && (
                    <>
                      <button
                        onClick={() => handleAprovar(solicitacao.id)}
                        disabled={ocupado}
                        className="px-2.5 py-1.5 bg-[#10b981]/15 text-[#10b981] rounded-lg hover:bg-[#10b981]/25 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
                      >
                        {solicitacao.status === "PENDENTE" ? "Aprovar e encaminhar" : "Aprovar"}
                      </button>
                      <button
                        onClick={() => handleRejeitar(solicitacao.id)}
                        disabled={ocupado}
                        className="px-2.5 py-1.5 bg-[#ef4444]/15 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/25 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}

                  {podeConcluir(solicitacao) && (
                    <button
                      onClick={() => handleConcluir(solicitacao.id)}
                      disabled={ocupado}
                      className="px-2.5 py-1.5 bg-[#10b981]/15 text-[#10b981] rounded-lg hover:bg-[#10b981]/25 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Concluir
                    </button>
                  )}
                  {podeEncerrar(solicitacao) && (
                    <button
                      onClick={() => handleEncerrar(solicitacao.id)}
                      disabled={ocupado}
                      className="px-2.5 py-1.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded-lg hover:bg-[#7c3aed]/25 transition-colors text-xs font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Encerrar
                    </button>
                  )}

                  {podeAlterar(solicitacao) && (
                    <span className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => abrirEdicao(solicitacao)}
                        disabled={ocupado}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/15 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemover(solicitacao.id)}
                        disabled={ocupado}
                        className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/15 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!carregando && solicitacoesFiltradas.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border/30">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            {solicitacoes.length === 0
              ? "Nenhuma solicitacao encontrada para este grupo"
              : "Nenhuma solicitacao corresponde aos filtros"}
          </p>
          {solicitacoes.length === 0 && podeCriar && (
            <button
              onClick={abrirModalCriar}
              className="mt-4 px-6 py-3 bg-[#ff8c42]/20 text-[#ff8c42] rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 inline" />
              Criar primeira solicitacao
            </button>
          )}
        </div>
      )}

      {modalCriarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg p-8 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">Nova Solicitacao</h2>
              <button
                onClick={() => setModalCriarAberto(false)}
                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {erroForm && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-lg mb-4">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className={labelClass}>Titulo *</label>
                <input
                  type="text"
                  value={formTitulo}
                  maxLength={100}
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
                  maxLength={1000}
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
                <Seletor
                  value={String(formProjetoId)}
                  onChange={(e) => setFormProjetoId(e.target.value ? Number(e.target.value) : "")}
                  className={selectClass}
                  required
                >
                  <option value="">Selecione um projeto</option>
                  {projetosQuePodeSolicitar.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titulo}
                    </option>
                  ))}
                </Seletor>
              </div>

              <div>
                <label className={labelClass}>Tipo *</label>
                <Seletor
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
                </Seletor>
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
                  className="flex-1 py-3 bg-background rounded-lg border border-border/30 text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-3 bg-[#ff8c42] text-white rounded-lg disabled:opacity-50 transition-opacity"
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
          <div className="bg-card rounded-lg p-8 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">Editar Solicitacao</h2>
              <button
                onClick={() => setEdicaoAberta(false)}
                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {erroEdicao && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-lg mb-4">
                {erroEdicao}
              </div>
            )}

            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className={labelClass}>Título *</label>
                <input
                  type="text"
                  value={formEditTitulo}
                  maxLength={100}
                  onChange={(e) => setFormEditTitulo(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Descrição *</label>
                <textarea
                  value={formEditDescricao}
                  maxLength={1000}
                  onChange={(e) => setFormEditDescricao(e.target.value)}
                  className={`${inputClass} min-h-[80px]`}
                  rows={3}
                  required
                />
              </div>

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
                  className="flex-1 py-3 bg-background rounded-lg border border-border/30 text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="flex-1 py-3 bg-[#ff8c42] text-white rounded-lg disabled:opacity-50 transition-opacity"
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
          <div className="bg-card rounded-lg p-6 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">Detalhes da Solicitação</h2>
              <button
                onClick={() => setDetalheAberto(false)}
                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
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
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md w-fit ${obterCorStatus(solicitacaoDetalhe.status)}`}>
                  {obterIconeStatus(solicitacaoDetalhe.status)}
                  <span className="text-sm font-medium">
                    {SolicitacaoStatusLabels[solicitacaoDetalhe.status] ?? solicitacaoDetalhe.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={labelClass}>Aprovada pelo líder</span>
                    <p className="text-sm text-foreground">
                      {solicitacaoDetalhe.aprovadorLiderNome
                        ? `${solicitacaoDetalhe.aprovadorLiderNome} em ${formatarData(solicitacaoDetalhe.dthAprovacaoLider)}`
                        : NA}
                    </p>
                  </div>
                  <div>
                    <span className={labelClass}>Grupo</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.grupoNome ?? NA}</p>
                  </div>
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
                    <span className={labelClass}>Aprovada pelo administrador</span>
                    <p className="text-sm text-foreground">{solicitacaoDetalhe.isAprovada ? "Sim" : "Não"}</p>
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
                  <span className="text-xs text-muted-foreground block mb-1">Descrição</span>
                  <p className="text-sm text-foreground">{solicitacaoDetalhe.descricao}</p>
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