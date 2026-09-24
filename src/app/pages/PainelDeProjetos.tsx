import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FolderKanban,
  BookOpen,
  LayoutDashboard,
  Loader2,
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Star,
  Users,
  X,
  UserPlus,
  Crown,
  RefreshCw,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { GrupoService } from "../services/grupos/GrupoService";
import { AuthService } from "../services/auth/AuthService";
import {
  ProjetoResponse,
  ProjetoStatusLabels,
  ProjetoStatus,
  PROJETO_STATUS,
  projetoEstaAberto,
} from "../models/dto/projetos/Projeto";
import { ParticipanteProjetoResponse } from "../models/dto/projetos/ParticipanteProjeto";
import {
  NivelMembro,
  NivelMembroLabels,
  nivelEhCoordenadorOuAcima,
} from "../models/dto/NivelMembro";
import { Publicacoes } from "./Publicacoes";
import { ProjetoCombobox } from "../components/ProjetoCombobox";
import { AtividadesBoard } from "../components/AtividadesBoard";
import { HttpError } from "../utils/HttpError";

type TabId = "publicacoes" | "visao-geral" | "atividades";

interface MembroGrupo {
  usuarioId: number;
  nome: string;
}

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm disabled:opacity-50";

export function PainelDeProjetos() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const projetoService = useMemo(() => new ProjetoService(), []);
  const grupoService = useMemo(() => new GrupoService(), []);
  const authService = useMemo(() => new AuthService(), []);

  const [projetos, setProjetos] = useState<ProjetoResponse[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoResponse | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<TabId>("visao-geral");
  const [acaoError, setAcaoError] = useState("");

  const [membrosGrupo, setMembrosGrupo] = useState<MembroGrupo[]>([]);

  const [projetoModalAberto, setProjetoModalAberto] = useState(false);
  const [editandoProjeto, setEditandoProjeto] = useState<ProjetoResponse | null>(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formAssunto, setFormAssunto] = useState("");
  const [formStatus, setFormStatus] = useState<string>("PLANEJADO");
  const [formIsAtivo, setFormIsAtivo] = useState(true);
  const [salvandoProjeto, setSalvandoProjeto] = useState(false);
  const [erroProjeto, setErroProjeto] = useState("");

  const [participantesModalAberto, setParticipantesModalAberto] = useState(false);
  const [participantes, setParticipantes] = useState<ParticipanteProjetoResponse[]>([]);
  const [carregandoParticipantes, setCarregandoParticipantes] = useState(false);
  const [novoParticipanteId, setNovoParticipanteId] = useState("");
  const [novoNivel, setNovoNivel] = useState<NivelMembro>("PESQUISADOR");
  const [adicionandoParticipante, setAdicionandoParticipante] = useState(false);
  const [erroParticipantes, setErroParticipantes] = useState("");

  const isAdmin = authService.isAdminOrInitialAdmin();
  const podeGerenciar = isAdmin || nivelEhCoordenadorOuAcima(grupoAtual?.nivel);

  const carregarProjetos = useCallback(async () => {
    if (!grupoAtual?.id) {
      setProjetos([]);
      setProjetoSelecionado(null);
      return;
    }

    setCarregandoProjetos(true);
    try {
      const listaProjetos = await projetoService.listarProjetosPorGrupo(grupoAtual.id);
      setProjetos(listaProjetos);

      if (listaProjetos && listaProjetos.length > 0) {
        setProjetoSelecionado((prev) => {
          if (prev) {
            const encontrado = listaProjetos.find((p) => p.id === prev.id);
            if (encontrado) return encontrado;
          }
          return listaProjetos[0];
        });
      } else {
        setProjetoSelecionado(null);
      }
    } catch {
      setProjetos([]);
      setProjetoSelecionado(null);
    } finally {
      setCarregandoProjetos(false);
    }
  }, [grupoAtual?.id, projetoService]);

  const carregarMembrosGrupo = useCallback(async () => {
    if (!grupoAtual?.id) {
      setMembrosGrupo([]);
      return;
    }
    try {
      const resposta = await grupoService.listarPesquisadores(grupoAtual.id, { size: 200 });
      setMembrosGrupo(
        (resposta.items || [])
          .map((m) => ({ usuarioId: m.usuarioId ?? m.id ?? 0, nome: m.nome }))
          .filter((m) => m.usuarioId > 0)
      );
    } catch {
      setMembrosGrupo([]);
    }
  }, [grupoAtual?.id, grupoService]);

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  useEffect(() => {
    carregarMembrosGrupo();
  }, [carregarMembrosGrupo]);

  const obterIconeStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONCLUIDO":
        return <CheckCircle2 className="w-4 h-4 text-[#10b981]" />;
      case "EM_ANDAMENTO":
        return <Clock className="w-4 h-4 text-[#f59e0b]" />;
      case "CANCELADO":
        return <AlertCircle className="w-4 h-4 text-[#ef4444]" />;
      case "ENCERRADO":
        return <AlertCircle className="w-4 h-4 text-[#7c3aed]" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const obterCorStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONCLUIDO":
        return "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30";
      case "EM_ANDAMENTO":
        return "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30";
      case "CANCELADO":
        return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30";
      case "ENCERRADO":
        return "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/30";
      default:
        return "bg-muted text-muted-foreground border-border/40";
    }
  };

  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return "N/A";
    const data = new Date(dataIso);
    if (isNaN(data.getTime())) return dataIso;
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const abrirNovoProjeto = () => {
    setEditandoProjeto(null);
    setFormTitulo("");
    setFormAssunto("");
    setFormStatus("PLANEJADO");
    setFormIsAtivo(true);
    setErroProjeto("");
    setProjetoModalAberto(true);
  };

  const abrirEdicaoProjeto = (projeto: ProjetoResponse) => {
    setEditandoProjeto(projeto);
    setFormTitulo(projeto.titulo);
    setFormAssunto(projeto.assunto || "");
    setFormStatus(projeto.status || "PLANEJADO");
    setFormIsAtivo(projeto.isAtivo ?? true);
    setErroProjeto("");
    setProjetoModalAberto(true);
  };

  const handleSalvarProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoAtual?.id) return;

    if (!formTitulo.trim() || !formAssunto.trim()) {
      setErroProjeto("Preencha o título e o assunto do projeto.");
      return;
    }

    setSalvandoProjeto(true);
    setErroProjeto("");
    try {
      if (editandoProjeto) {
        const atualizado = await projetoService.atualizarProjeto(editandoProjeto.id, {
          status: formStatus,
          titulo: formTitulo.trim(),
          assunto: formAssunto.trim(),
          isAtivo: formIsAtivo,
        });
        setProjetos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
        setProjetoSelecionado((prev) => (prev?.id === atualizado.id ? atualizado : prev));
      } else {
        const criado = await projetoService.criarProjeto({
          grupoId: grupoAtual.id,
          status: formStatus,
          titulo: formTitulo.trim(),
          assunto: formAssunto.trim(),
        });
        setProjetos((prev) => [...prev, criado]);
        setProjetoSelecionado(criado);
      }
      setProjetoModalAberto(false);
    } catch (err) {
      if (err instanceof HttpError) {
        setErroProjeto(err.response?.mensagem || err.message);
      } else {
        setErroProjeto("Erro ao salvar o projeto.");
      }
    } finally {
      setSalvandoProjeto(false);
    }
  };

  const handleAlternarFavorito = async (projeto: ProjetoResponse) => {
    setAcaoError("");
    try {
      const atualizado = await projetoService.alternarFavorito(projeto.id);
      setProjetos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
      setProjetoSelecionado((prev) => (prev?.id === atualizado.id ? atualizado : prev));
    } catch (err) {
      if (err instanceof HttpError) {
        setAcaoError(err.response?.mensagem || err.message);
      } else {
        setAcaoError("Erro ao favoritar o projeto.");
      }
    }
  };

  const handleFinalizarProjeto = async (projeto: ProjetoResponse) => {
    if (
      !window.confirm(
        `Deseja finalizar o projeto "${projeto.titulo}"? Ele será marcado como concluído.`
      )
    ) {
      return;
    }
    setAcaoError("");
    try {
      const atualizado = await projetoService.finalizarProjeto(projeto.id);
      setProjetos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
      setProjetoSelecionado((prev) => (prev?.id === atualizado.id ? atualizado : prev));
    } catch (err) {
      if (err instanceof HttpError) {
        setAcaoError(err.response?.mensagem || err.message);
      } else {
        setAcaoError("Erro ao finalizar o projeto.");
      }
    }
  };

  const handleRemoverProjeto = async (projeto: ProjetoResponse) => {
    if (!window.confirm(`Deseja realmente excluir o projeto "${projeto.titulo}"?`)) return;
    setAcaoError("");
    try {
      await projetoService.removerProjeto(projeto.id);
      const restantes = projetos.filter((p) => p.id !== projeto.id);
      setProjetos(restantes);
      setProjetoSelecionado((atual) => (atual?.id === projeto.id ? restantes[0] || null : atual));
    } catch (err) {
      if (err instanceof HttpError) {
        setAcaoError(err.response?.mensagem || err.message);
      } else {
        setAcaoError("Erro ao excluir o projeto.");
      }
    }
  };

  const abrirParticipantes = async (projeto: ProjetoResponse) => {
    setParticipantesModalAberto(true);
    setErroParticipantes("");
    setNovoParticipanteId("");
    setNovoNivel("PESQUISADOR");
    setCarregandoParticipantes(true);
    try {
      const lista = await projetoService.listarParticipantes(projeto.id);
      setParticipantes(lista);
    } catch (err) {
      if (err instanceof HttpError) {
        setErroParticipantes(err.response?.mensagem || err.message);
      } else {
        setErroParticipantes("Erro ao carregar os participantes do projeto.");
      }
    } finally {
      setCarregandoParticipantes(false);
    }
  };

  const handleAdicionarParticipante = async () => {
    if (!projetoSelecionado || !novoParticipanteId) {
      setErroParticipantes("Selecione um membro para adicionar.");
      return;
    }
    setAdicionandoParticipante(true);
    setErroParticipantes("");
    try {
      const adicionado = await projetoService.adicionarParticipante(projetoSelecionado.id, {
        usuarioId: Number(novoParticipanteId),
        nivel: novoNivel,
      });
      setParticipantes((prev) => [...prev.filter((p) => p.usuarioId !== adicionado.usuarioId), adicionado]);
      setNovoParticipanteId("");
    } catch (err) {
      if (err instanceof HttpError) {
        setErroParticipantes(err.response?.mensagem || err.message);
      } else {
        setErroParticipantes("Erro ao adicionar o participante.");
      }
    } finally {
      setAdicionandoParticipante(false);
    }
  };

  const handleRemoverParticipante = async (participante: ParticipanteProjetoResponse) => {
    if (!projetoSelecionado) return;
    if (!window.confirm(`Remover "${participante.nome}" deste projeto?`)) return;
    setErroParticipantes("");
    try {
      await projetoService.removerParticipante(projetoSelecionado.id, participante.usuarioId);
      setParticipantes((prev) => prev.filter((p) => p.usuarioId !== participante.usuarioId));
    } catch (err) {
      if (err instanceof HttpError) {
        setErroParticipantes(err.response?.mensagem || err.message);
      } else {
        setErroParticipantes("Erro ao remover o participante.");
      }
    }
  };

  const membrosDisponiveis = membrosGrupo.filter(
    (m) => !participantes.some((p) => p.usuarioId === m.usuarioId)
  );

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Cabeçalho do Painel & Seletor de Projeto */}
      <div className="bg-card rounded-2xl p-6 border border-border/30 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="mb-1">
              <ProjetoCombobox
                projetos={projetos}
                projetoSelecionado={projetoSelecionado}
                onSelecionarProjeto={setProjetoSelecionado}
                carregando={carregandoProjetos || carregandoGrupos}
              />
            </div>
            <p className="text-muted-foreground text-sm mt-2 ml-1">
              {grupoAtual
                ? `Grupo de Pesquisa: ${grupoAtual.nome} ${grupoAtual.isLider ? "(Líder)" : ""}`
                : "Selecione um grupo no cabeçalho"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={carregarProjetos}
              disabled={carregandoProjetos}
              className="p-2.5 bg-background hover:bg-border/30 border border-border/40 rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Recarregar projetos"
            >
              <RefreshCw className={`w-4 h-4 ${carregandoProjetos ? "animate-spin" : ""}`} />
            </button>
            {podeGerenciar && (
              <button
                type="button"
                onClick={abrirNovoProjeto}
                className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Projeto</span>
              </button>
            )}
          </div>
        </div>

        {/* Detalhes rápidos do Projeto Selecionado */}
        {projetoSelecionado && (
          <div className="pt-4 border-t border-border/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold ${obterCorStatusBadge(
                  projetoSelecionado.status
                )}`}
              >
                {obterIconeStatus(projetoSelecionado.status)}
                {ProjetoStatusLabels[projetoSelecionado.status as ProjetoStatus] ||
                  projetoSelecionado.status}
              </span>
              {projetoSelecionado.isInicial && (
                <span className="px-2.5 py-1 rounded-full bg-[#4a9eff]/10 text-[#4a9eff] border border-[#4a9eff]/30 font-medium">
                  Projeto Inicial
                </span>
              )}
              {projetoSelecionado.assunto && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <strong>Assunto:</strong> {projetoSelecionado.assunto}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                Criado em: {formatarData(projetoSelecionado.dthRegistro)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAlternarFavorito(projetoSelecionado)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  projetoSelecionado.isFavorito
                    ? "bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]"
                    : "bg-background border-border/40 text-muted-foreground hover:text-[#f59e0b]"
                }`}
                title={projetoSelecionado.isFavorito ? "Remover dos favoritos" : "Favoritar projeto"}
              >
                <Star
                  className="w-4 h-4"
                  fill={projetoSelecionado.isFavorito ? "currentColor" : "none"}
                />
              </button>

              {podeGerenciar && (
                <>
                  <button
                    type="button"
                    onClick={() => abrirParticipantes(projetoSelecionado)}
                    className="p-2 rounded-lg bg-background hover:bg-[#4a9eff]/15 border border-border/40 text-[#4a9eff] transition-colors cursor-pointer"
                    title="Gerenciar participantes"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirEdicaoProjeto(projetoSelecionado)}
                    className="p-2 rounded-lg bg-background hover:bg-[#ff8c42]/15 border border-border/40 text-[#ff8c42] transition-colors cursor-pointer"
                    title="Editar projeto"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {projetoEstaAberto(projetoSelecionado.status) && (
                    <button
                      type="button"
                      onClick={() => handleFinalizarProjeto(projetoSelecionado)}
                      className="px-3 py-2 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Finalizar projeto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Finalizar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoverProjeto(projetoSelecionado)}
                    className="p-2 rounded-lg bg-background hover:bg-[#ef4444]/15 border border-border/40 text-[#ef4444] transition-colors cursor-pointer"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {acaoError && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{acaoError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAcaoError("")}
            className="p-1 rounded-lg hover:bg-[#ef4444]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Se houver projeto selecionado, exibe Abas e Conteúdo */}
      {projetoSelecionado ? (
        <div className="space-y-6">
          {/* Navegação por Abas */}
          <div className="flex border-b border-border/30 gap-1 overflow-x-auto">
            <button
              onClick={() => setAbaAtiva("visao-geral")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === "visao-geral"
                  ? "border-[#ff8c42] text-[#ff8c42]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/40"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setAbaAtiva("atividades")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === "atividades"
                  ? "border-[#ff8c42] text-[#ff8c42]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/40"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Atividades</span>
            </button>

            <button
              onClick={() => setAbaAtiva("publicacoes")}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                abaAtiva === "publicacoes"
                  ? "border-[#ff8c42] text-[#ff8c42]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/40"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Publicações</span>
            </button>
          </div>

          {/* Conteúdo da Aba Selecionada */}
          <div>
            {abaAtiva === "publicacoes" && (
              <Publicacoes
                projetoId={projetoSelecionado.id}
                projetoTitulo={projetoSelecionado.titulo}
                ocultarCabecalho={true}
              />
            )}

            {abaAtiva === "visao-geral" && (
              <div className="bg-card rounded-2xl p-6 border border-border/30 space-y-4">
                <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                  <Info className="w-5 h-5 text-[#ff8c42]" />
                  <span>Informações do Projeto</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-background rounded-xl p-4 border border-border/30">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Título do Projeto
                    </span>
                    <span className="text-foreground font-semibold">
                      {projetoSelecionado.titulo}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/30">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Status do Projeto
                    </span>
                    <span className="text-foreground font-semibold">
                      {ProjetoStatusLabels[projetoSelecionado.status as ProjetoStatus] ||
                        projetoSelecionado.status}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/30">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Assunto / Descrição
                    </span>
                    <span className="text-foreground">
                      {projetoSelecionado.assunto || "Sem assunto definido"}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/30">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Data de Registro
                    </span>
                    <span className="text-foreground">
                      {formatarData(projetoSelecionado.dthRegistro)}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/30">
                    <span className="text-xs text-muted-foreground block mb-1">Projeto Inicial</span>
                    <span className="text-foreground">
                      {projetoSelecionado.isInicial ? "Sim" : "Não"}
                    </span>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/30">
                    <span className="text-xs text-muted-foreground block mb-1">Favorito</span>
                    <span className="text-foreground">
                      {projetoSelecionado.isFavorito ? "Sim" : "Não"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === "atividades" && (
              <AtividadesBoard
                projeto={projetoSelecionado}
                nivel={grupoAtual?.nivel ?? null}
                isAdmin={isAdmin}
                onProjetoAtualizado={(atualizado) => {
                  setProjetos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
                  setProjetoSelecionado(atualizado);
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Estado Vazio de Projeto */
        <div className="text-center py-20 bg-card rounded-2xl border border-border/30 p-6 space-y-3">
          <FolderKanban className="w-16 h-16 text-muted-foreground/40 mx-auto" />
          <h3 className="text-foreground font-semibold text-lg">
            Nenhum projeto selecionado
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {grupoAtual
              ? `O grupo "${grupoAtual.nome}" ainda não possui projetos cadastrados.`
              : "Selecione um grupo de pesquisa no cabeçalho do site para carregar os projetos."}
          </p>
          {podeGerenciar && grupoAtual && (
            <button
              type="button"
              onClick={abrirNovoProjeto}
              className="mt-2 px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar primeiro projeto</span>
            </button>
          )}
        </div>
      )}

      {/* Modal de Projeto */}
      {projetoModalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border/40 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">
                    {editandoProjeto ? "Editar Projeto" : "Novo Projeto"}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {editandoProjeto
                      ? "Atualize as informações do projeto"
                      : "Crie um novo projeto para o grupo"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProjetoModalAberto(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {erroProjeto && (
                <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{erroProjeto}</span>
                </div>
              )}

              <form onSubmit={handleSalvarProjeto} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Título <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    disabled={salvandoProjeto}
                    className={inputClass}
                    placeholder="Ex: Desenvolvimento de Modelo de Deep Learning"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Assunto <span className="text-[#ff8c42]">*</span>
                  </label>
                  <textarea
                    value={formAssunto}
                    onChange={(e) => setFormAssunto(e.target.value)}
                    disabled={salvandoProjeto}
                    rows={3}
                    className={inputClass}
                    placeholder="Descreva o objetivo do projeto"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Status <span className="text-[#ff8c42]">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={salvandoProjeto}
                    className={inputClass}
                  >
                    {PROJETO_STATUS.filter((s) => editandoProjeto || s === "PLANEJADO" || s === "EM_ANDAMENTO").map(
                      (s) => (
                        <option key={s} value={s}>
                          {ProjetoStatusLabels[s]}
                        </option>
                      )
                    )}
                  </select>
                  {!editandoProjeto && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Projetos podem ser criados como Planejado ou Em Andamento.
                    </p>
                  )}
                </div>

                {editandoProjeto && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsAtivo}
                      onChange={(e) => setFormIsAtivo(e.target.checked)}
                      disabled={salvandoProjeto}
                      className="w-4 h-4 accent-[#ff8c42]"
                    />
                    <span className="text-sm text-foreground">Projeto ativo</span>
                  </label>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setProjetoModalAberto(false)}
                    disabled={salvandoProjeto}
                    className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoProjeto}
                    className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {salvandoProjeto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>{editandoProjeto ? "Salvar Alterações" : "Criar Projeto"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Participantes */}
      {participantesModalAberto && projetoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-2xl border border-border/40 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4a9eff] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">Participantes do Projeto</h3>
                  <p className="text-muted-foreground text-xs">{projetoSelecionado.titulo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setParticipantesModalAberto(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {erroParticipantes && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{erroParticipantes}</span>
                </div>
              )}

              <div className="bg-background rounded-xl border border-border/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserPlus className="w-4 h-4 text-[#ff8c42]" />
                  <span>Adicionar participante</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={novoParticipanteId}
                    onChange={(e) => setNovoParticipanteId(e.target.value)}
                    disabled={adicionandoParticipante}
                    className={`${inputClass} flex-1`}
                  >
                    <option value="">Selecione um membro do grupo</option>
                    {membrosDisponiveis.map((m) => (
                      <option key={m.usuarioId} value={m.usuarioId}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                  <select
                    value={novoNivel}
                    onChange={(e) => setNovoNivel(e.target.value as NivelMembro)}
                    disabled={adicionandoParticipante}
                    className={`${inputClass} sm:w-44`}
                  >
                    {(["PESQUISADOR", "COORDENADOR", "LIDER"] as NivelMembro[]).map((n) => (
                      <option key={n} value={n}>
                        {NivelMembroLabels[n]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAdicionarParticipante}
                    disabled={adicionandoParticipante}
                    className="px-4 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {adicionandoParticipante ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Adicionar</span>
                  </button>
                </div>
                {membrosDisponiveis.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Todos os membros do grupo já participam deste projeto.
                  </p>
                )}
              </div>

              {carregandoParticipantes ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#ff8c42] animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {participantes.map((p) => (
                    <div
                      key={p.usuarioId}
                      className="flex items-center justify-between gap-3 bg-background rounded-xl border border-border/30 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#4a9eff]/20 text-[#4a9eff] flex items-center justify-center font-semibold text-sm shrink-0">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{p.nome}</p>
                          <p className="text-muted-foreground text-xs truncate">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-card border border-border/40 text-muted-foreground flex items-center gap-1">
                          {p.nivel === "LIDER" && <Crown className="w-3 h-3" />}
                          {p.nivel ? NivelMembroLabels[p.nivel] : "Pesquisador"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverParticipante(p)}
                          className="p-1.5 rounded-lg bg-card hover:bg-[#ef4444]/15 text-[#ef4444] transition-colors cursor-pointer"
                          title="Remover do projeto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {participantes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhum participante vinculado a este projeto.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
