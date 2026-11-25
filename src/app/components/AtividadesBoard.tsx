import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ListTodo,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Circle,
  Hourglass,
  Archive,
  Flag,
  User,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  XCircle,
  Check,
  ThumbsDown,
  AlignLeft,
  FolderKanban,
  CalendarPlus,
  CalendarCheck,
} from "lucide-react";
import { AtividadeService } from "../services/atividades/AtividadeService";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { GrupoService } from "../services/grupos/GrupoService";
import { AuthService } from "../services/auth/AuthService";
import {
  AtividadeResponse,
  AtividadeStatus,
  AtividadeStatusLabels,
  atividadeEstaAberta,
  proximoStatusAtividade,
} from "../models/dto/atividades/Atividade";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";
import { ParticipanteProjetoResponse } from "../models/dto/projetos/ParticipanteProjeto";
import {
  NivelMembro,
  nivelEhLider,
  nivelPodeEscrever,
} from "../models/dto/NivelMembro";
import { HttpError } from "../utils/HttpError";
import { DateInput } from "./DateInput";
import { useConfirmacao } from "../contexts/ConfirmacaoContext";
import { Seletor } from "./Seletor";

interface AtividadesBoardProps {
  projeto: ProjetoResponse | null;
  nivel: NivelMembro | null;
  isAdmin?: boolean;
  onProjetoAtualizado?: (projeto: ProjetoResponse) => void;
  /** Chamado junto com o recarregamento das atividades (ex.: a página recarrega a lista de projetos). */
  onRecarregar?: () => void;
}

interface MembroGrupo {
  usuarioId: number;
  nome: string;
  email?: string;
  nivel?: NivelMembro | null;
}

interface ColunaConfig {
  status: AtividadeStatus;
  label: string;
  icon: typeof Circle;
  badge: string;
  header: string;
  border: string;
}

const COLUNAS: ColunaConfig[] = [
  {
    status: "AGUARDANDO_APROVACAO",
    label: "Aguardando Aprovação",
    icon: ShieldCheck,
    badge: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    header: "text-[#f59e0b]",
    border: "border-[#f59e0b]"
  },
  {
    status: "PENDENTE",
    label: "Pendente",
    icon: Circle,
    badge: "bg-muted text-muted-foreground border-border/40",
    header: "text-muted-foreground",
    border: "border-muted-foreground"
  },
  {
    status: "EM_ANDAMENTO",
    label: "Em Andamento",
    icon: Clock,
    badge: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    header: "text-[#f59e0b]",
    border: "border-[#f59e0b]"
  },
  {
    status: "AGUARDANDO_CONFIRMACAO",
    label: "Aguardando Confirmação",
    icon: Hourglass,
    badge: "bg-[#4a9eff]/15 text-[#4a9eff] border-[#4a9eff]/30",
    header: "text-[#4a9eff]",
    border: "border-[#4a9eff]"
  },
  {
    status: "CONCLUIDA",
    label: "Concluída",
    icon: CheckCircle2,
    badge: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
    header: "text-[#10b981]",
    border: "border-[#10b981]"
  },
  {
    status: "ENCERRADA",
    label: "Encerrada",
    icon: Archive,
    badge: "bg-[#7c3aed]/15 text-[#7c3aed] border-[#7c3aed]/30",
    header: "text-[#7c3aed]",
    border: "border-[#7c3aed]"
  },
  {
    status: "REJEITADA",
    label: "Rejeitada",
    icon: XCircle,
    badge: "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30",
    header: "text-[#ef4444]",
    border: "border-[#ef4444]"
  },
];

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-lg border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm disabled:opacity-50";

function paraInputDateTime(iso?: string | null): string {
  if (!iso) return "";
  return iso.length >= 16 ? iso.slice(0, 16) : iso;
}

function formatarData(iso?: string | null): string {
  if (!iso) return "Sem prazo";
  const data = new Date(iso);
  if (isNaN(data.getTime())) return iso;
  return data.toLocaleDateString("pt-BR");
}

/** No card o título é resumido; o completo aparece ao passar o mouse e no modal de detalhes. */
const LIMITE_TITULO_CARD = 40;

function resumirTitulo(titulo: string): string {
  return titulo.length > LIMITE_TITULO_CARD ? `${titulo.slice(0, LIMITE_TITULO_CARD).trimEnd()}...` : titulo;
}

function formatarDataHora(iso?: string | null): string | null {
  if (!iso) return null;
  const data = new Date(iso);
  if (isNaN(data.getTime())) return iso;
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function AtividadesBoard({ projeto, nivel, isAdmin = false, onProjetoAtualizado, onRecarregar }: AtividadesBoardProps) {
  const confirmar = useConfirmacao();
  const atividadeService = useMemo(() => new AtividadeService(), []);
  const projetoService = useMemo(() => new ProjetoService(), []);
  const grupoService = useMemo(() => new GrupoService(), []);
  const authService = useMemo(() => new AuthService(), []);

  const [atividades, setAtividades] = useState<AtividadeResponse[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteProjetoResponse[]>([]);
  const [membrosGrupo, setMembrosGrupo] = useState<MembroGrupo[]>([]);
  const [carregandoResponsaveis, setCarregandoResponsaveis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [avancandoId, setAvancandoId] = useState<number | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<AtividadeResponse | null>(null);
  const [modoImpedimento, setModoImpedimento] = useState(false);
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formPrazo, setFormPrazo] = useState("");
  const [formResponsavelId, setFormResponsavelId] = useState("");
  const [formAtividadePaiId, setFormAtividadePaiId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [formError, setFormError] = useState("");

  const [finalizarAberto, setFinalizarAberto] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const [atividadeParaRejeitar, setAtividadeParaRejeitar] = useState<AtividadeResponse | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [rejeitando, setRejeitando] = useState(false);
  // Modal de detalhes: guarda só o id, para refletir as atualizações da lista
  const [detalheId, setDetalheId] = useState<number | null>(null);
  const detalhe = detalheId != null ? atividades.find((a) => a.id === detalheId) ?? null : null;

  // Trocar de projeto fecha os detalhes
  useEffect(() => {
    setDetalheId(null);
  }, [projeto?.id]);

  // Esc fecha os detalhes, exceto quando há um modal de confirmação por cima (ele trata o próprio Esc)
  useEffect(() => {
    if (detalheId == null) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="alertdialog"]')) setDetalheId(null);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [detalheId]);

  const usuarioEmail = (authService.getUserEmail() || "").toLowerCase();
  const isLiderProjeto = !!projeto?.liderProjetoId && participantes.some(
    (p) => p.usuarioId === projeto.liderProjetoId
      && (p.email || "").toLowerCase() === usuarioEmail
  );
  const euNoProjeto = participantes.find(
    (p) => (p.email || "").toLowerCase() === usuarioEmail
  );
  const isColaboradorProjeto = euNoProjeto?.nivel === "COLABORADOR";

  const podeGerenciar = isAdmin || nivelEhLider(nivel) || isLiderProjeto;
  const podeFinalizarProjeto = isAdmin || nivelEhLider(nivel);
  const podeCriarAtividade = isAdmin
    || nivelEhLider(nivel)
    || (nivelPodeEscrever(nivel) && !isColaboradorProjeto && !!euNoProjeto);
  const podeMoverStatus = podeCriarAtividade;
  const podeRegistrarImpedimento = podeCriarAtividade;

  const permissoesDe = (atividade: AtividadeResponse) => {
    const proximo = proximoStatusAtividade(atividade.status);
    // o pesquisador conclui sozinho; só encerrar exige o líder do grupo ou do projeto
    const exigeCoordenacao = proximo === "ENCERRADA";
    const podeAvancar = !!proximo && podeMoverStatus && (!exigeCoordenacao || podeGerenciar);
    const emAprovacao = atividade.status?.toUpperCase() === "AGUARDANDO_APROVACAO";
    return { proximo, podeAvancar, emAprovacao };
  };

  const atividadesEmAndamento = useMemo(
    () => atividades.filter((a) => a.status?.toUpperCase() === "EM_ANDAMENTO"),
    [atividades]
  );

  const carregarParticipantes = useCallback(async () => {
    if (!projeto?.id) {
      setParticipantes([]);
      return;
    }

    setCarregandoResponsaveis(true);
    try {
      const lista = await projetoService.listarParticipantes(projeto.id);
      setParticipantes(lista);
    } catch {
      // Mantém a lista atual para não bloquear o preenchimento do formulário.
    } finally {
      setCarregandoResponsaveis(false);
    }
  }, [projeto?.id, projetoService]);

  // Membros do grupo só são visíveis ao administrador e ao Líder do grupo (REQ-094).
  const podeVerMembrosGrupo = isAdmin || nivelEhLider(nivel);

  const carregarMembrosGrupo = useCallback(async () => {
    if (!projeto?.grupoId || !podeVerMembrosGrupo) {
      setMembrosGrupo([]);
      return;
    }

    try {
      const membros = await grupoService.listarPesquisadores(projeto.grupoId, { size: 200 });
      setMembrosGrupo(
        (membros.items || [])
          .map((m) => ({
            usuarioId: m.usuarioId ?? m.id ?? 0,
            nome: m.nome,
            email: m.email,
            nivel: m.nivel,
          }))
          .filter((m) => m.usuarioId > 0)
      );
    } catch {
      setMembrosGrupo([]);
    }
  }, [projeto?.grupoId, podeVerMembrosGrupo, grupoService]);

  const carregar = useCallback(async () => {
    if (!projeto?.id) {
      setAtividades([]);
      return;
    }

    setLoading(true);
    setError("");
    setActionError("");
    try {
      const [atividadesRes] = await Promise.all([
        atividadeService.listarPorProjeto(projeto.id),
        carregarParticipantes(),
        carregarMembrosGrupo(),
      ]);
      setAtividades(atividadesRes);
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.response?.mensagem || err.message);
      } else {
        setError("Não foi possível carregar as atividades do projeto.");
      }
    } finally {
      setLoading(false);
    }
  }, [projeto?.id, atividadeService, carregarParticipantes, carregarMembrosGrupo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovaAtividade = (impedimento: boolean, paiId?: number) => {
    setEditando(null);
    setModoImpedimento(impedimento);
    setFormTitulo("");
    setFormDescricao("");
    setFormPrazo("");
    setFormResponsavelId("");
    setFormAtividadePaiId(paiId ? String(paiId) : "");
    setFormError("");
    setModalAberto(true);

    // Recarrega as listas para refletir participantes/membros alterados recentemente.
    void carregarParticipantes();
    void carregarMembrosGrupo();
  };

  const abrirEdicao = (atividade: AtividadeResponse) => {
    setEditando(atividade);
    setModoImpedimento(!!atividade.atividadePaiId);
    setFormTitulo(atividade.titulo);
    setFormDescricao(atividade.descricao || "");
    setFormPrazo(paraInputDateTime(atividade.dthPrazo));
    setFormResponsavelId(atividade.responsavelId ? String(atividade.responsavelId) : "");
    setFormAtividadePaiId(atividade.atividadePaiId ? String(atividade.atividadePaiId) : "");
    setFormError("");
    setModalAberto(true);

    // Recarrega as listas para refletir participantes/membros alterados recentemente.
    void carregarParticipantes();
    void carregarMembrosGrupo();
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projeto?.id) return;

    if (!formTitulo.trim() || !formDescricao.trim()) {
      setFormError("Preencha o título e a descrição da atividade.");
      return;
    }
    if (!editando && !formPrazo) {
      setFormError("Informe o prazo da atividade.");
      return;
    }
    if (!formResponsavelId) {
      setFormError("Selecione o responsável pela atividade.");
      return;
    }
    if (!editando && modoImpedimento && !formAtividadePaiId) {
      setFormError("Selecione a atividade que está sendo impedida.");
      return;
    }

    setSalvando(true);
    setFormError("");
    try {
      if (editando) {
        const atualizada = await atividadeService.atualizar(editando.id, {
          titulo: formTitulo.trim(),
          descricao: formDescricao.trim(),
          dthPrazo: formPrazo || undefined,
          responsavelId: Number(formResponsavelId),
        });
        setAtividades((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)));
      } else {
        const criada = await atividadeService.criar({
          projetoId: projeto.id,
          responsavelId: Number(formResponsavelId),
          atividadePaiId: modoImpedimento ? Number(formAtividadePaiId) : null,
          titulo: formTitulo.trim(),
          descricao: formDescricao.trim(),
          dthPrazo: formPrazo,
        });
        setAtividades((prev) => [...prev, criada]);
        // A API muda o projeto Planejado para Em Andamento ao receber uma atividade
        if (projeto.status?.toUpperCase() === "PLANEJADO") {
          projetoService
            .buscarProjetoPorId(projeto.id)
            .then((atualizado) => onProjetoAtualizado?.(atualizado))
            .catch(() => {});
        }
      }
      setModalAberto(false);
    } catch (err) {
      if (err instanceof HttpError) {
        setFormError(err.response?.mensagem || err.message);
      } else {
        setFormError("Erro ao salvar a atividade.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleAvancarStatus = async (atividade: AtividadeResponse, destino?: AtividadeStatus) => {
    const proximo = destino ?? proximoStatusAtividade(atividade.status);
    if (!proximo) return;

    setActionError("");
    setAvancandoId(atividade.id);
    try {
      const atualizada = await atividadeService.atualizarStatus(atividade.id, proximo);
      setAtividades((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)));

      if (atualizada.projetoPodeSerFinalizado && podeFinalizarProjeto) {
        setFinalizarAberto(true);
      }
    } catch (err) {
      if (err instanceof HttpError) {
        setActionError(err.response?.mensagem || err.message);
      } else {
        setActionError("Erro ao atualizar o status da atividade.");
      }
    } finally {
      setAvancandoId(null);
    }
  };

  const handleAprovar = async (atividade: AtividadeResponse) => {
    setActionError("");
    setAvancandoId(atividade.id);
    try {
      const atualizada = await atividadeService.aprovar(atividade.id);
      setAtividades((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)));
    } catch (err) {
      if (err instanceof HttpError) {
        setActionError(err.response?.mensagem || err.message);
      } else {
        setActionError("Erro ao aprovar a atividade.");
      }
    } finally {
      setAvancandoId(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!atividadeParaRejeitar) return;
    setRejeitando(true);
    setActionError("");
    try {
      const atualizada = await atividadeService.rejeitar(atividadeParaRejeitar.id, {
        motivo: motivoRejeicao.trim() || null,
      });
      setAtividades((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)));
      setAtividadeParaRejeitar(null);
      setMotivoRejeicao("");
    } catch (err) {
      if (err instanceof HttpError) {
        setActionError(err.response?.mensagem || err.message);
      } else {
        setActionError("Erro ao rejeitar a atividade.");
      }
    } finally {
      setRejeitando(false);
    }
  };

  const handleRemover = async (atividade: AtividadeResponse) => {
    const confirmado = await confirmar({
      titulo: "Excluir atividade",
      mensagem: `Deseja realmente excluir a atividade "${atividade.titulo}"?`,
      textoConfirmar: "Excluir",
      perigo: true,
    });
    if (!confirmado) return;

    setActionError("");
    try {
      await atividadeService.remover(atividade.id);
      setAtividades((prev) => prev.filter((a) => a.id !== atividade.id));
    } catch (err) {
      if (err instanceof HttpError) {
        setActionError(err.response?.mensagem || err.message);
      } else {
        setActionError("Erro ao excluir a atividade.");
      }
    }
  };

  const handleFinalizarProjeto = async () => {
    if (!projeto?.id) return;
    setFinalizando(true);
    setActionError("");
    try {
      const atualizado = await projetoService.finalizarProjeto(projeto.id);
      setFinalizarAberto(false);
      onProjetoAtualizado?.(atualizado);
    } catch (err) {
      if (err instanceof HttpError) {
        setActionError(err.response?.mensagem || err.message);
      } else {
        setActionError("Erro ao finalizar o projeto.");
      }
      setFinalizarAberto(false);
    } finally {
      setFinalizando(false);
    }
  };

  if (!projeto) {
    return (
      <div className="bg-card rounded-lg p-12 border border-border/30 text-center space-y-3">
        <ListTodo className="w-12 h-12 text-muted-foreground/40 mx-auto" />
        <h3 className="text-foreground font-semibold text-base">Nenhum projeto selecionado</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Selecione um projeto para visualizar e gerenciar suas atividades.
        </p>
      </div>
    );
  }

  const total = atividades.length;
  const atrasadas = atividades.filter((a) => a.isAtrasada).length;
  const abertas = atividades.filter((a) => atividadeEstaAberta(a.status)).length;

  // impedimentos podem ir para qualquer membro do grupo, mas só o líder do grupo enxerga essa lista
  const responsaveis =
    (editando?.atividadePaiId || modoImpedimento) && membrosGrupo.length > 0 ? membrosGrupo : participantes;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-background border border-border/40 text-muted-foreground">
            Total: <strong className="text-foreground">{total}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-background border border-border/40 text-muted-foreground">
            Abertas: <strong className="text-[#f59e0b]">{abertas}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-background border border-border/40 text-muted-foreground">
            Atrasadas: <strong className="text-[#ef4444]">{atrasadas}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              carregar();
              onRecarregar?.();
            }}
            disabled={loading}
            className="p-2.5 bg-card hover:bg-border/30 border border-border/40 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={onRecarregar ? "Recarregar projetos e atividades" : "Recarregar atividades"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {podeCriarAtividade && (
            <button
              type="button"
              onClick={() => abrirNovaAtividade(false)}
              className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Atividade</span>
            </button>
          )}
        </div>
      </div>

      {(actionError || error) && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg flex items-center justify-between text-sm text-[#ef4444]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError || error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActionError("");
              setError("");
            }}
            className="p-1 rounded-lg hover:bg-[#ef4444]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading && atividades.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-1">
          {COLUNAS.map((coluna) => {
            const itens = atividades.filter((a) => a.status?.toUpperCase() === coluna.status);
            const Icone = coluna.icon;
            return (
              <div
                key={coluna.status}
                className="bg-background/60 border-b-4 rounded-lg border border-border/30 flex flex-col min-h-[160px] max-h-[60vh]"
              >
                <div className="flex items-center justify-between px-2 py-3 border-b border-border/30">
                  <div className={`flex items-center gap-1 text-sm font-semibold ${coluna.header}`}>
                    <Icone className="w-4 h-4" />
                    <span className="text-xs">{coluna.label}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-card border border-border/40 text-muted-foreground">
                    {itens.length}
                  </span>
                </div>

                <div className="p-2.5 space-y-2.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
                  {itens.map((atividade) => {
                    const { proximo, podeAvancar, emAprovacao } = permissoesDe(atividade);
                    const pai = atividade.atividadePaiId
                      ? atividades.find((a) => a.id === atividade.atividadePaiId)
                      : null;

                    return (
                      <div
                        key={atividade.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setDetalheId(atividade.id)}
                        onKeyDown={(e) => {
                          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            setDetalheId(atividade.id);
                          }
                        }}
                        className="bg-card border-b-4 rounded-lg border  p-3 space-y-2.5 cursor-pointer hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary/60 transition-colors"
                        title="Ver detalhes da atividade"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="text-foreground text-sm font-semibold leading-snug break-words"
                            title={atividade.titulo.length > LIMITE_TITULO_CARD ? atividade.titulo : undefined}
                          >
                            {resumirTitulo(atividade.titulo)}
                          </h4>
                          {atividade.isAtrasada && (
                            <span
                              className="shrink-0 p-1 rounded-lg bg-[#ef4444]/15 text-[#ef4444]"
                              title="Atividade atrasada"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        {atividade.descricao && (
                          <p className="text-muted-foreground text-xs line-clamp-3">
                            {atividade.descricao}
                          </p>
                        )}

                        {pai && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#7c3aed]">
                            <GitBranch className="w-3 h-3" />
                            <span className="truncate">Impedimento de: {pai.titulo}</span>
                          </div>
                        )}

                        {atividade.status?.toUpperCase() === "REJEITADA" && atividade.motivoRejeicao && (
                          <div className="p-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/25 text-[11px] text-[#ef4444]">
                            Motivo: {atividade.motivoRejeicao}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {atividade.responsavelNome || "Sem responsável"}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              atividade.isAtrasada ? "text-[#ef4444] font-medium" : ""
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatarData(atividade.dthPrazo)}
                          </span>
                        </div>

                        <div className="pt-1 border-t border-border/20 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1.5 empty:hidden">
                          {emAprovacao && atividade.podeSerAprovada && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAprovar(atividade)}
                                disabled={avancandoId === atividade.id}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                title="Aprovar atividade"
                              >
                                {avancandoId === atividade.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Aprovar</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAtividadeParaRejeitar(atividade);
                                  setMotivoRejeicao("");
                                }}
                                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Rejeitar atividade"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {!emAprovacao && podeAvancar && (
                            <button
                              type="button"
                              onClick={() => handleAvancarStatus(atividade)}
                              disabled={avancandoId === atividade.id}
                              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              title={`Avançar para ${AtividadeStatusLabels[proximo!]}`}
                            >
                              {avancandoId === atividade.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                  <span>{AtividadeStatusLabels[proximo!]}</span>
                                </>
                              )}
                            </button>
                          )}

                          {podeMoverStatus && atividade.status?.toUpperCase() === "EM_ANDAMENTO" && (
                            <button
                              type="button"
                              onClick={() => handleAvancarStatus(atividade, "CONCLUIDA")}
                              disabled={avancandoId === atividade.id}
                              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              title="Concluir sem pedir confirmação"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Concluir</span>
                            </button>
                          )}
                          </div>

                          <div className="flex items-center justify-end gap-1.5 empty:hidden">
                          {podeRegistrarImpedimento &&
                            atividade.status?.toUpperCase() === "EM_ANDAMENTO" && (
                              <button
                                type="button"
                                onClick={() => abrirNovaAtividade(true, atividade.id)}
                                className="p-1.5 rounded-lg bg-background hover:bg-[#7c3aed]/15 text-[#7c3aed] transition-colors cursor-pointer"
                                title="Registrar impedimento"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            )}

                          {podeGerenciar && (
                            <>
                              <button
                                type="button"
                                onClick={() => abrirEdicao(atividade)}
                                className="p-1.5 rounded-lg bg-background hover:bg-[#ff8c42]/15 text-[#ff8c42] transition-colors cursor-pointer"
                                title="Editar atividade"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemover(atividade)}
                                className="p-1.5 rounded-lg bg-background hover:bg-[#ef4444]/15 text-[#ef4444] transition-colors cursor-pointer"
                                title="Excluir atividade"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {itens.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-muted-foreground/60">
                      Nenhuma atividade
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detalhe && !modalAberto && !atividadeParaRejeitar && !finalizarAberto && (() => {
        const coluna = COLUNAS.find((c) => c.status === detalhe.status?.toUpperCase());
        const IconeStatus = coluna?.icon ?? Circle;
        const { proximo, podeAvancar, emAprovacao } = permissoesDe(detalhe);
        const pai = detalhe.atividadePaiId ? atividades.find((a) => a.id === detalhe.atividadePaiId) : null;
        const impedimentos = atividades.filter((a) => a.atividadePaiId === detalhe.id);
        const ocupado = avancandoId === detalhe.id;
        const temAcoes =
          (emAprovacao && detalhe.podeSerAprovada) ||
          (!emAprovacao && podeAvancar) ||
          (podeMoverStatus && detalhe.status?.toUpperCase() === "EM_ANDAMENTO") ||
          podeGerenciar;

        return (
          <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setDetalheId(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="detalhe-atividade-titulo"
              className="bg-card rounded-lg w-full max-w-3xl border border-border/40 shadow-2xl my-auto"
            >
              <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-border/30">
                <div className="min-w-0 space-y-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${
                      coluna?.badge ?? "bg-muted text-muted-foreground border-border/40"
                    }`}
                  >
                    <IconeStatus className="w-3.5 h-3.5" />
                    {coluna?.label ?? detalhe.status}
                  </span>
                  <h3 id="detalhe-atividade-titulo" className="text-foreground text-xl font-semibold leading-snug break-words">
                    {detalhe.titulo}
                  </h3>
                  {projeto && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FolderKanban className="w-3.5 h-3.5" />
                      no projeto <span className="text-foreground font-medium">{projeto.titulo}</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDetalheId(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer shrink-0"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detalhe.isAtrasada && (
                <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/25 text-xs text-[#ef4444] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Esta atividade está atrasada: o prazo era {formatarData(detalhe.dthPrazo)}.
                </div>
              )}

              {actionError && (
                <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/25 text-xs text-[#ef4444] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {actionError}
                </div>
              )}

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6 min-w-0">
                  <section>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <AlignLeft className="w-4 h-4 text-muted-foreground" />
                      Descrição
                    </h4>
                    {detalhe.descricao ? (
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed bg-background/60 border border-border/30 rounded-lg p-3">
                        {detalhe.descricao}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Sem descrição.</p>
                    )}
                  </section>

                  {detalhe.status?.toUpperCase() === "REJEITADA" && detalhe.motivoRejeicao && (
                    <section>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-[#ef4444] mb-2">
                        <XCircle className="w-4 h-4" />
                        Motivo da rejeição
                      </h4>
                      <p className="text-sm text-[#ef4444] whitespace-pre-wrap break-words bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-lg p-3">
                        {detalhe.motivoRejeicao}
                      </p>
                    </section>
                  )}

                  {pai && (
                    <section>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                        <GitBranch className="w-4 h-4 text-[#7c3aed]" />
                        Impedimento de
                      </h4>
                      <button
                        type="button"
                        onClick={() => setDetalheId(pai.id)}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-sm text-foreground hover:border-[#7c3aed]/50 transition-colors cursor-pointer"
                      >
                        {pai.titulo}
                      </button>
                    </section>
                  )}

                  <section>
                    <h4 className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground mb-2">
                      <span className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-[#7c3aed]" />
                        Impedimentos
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-background border border-border/40 text-muted-foreground">
                          {impedimentos.length}
                        </span>
                      </span>
                    </h4>
                    {impedimentos.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Nenhum impedimento registrado.</p>
                    ) : (
                      <ul className="space-y-2">
                        {impedimentos.map((imp) => {
                          const colunaImp = COLUNAS.find((c) => c.status === imp.status?.toUpperCase());
                          return (
                            <li key={imp.id}>
                              <button
                                type="button"
                                onClick={() => setDetalheId(imp.id)}
                                className="w-full text-left px-3 py-2.5 rounded-lg bg-background/60 border border-border/30 hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm text-foreground truncate">{imp.titulo}</span>
                                  <span className="block text-[11px] text-muted-foreground truncate">
                                    {imp.responsavelNome || "Sem responsável"} · {formatarData(imp.dthPrazo)}
                                  </span>
                                </span>
                                <span
                                  className={`shrink-0 px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                                    colunaImp?.badge ?? "bg-muted text-muted-foreground border-border/40"
                                  }`}
                                >
                                  {colunaImp?.label ?? imp.status}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                </div>

                <aside className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Responsável</p>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                          {(detalhe.responsavelNome || "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm text-foreground truncate">
                          {detalhe.responsavelNome || "Sem responsável"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Prazo de entrega</p>
                      <p
                        className={`flex items-center gap-2 text-sm ${
                          detalhe.isAtrasada ? "text-[#ef4444] font-medium" : "text-foreground"
                        }`}
                      >
                        <Calendar className="w-4 h-4 shrink-0" />
                        {formatarDataHora(detalhe.dthPrazo) ?? "Sem prazo"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Criada em</p>
                      <p className="flex items-center gap-2 text-sm text-foreground">
                        <CalendarPlus className="w-4 h-4 shrink-0 text-muted-foreground" />
                        {formatarDataHora(detalhe.dthRegistro) ?? "—"}
                      </p>
                    </div>
                    {detalhe.dthConclusao && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Concluída em</p>
                        <p className="flex items-center gap-2 text-sm text-[#10b981]">
                          <CalendarCheck className="w-4 h-4 shrink-0" />
                          {formatarDataHora(detalhe.dthConclusao)}
                        </p>
                      </div>
                    )}
                  </div>

                  {temAcoes && (
                    <div className="pt-4 border-t border-border/30 space-y-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ações</p>

                      {emAprovacao && detalhe.podeSerAprovada && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAprovar(detalhe)}
                            disabled={ocupado}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAtividadeParaRejeitar(detalhe);
                              setMotivoRejeicao("");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] text-sm font-medium transition-colors cursor-pointer"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </>
                      )}

                      {!emAprovacao && podeAvancar && (
                        <button
                          type="button"
                          onClick={() => handleAvancarStatus(detalhe)}
                          disabled={ocupado}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                          {AtividadeStatusLabels[proximo!]}
                        </button>
                      )}

                      {podeMoverStatus && detalhe.status?.toUpperCase() === "EM_ANDAMENTO" && (
                        <button
                          type="button"
                          onClick={() => handleAvancarStatus(detalhe, "CONCLUIDA")}
                          disabled={ocupado}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Concluir
                        </button>
                      )}

                      {podeRegistrarImpedimento && detalhe.status?.toUpperCase() === "EM_ANDAMENTO" && (
                        <button
                          type="button"
                          onClick={() => abrirNovaAtividade(true, detalhe.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-[#7c3aed]/10 border border-border/40 text-[#7c3aed] text-sm font-medium transition-colors cursor-pointer"
                        >
                          <Flag className="w-4 h-4" />
                          Registrar impedimento
                        </button>
                      )}

                      {podeGerenciar && (
                        <>
                          <button
                            type="button"
                            onClick={() => abrirEdicao(detalhe)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-border/20 border border-border/40 text-foreground text-sm font-medium transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemover(detalhe)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-[#ef4444]/10 border border-border/40 text-[#ef4444] text-sm font-medium transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>
        );
      })()}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-lg w-full max-w-lg border border-border/40 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ff8c42] flex items-center justify-center">
                  {modoImpedimento ? (
                    <Flag className="w-5 h-5 text-white" />
                  ) : (
                    <ListTodo className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">
                    {editando
                      ? "Editar Atividade"
                      : modoImpedimento
                        ? "Registrar Impedimento"
                        : "Nova Atividade"}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {modoImpedimento
                      ? "Descreva o impedimento de uma atividade em andamento"
                      : "Defina os dados da atividade do projeto"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSalvar} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Título <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitulo}
                    maxLength={100}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    disabled={salvando}
                    className={inputClass}
                    placeholder="Ex: Coletar amostras"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Descrição <span className="text-[#ff8c42]">*</span>
                  </label>
                  <textarea
                    value={formDescricao}
                    maxLength={1000}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    disabled={salvando}
                    rows={3}
                    className={inputClass}
                    placeholder="Descreva o que deve ser feito"
                  />
                </div>

                {!editando && modoImpedimento && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">
                      Atividade impedida <span className="text-[#ff8c42]">*</span>
                    </label>
                    <Seletor
                      value={formAtividadePaiId}
                      onChange={(e) => setFormAtividadePaiId(e.target.value)}
                      disabled={salvando}
                      className={inputClass}
                    >
                      <option value="">Selecione a atividade</option>
                      {atividadesEmAndamento.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.titulo}
                        </option>
                      ))}
                    </Seletor>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Responsável <span className="text-[#ff8c42]">*</span>
                  </label>
                  <Seletor
                    value={formResponsavelId}
                    onChange={(e) => setFormResponsavelId(e.target.value)}
                    disabled={salvando || carregandoResponsaveis}
                    className={inputClass}
                  >
                    <option value="">
                      {carregandoResponsaveis ? "Carregando responsáveis..." : "Selecione o responsável"}
                    </option>
                    {responsaveis.map((r) => (
                      <option key={r.usuarioId} value={r.usuarioId}>
                        {r.nome}
                      </option>
                    ))}
                  </Seletor>
                  {modoImpedimento ? (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Impedimentos podem ser atribuídos a qualquer membro do grupo.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Apenas participantes do projeto podem ser responsáveis. Adicione o membro em
                      "Gerenciar participantes" do projeto.
                    </p>
                  )}
                  {!modoImpedimento && !carregandoResponsaveis && responsaveis.length === 0 && (
                    <p className="text-[11px] text-[#f59e0b] mt-1">
                      Este projeto ainda não possui participantes. Adicione um participante para
                      poder atribuir a atividade.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Prazo {!editando && <span className="text-[#ff8c42]">*</span>}
                  </label>
                  <DateInput
                    type="datetime-local"
                    value={formPrazo}
                    onChange={setFormPrazo}
                    disabled={salvando}
                    className={inputClass}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    disabled={salvando}
                    className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>{editando ? "Salvar Alterações" : "Criar Atividade"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {atividadeParaRejeitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-lg w-full max-w-md border border-border/40 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ef4444] flex items-center justify-center">
                <ThumbsDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold text-lg">Rejeitar atividade</h3>
                <p className="text-muted-foreground text-xs">{atividadeParaRejeitar.titulo}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">
                  Motivo da rejeição
                </label>
                <textarea
                  rows={3}
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  disabled={rejeitando}
                  maxLength={255}
                  placeholder="Descreva o que precisa ser ajustado (opcional)"
                  className={inputClass}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAtividadeParaRejeitar(null);
                    setMotivoRejeicao("");
                  }}
                  disabled={rejeitando}
                  className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarRejeicao}
                  disabled={rejeitando}
                  className="px-5 py-2.5 bg-[#ef4444] text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {rejeitando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                  <span>Confirmar rejeição</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {finalizarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-lg w-full max-w-md border border-border/40 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold text-lg">Finalizar projeto</h3>
                <p className="text-muted-foreground text-xs">
                  Não há mais atividades abertas neste projeto
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Deseja finalizar o projeto <strong className="text-foreground">{projeto.titulo}</strong>?
                Esta ação marcará o projeto como concluído.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFinalizarAberto(false)}
                  disabled={finalizando}
                  className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Agora não
                </button>
                <button
                  type="button"
                  onClick={handleFinalizarProjeto}
                  disabled={finalizando}
                  className="px-5 py-2.5 bg-[#10b981] text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {finalizando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Finalizar projeto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
