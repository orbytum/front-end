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
} from "lucide-react";
import { AtividadeService } from "../services/atividades/AtividadeService";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { GrupoService } from "../services/grupos/GrupoService";
import {
  AtividadeResponse,
  AtividadeStatus,
  AtividadeStatusLabels,
  proximoStatusAtividade,
} from "../models/dto/atividades/Atividade";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";
import { ParticipanteProjetoResponse } from "../models/dto/projetos/ParticipanteProjeto";
import { NivelMembro, nivelEhCoordenadorOuAcima } from "../models/dto/NivelMembro";
import { HttpError } from "../utils/HttpError";

interface AtividadesBoardProps {
  projeto: ProjetoResponse | null;
  nivel: NivelMembro | null;
  isAdmin?: boolean;
  onProjetoAtualizado?: (projeto: ProjetoResponse) => void;
}

interface MembroGrupo {
  usuarioId: number;
  nome: string;
}

interface ColunaConfig {
  status: AtividadeStatus;
  label: string;
  icon: typeof Circle;
  badge: string;
  header: string;
}

const COLUNAS: ColunaConfig[] = [
  {
    status: "PENDENTE",
    label: "Pendente",
    icon: Circle,
    badge: "bg-muted text-muted-foreground border-border/40",
    header: "text-muted-foreground",
  },
  {
    status: "EM_ANDAMENTO",
    label: "Em Andamento",
    icon: Clock,
    badge: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    header: "text-[#f59e0b]",
  },
  {
    status: "AGUARDANDO_CONFIRMACAO",
    label: "Aguardando Confirmação",
    icon: Hourglass,
    badge: "bg-[#4a9eff]/15 text-[#4a9eff] border-[#4a9eff]/30",
    header: "text-[#4a9eff]",
  },
  {
    status: "CONCLUIDA",
    label: "Concluída",
    icon: CheckCircle2,
    badge: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
    header: "text-[#10b981]",
  },
  {
    status: "ENCERRADA",
    label: "Encerrada",
    icon: Archive,
    badge: "bg-[#7c3aed]/15 text-[#7c3aed] border-[#7c3aed]/30",
    header: "text-[#7c3aed]",
  },
];

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm disabled:opacity-50";

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

export function AtividadesBoard({ projeto, nivel, isAdmin = false, onProjetoAtualizado }: AtividadesBoardProps) {
  const atividadeService = useMemo(() => new AtividadeService(), []);
  const projetoService = useMemo(() => new ProjetoService(), []);
  const grupoService = useMemo(() => new GrupoService(), []);

  const [atividades, setAtividades] = useState<AtividadeResponse[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteProjetoResponse[]>([]);
  const [membrosGrupo, setMembrosGrupo] = useState<MembroGrupo[]>([]);
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

  const podeGerenciar = isAdmin || nivelEhCoordenadorOuAcima(nivel);
  const podeRegistrarImpedimento = !!nivel || isAdmin;

  const atividadesEmAndamento = useMemo(
    () => atividades.filter((a) => a.status?.toUpperCase() === "EM_ANDAMENTO"),
    [atividades]
  );

  const carregar = useCallback(async () => {
    if (!projeto?.id) {
      setAtividades([]);
      return;
    }

    setLoading(true);
    setError("");
    setActionError("");
    try {
      const [atividadesRes, participantesRes] = await Promise.all([
        atividadeService.listarPorProjeto(projeto.id),
        projetoService.listarParticipantes(projeto.id),
      ]);
      setAtividades(atividadesRes);
      setParticipantes(participantesRes);

      if (projeto.grupoId) {
        try {
          const membros = await grupoService.listarPesquisadores(projeto.grupoId, { size: 200 });
          setMembrosGrupo(
            (membros.items || [])
              .map((m) => ({ usuarioId: m.usuarioId ?? m.id ?? 0, nome: m.nome }))
              .filter((m) => m.usuarioId > 0)
          );
        } catch {
          setMembrosGrupo([]);
        }
      }
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.response?.mensagem || err.message);
      } else {
        setError("Não foi possível carregar as atividades do projeto.");
      }
    } finally {
      setLoading(false);
    }
  }, [projeto?.id, projeto?.grupoId, atividadeService, projetoService, grupoService]);

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

  const handleAvancarStatus = async (atividade: AtividadeResponse) => {
    const proximo = proximoStatusAtividade(atividade.status);
    if (!proximo) return;

    setActionError("");
    setAvancandoId(atividade.id);
    try {
      const atualizada = await atividadeService.atualizarStatus(atividade.id, proximo);
      setAtividades((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)));

      if (atualizada.projetoPodeSerFinalizado && podeGerenciar) {
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

  const handleRemover = async (atividade: AtividadeResponse) => {
    if (!window.confirm(`Deseja realmente excluir a atividade "${atividade.titulo}"?`)) return;

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
      <div className="bg-card rounded-2xl p-12 border border-border/30 text-center space-y-3">
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
  const abertas = atividades.filter(
    (a) => a.status !== "CONCLUIDA" && a.status !== "ENCERRADA"
  ).length;

  const responsaveis = editando?.atividadePaiId || modoImpedimento ? membrosGrupo : participantes;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-background border border-border/40 text-muted-foreground">
            Total: <strong className="text-foreground">{total}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-background border border-border/40 text-muted-foreground">
            Abertas: <strong className="text-[#f59e0b]">{abertas}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-background border border-border/40 text-muted-foreground">
            Atrasadas: <strong className="text-[#ef4444]">{atrasadas}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={carregar}
            disabled={loading}
            className="p-2.5 bg-card hover:bg-border/30 border border-border/40 rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Recarregar atividades"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {podeGerenciar && (
            <button
              type="button"
              onClick={() => abrirNovaAtividade(false)}
              className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Atividade</span>
            </button>
          )}
        </div>
      </div>

      {(actionError || error) && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {COLUNAS.map((coluna) => {
            const itens = atividades.filter((a) => a.status?.toUpperCase() === coluna.status);
            const Icone = coluna.icon;
            return (
              <div
                key={coluna.status}
                className="bg-background/60 rounded-2xl border border-border/30 flex flex-col min-h-[160px]"
              >
                <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/30">
                  <div className={`flex items-center gap-2 text-sm font-semibold ${coluna.header}`}>
                    <Icone className="w-4 h-4" />
                    <span>{coluna.label}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-card border border-border/40 text-muted-foreground">
                    {itens.length}
                  </span>
                </div>

                <div className="p-2.5 space-y-2.5 flex-1">
                  {itens.map((atividade) => {
                    const proximo = proximoStatusAtividade(atividade.status);
                    const exigeCoordenacao =
                      proximo === "CONCLUIDA" || proximo === "ENCERRADA";
                    const podeAvancar = !!proximo && (!exigeCoordenacao || podeGerenciar);
                    const pai = atividade.atividadePaiId
                      ? atividades.find((a) => a.id === atividade.atividadePaiId)
                      : null;

                    return (
                      <div
                        key={atividade.id}
                        className="bg-card rounded-xl border border-border/30 p-3 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-foreground text-sm font-semibold leading-snug">
                            {atividade.titulo}
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

                        <div className="flex items-center gap-1.5 pt-1 border-t border-border/20">
                          {podeAvancar && (
                            <button
                              type="button"
                              onClick={() => handleAvancarStatus(atividade)}
                              disabled={avancandoId === atividade.id}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20 text-[#ff8c42] text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
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

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border/40 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
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
                <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
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
                    <select
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
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Responsável <span className="text-[#ff8c42]">*</span>
                  </label>
                  <select
                    value={formResponsavelId}
                    onChange={(e) => setFormResponsavelId(e.target.value)}
                    disabled={salvando}
                    className={inputClass}
                  >
                    <option value="">Selecione o responsável</option>
                    {responsaveis.map((r) => (
                      <option key={r.usuarioId} value={r.usuarioId}>
                        {r.nome}
                      </option>
                    ))}
                  </select>
                  {modoImpedimento && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Impedimentos podem ser atribuídos a qualquer membro do grupo.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Prazo {!editando && <span className="text-[#ff8c42]">*</span>}
                  </label>
                  <input
                    type="datetime-local"
                    value={formPrazo}
                    onChange={(e) => setFormPrazo(e.target.value)}
                    disabled={salvando}
                    className={inputClass}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    disabled={salvando}
                    className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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

      {finalizarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-md border border-border/40 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center">
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
                  className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Agora não
                </button>
                <button
                  type="button"
                  onClick={handleFinalizarProjeto}
                  disabled={finalizando}
                  className="px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
