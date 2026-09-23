import React, { useEffect, useState, useMemo } from "react";
import {
  Bell, Plus, Search, Calendar, Clock, MapPin, Link2, Users, X,
  FileText, Presentation, Coffee, Megaphone, Filter,
  Repeat, Upload, UserCheck, Trash2, Edit, Download, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { LembreteService } from "../services/lembretes/LembreteService";
import { GrupoService } from "../services/grupos/GrupoService";
import { AuthService } from "../services/auth/AuthService";
import {
  Lembrete,
  TipoLembrete,
  TipoRecorrencia,
  CreateLembreteRequest,
  EditLembreteRequest
} from "../models/dto/lembretes/Lembrete";
import { ParticipantesMultiSelect } from "../components/ParticipantesMultiSelect";

type StatusLembrete = "Em Andamento" | "Próximo" | "Encerrado";

const CONFIG_TIPO: Record<TipoLembrete, { icone: React.ElementType; rotulo: string; cor: string; fundo: string }> = {
  EDITAL: { icone: Megaphone, rotulo: "Edital", cor: "text-[#f59e0b]", fundo: "bg-[#f59e0b]/20" },
  REUNIAO: { icone: Coffee, rotulo: "Reunião", cor: "text-[#4a9eff]", fundo: "bg-[#4a9eff]/20" },
  APRESENTACAO: { icone: Presentation, rotulo: "Apresentação", cor: "text-[#10b981]", fundo: "bg-[#10b981]/20" },
  WORKSHOP: { icone: FileText, rotulo: "Workshop", cor: "text-[#a78bfa]", fundo: "bg-[#a78bfa]/20" },
};

const SECOES_DE_STATUS: { chave: StatusLembrete; rotulo: string; cor: string }[] = [
  { chave: "Em Andamento", rotulo: "Em Andamento", cor: "text-[#ff8c42]" },
  { chave: "Próximo", rotulo: "Próximos (3 dias)", cor: "text-[#4a9eff]" },
  { chave: "Encerrado", rotulo: "Encerrados", cor: "text-muted-foreground" },
];

const RECORRENCIA_ROTULOS: Record<TipoRecorrencia, string> = {
  NENHUMA: "Nenhuma",
  DIARIA: "Diária",
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
  ANUAL: "Anual",
};

interface PesquisadorOpcao {
  usuarioId: number;
  nome: string;
  email: string;
}

export function Lembretes() {
  const { grupoAtual } = useGrupo();
  const lembreteService = useMemo(() => new LembreteService(), []);
  const grupoService = useMemo(() => new GrupoService(), []);
  const authService = useMemo(() => new AuthService(), []);

  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"all" | TipoLembrete>("all");

  const [pesquisadoresGrupo, setPesquisadoresGrupo] = useState<PesquisadorOpcao[]>([]);

  // Estado para Modal de Criação/Edição
  const [mostrarModal, setMostrarModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [lembreteEmEdicao, setLembreteEmEdicao] = useState<Lembrete | null>(null);
  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    tipo: "REUNIAO" as TipoLembrete,
    dataHora: "",
    localizacao: "",
    link: "",
    recorrencia: "NENHUMA" as TipoRecorrencia,
    participantesIds: [] as number[],
  });

  // Estado para Upload de Ata
  const [modalAtaLembrete, setModalAtaLembrete] = useState<Lembrete | null>(null);
  const [arquivoAta, setArquivoAta] = useState<File | null>(null);
  const [enviandoAta, setEnviandoAta] = useState(false);

  // Email do usuário logado para validações (CA 6)
  const usuarioLogadoEmail = authService.getUserEmail()?.toLowerCase() || "";

  // Carregar pesquisadores do grupo atual
  useEffect(() => {
    if (grupoAtual?.id) {
      grupoService
        .listarPesquisadores(grupoAtual.id, { size: 100 })
        .then((res) => {
          if (res?.items) {
            setPesquisadoresGrupo(
              res.items.map((p) => ({
                usuarioId: p.usuarioId,
                nome: p.nome,
                email: p.email,
              }))
            );
          }
        })
        .catch(() => setPesquisadoresGrupo([]));
    }
  }, [grupoAtual?.id, grupoService]);

  // Carregar Lembretes do Grupo
  const carregarLembretes = async () => {
    if (!grupoAtual?.id) {
      setLembretes([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const res = await lembreteService.listarLembretes(
        grupoAtual.id,
        filtroTipo,
        termoBusca
      );
      setLembretes(res.items || []);
    } catch (err: any) {
      dispararErro("Erro ao carregar lembretes", err.message || "Tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarLembretes();
  }, [grupoAtual?.id, filtroTipo, termoBusca]);

  const dispararErro = (titulo: string, mensagem: string) => {
    window.dispatchEvent(
      new CustomEvent("app:error", {
        detail: { titulo, mensagem },
      })
    );
  };

  // Abrir Modal para Criar
  const abrirModalCriar = () => {
    setLembreteEmEdicao(null);
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    const dataHoraIso = agora.toISOString().slice(0, 16);

    setFormulario({
      titulo: "",
      descricao: "",
      tipo: "REUNIAO",
      dataHora: dataHoraIso,
      localizacao: "",
      link: "",
      recorrencia: "NENHUMA",
      participantesIds: [],
    });
    setMostrarModal(true);
  };

  // Abrir Modal para Editar
  const abrirModalEditar = (lembrete: Lembrete) => {
    // CA 6: Somente o criador pode editar Reunião
    if (lembrete.tipo === "REUNIAO" && lembrete.organizadorEmail.toLowerCase() !== usuarioLogadoEmail) {
      dispararErro("Acesso Negado", "Somente o criador da reunião pode editá-la.");
      return;
    }

    setLembreteEmEdicao(lembrete);
    const dataHoraFormato = lembrete.dataHora ? lembrete.dataHora.slice(0, 16) : "";

    setFormulario({
      titulo: lembrete.titulo,
      descricao: lembrete.descricao || "",
      tipo: lembrete.tipo,
      dataHora: dataHoraFormato,
      localizacao: lembrete.localizacao || "",
      link: lembrete.link || "",
      recorrencia: lembrete.recorrencia || "NENHUMA",
      participantesIds: lembrete.participantes ? lembrete.participantes.map((p) => p.id) : [],
    });
    setMostrarModal(true);
  };

  // Salvar (Criar ou Editar)
  const salvarLembrete = async () => {
    if (salvando) return;

    if (!formulario.titulo.trim()) {
      dispararErro("Campo Obrigatório", "O título do lembrete é obrigatório.");
      return;
    }
    if (!formulario.dataHora) {
      dispararErro("Campo Obrigatório", "A data e horário são obrigatórios.");
      return;
    }
    if (!grupoAtual?.id) {
      dispararErro("Grupo Não Selecionado", "Por favor, selecione um grupo de pesquisa.");
      return;
    }

    setSalvando(true);
    try {
      if (lembreteEmEdicao) {
        const payload: EditLembreteRequest = {
          titulo: formulario.titulo,
          descricao: formulario.descricao,
          tipo: formulario.tipo,
          dataHora: formulario.dataHora,
          localizacao: formulario.localizacao,
          link: formulario.link,
          recorrencia: formulario.recorrencia,
          participantesIds: formulario.participantesIds,
        };
        await lembreteService.atualizarLembrete(lembreteEmEdicao.id, payload);
      } else {
        const payload: CreateLembreteRequest = {
          titulo: formulario.titulo,
          descricao: formulario.descricao,
          tipo: formulario.tipo,
          dataHora: formulario.dataHora,
          localizacao: formulario.localizacao,
          link: formulario.link,
          recorrencia: formulario.recorrencia,
          grupoId: grupoAtual.id,
          participantesIds: formulario.participantesIds,
        };
        await lembreteService.criarLembrete(payload);
      }
      setMostrarModal(false);
      carregarLembretes();
    } catch (err: any) {
      dispararErro("Erro ao salvar", err.message || "Não foi possível salvar o lembrete.");
    } finally {
      setSalvando(false);
    }
  };

  // Excluir Lembrete
  const excluirLembrete = async (lembrete: Lembrete) => {
    // CA 6: Somente o criador pode excluir Reunião
    if (lembrete.tipo === "REUNIAO" && lembrete.organizadorEmail.toLowerCase() !== usuarioLogadoEmail) {
      dispararErro("Acesso Negado", "Somente o criador da reunião pode excluí-la.");
      return;
    }

    if (window.confirm(`Deseja realmente excluir o lembrete "${lembrete.titulo}"?`)) {
      try {
        await lembreteService.inativarLembrete(lembrete.id);
        carregarLembretes();
      } catch (err: any) {
        dispararErro("Erro ao excluir", err.message || "Não foi possível excluir o lembrete.");
      }
    }
  };

  // Anexar Ata (CA 6)
  const handleAnexarAta = async () => {
    if (!modalAtaLembrete || !arquivoAta) return;
    setEnviandoAta(true);
    try {
      await lembreteService.anexarAta(modalAtaLembrete.id, arquivoAta);
      setModalAtaLembrete(null);
      setArquivoAta(null);
      carregarLembretes();
    } catch (err: any) {
      dispararErro("Erro no upload da Ata", err.message || "Não foi possível enviar o arquivo da ata.");
    } finally {
      setEnviandoAta(false);
    }
  };

  // Remover Ata (CA 6)
  const handleRemoverAta = async (lembrete: Lembrete) => {
    if (lembrete.organizadorEmail.toLowerCase() !== usuarioLogadoEmail) {
      dispararErro("Acesso Negado", "Somente o criador da reunião pode remover a ata.");
      return;
    }
    if (window.confirm("Deseja realmente remover o arquivo de ata desta reunião?")) {
      try {
        await lembreteService.removerAta(lembrete.id);
        carregarLembretes();
      } catch (err: any) {
        dispararErro("Erro ao remover Ata", err.message || "Não foi possível remover a ata.");
      }
    }
  };

  // Helper para classificar status por data
  const calcularStatus = (dataHoraStr: string): StatusLembrete => {
    const agora = new Date();
    const dt = new Date(dataHoraStr);
    const diffDias = (dt.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDias < 0) return "Encerrado";
    if (diffDias <= 3) return "Próximo";
    return "Em Andamento";
  };

  const agrupadosPorStatus = SECOES_DE_STATUS.map((secao) => ({
    ...secao,
    itens: lembretes.filter((l) => calcularStatus(l.dataHora) === secao.chave),
  }));

  const toggleParticipante = (usuarioId: number) => {
    setFormulario((prev) => {
      const existe = prev.participantesIds.includes(usuarioId);
      if (existe) {
        return { ...prev, participantesIds: prev.participantesIds.filter((id) => id !== usuarioId) };
      } else {
        return { ...prev, participantesIds: [...prev.participantesIds, usuarioId] };
      }
    });
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Lembretes</h1>
        <p className="text-muted-foreground">
          Editais, reuniões, apresentações e workshops do grupo{" "}
          {grupoAtual ? <span className="font-semibold text-foreground">({grupoAtual.nome})</span> : ""}
        </p>
      </div>

      {/* Cartões Estatísticos por Tipo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["EDITAL", "REUNIAO", "APRESENTACAO", "WORKSHOP"] as TipoLembrete[]).map((tipo) => {
          const config = CONFIG_TIPO[tipo];
          const Icone = config.icone;
          const qtd = lembretes.filter((l) => l.tipo === tipo).length;

          return (
            <div key={tipo} className="bg-card rounded-xl p-4 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{config.rotulo}s</span>
                <Icone className={`w-5 h-5 ${config.cor}`} />
              </div>
              <div className="text-foreground text-2xl font-bold">{qtd}</div>
            </div>
          );
        })}
      </div>

      {/* Ações e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar lembretes..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-card rounded-xl border border-border/30">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as "all" | TipoLembrete)}
            className="bg-transparent text-foreground focus:outline-none text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="EDITAL">Editais</option>
            <option value="REUNIAO">Reuniões</option>
            <option value="APRESENTACAO">Apresentações</option>
            <option value="WORKSHOP">Workshops</option>
          </select>
        </div>

        <button
          onClick={abrirModalCriar}
          disabled={!grupoAtual}
          className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Novo Lembrete
        </button>
      </div>

      {/* Estado de Carregamento */}
      {carregando ? (
        <div className="text-center py-12 text-muted-foreground">Carregando lembretes...</div>
      ) : (
        /* Lista Seccionada por Status */
        <div className="space-y-8">
          {agrupadosPorStatus.map(({ chave, rotulo, cor, itens }) => (
            itens.length > 0 && (
              <div key={chave}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`font-semibold ${cor}`}>{rotulo}</h2>
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border/30">
                    {itens.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {itens.map((lembrete) => {
                    const config = CONFIG_TIPO[lembrete.tipo] || CONFIG_TIPO.REUNIAO;
                    const Icone = config.icone;
                    const eCriador = lembrete.organizadorEmail.toLowerCase() === usuarioLogadoEmail;

                    return (
                      <div
                        key={lembrete.id}
                        className={`bg-card rounded-2xl p-6 border transition-all duration-300 ${
                          chave === "Encerrado" ? "border-border/20 opacity-75" : "border-border/30"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Ícone do tipo */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.fundo}`}>
                            <Icone className={`w-5 h-5 ${config.cor}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Cabeçalho */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-foreground font-semibold leading-snug">{lembrete.titulo}</h3>
                              <div className="flex items-center gap-2 shrink-0">
                                {lembrete.recorrencia && lembrete.recorrencia !== "NENHUMA" && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-border/30 text-muted-foreground">
                                    <Repeat className="w-3 h-3" />
                                    {RECORRENCIA_ROTULOS[lembrete.recorrencia]}
                                  </span>
                                )}
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.fundo} ${config.cor}`}>
                                  {config.rotulo}
                                </span>
                              </div>
                            </div>

                            {lembrete.descricao && (
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{lembrete.descricao}</p>
                            )}

                            {/* Metadados */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                  {new Date(lembrete.dataHora).toLocaleDateString("pt-BR", {
                                    day: "2-digit", month: "short", year: "numeric"
                                  })}
                                </span>
                                <Clock className="w-3.5 h-3.5 ml-1" />
                                <span>
                                  {new Date(lembrete.dataHora).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit", minute: "2-digit"
                                  })}
                                </span>
                              </div>

                              {lembrete.localizacao && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{lembrete.localizacao}</span>
                                </div>
                              )}

                              {lembrete.participantes && lembrete.participantes.length > 0 && (
                                <div className="flex items-center gap-1.5" title={lembrete.participantes.map(p => p.nome).join(", ")}>
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{lembrete.participantes.length} participante(s)</span>
                                </div>
                              )}
                            </div>

                            {/* Ações e Botões do Card */}
                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                              {lembrete.link && (
                                <a
                                  href={lembrete.link.startsWith("http") ? lembrete.link : `https://${lembrete.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4a9eff]/10 text-[#4a9eff] hover:bg-[#4a9eff]/20 text-xs font-medium transition-colors"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                  Acessar Link
                                </a>
                              )}

                              {/* Ações de Ata para Reunião (CA 6) */}
                              {lembrete.tipo === "REUNIAO" && (
                                <>
                                  {lembrete.temAta ? (
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={lembrete.ataUrl || lembreteService.obterUrlDownloadAta(lembrete.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 text-xs font-medium transition-colors"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Visualizar/Baixar Ata ({lembrete.ataNomeOriginal})
                                      </a>

                                      {eCriador && (
                                        <button
                                          onClick={() => handleRemoverAta(lembrete)}
                                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
                                          title="Remover Ata"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    eCriador && (
                                      <button
                                        onClick={() => {
                                          setModalAtaLembrete(lembrete);
                                          setArquivoAta(null);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff8c42]/10 text-[#ff8c42] hover:bg-[#ff8c42]/20 text-xs font-medium transition-colors"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                        Inserir Ata de Reunião
                                      </button>
                                    )
                                  )}
                                </>
                              )}

                              {/* Criador e Ações de Edição/Exclusão */}
                              <div className="flex items-center gap-3 ml-auto">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">por {lembrete.organizadorNome}</span>
                                </div>

                                {/* Botão Editar (Apenas para criador quando tipo Reunião, ou qualquer outro lembrete) */}
                                {(lembrete.tipo !== "REUNIAO" || eCriador) && (
                                  <button
                                    onClick={() => abrirModalEditar(lembrete)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-border/30 rounded-lg transition-colors"
                                    title="Editar lembrete"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Botão Excluir */}
                                {(lembrete.tipo !== "REUNIAO" || eCriador) && (
                                  <button
                                    onClick={() => excluirLembrete(lembrete)}
                                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-border/30 rounded-lg transition-colors"
                                    title="Excluir lembrete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {!carregando && lembretes.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/30">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum lembrete encontrado para este grupo</p>
        </div>
      )}

      {/* Modal de Criar / Editar Lembrete */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border/30 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-semibold">
                {lembreteEmEdicao ? "Editar Lembrete" : "Novo Lembrete"}
              </h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="p-2 hover:bg-border/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Título *</label>
                <input
                  type="text"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  placeholder="Título do lembrete"
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Descrição</label>
                <textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                  placeholder="Detalhes do lembrete"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Tipo</label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as TipoLembrete })}
                    className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
                  >
                    <option value="EDITAL">Edital</option>
                    <option value="REUNIAO">Reunião</option>
                    <option value="APRESENTACAO">Apresentação</option>
                    <option value="WORKSHOP">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Recorrência</label>
                  <select
                    value={formulario.recorrencia}
                    onChange={(e) => setFormulario({ ...formulario, recorrencia: e.target.value as TipoRecorrencia })}
                    className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
                  >
                    <option value="NENHUMA">Nenhuma</option>
                    <option value="DIARIA">Diária</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSAL">Mensal</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Data e Horário *</label>
                <input
                  type="datetime-local"
                  value={formulario.dataHora}
                  onChange={(e) => setFormulario({ ...formulario, dataHora: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Localização</label>
                <input
                  type="text"
                  value={formulario.localizacao}
                  onChange={(e) => setFormulario({ ...formulario, localizacao: e.target.value })}
                  placeholder="Sala, auditório ou online"
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Link de Acesso</label>
                <input
                  type="url"
                  value={formulario.link}
                  onChange={(e) => setFormulario({ ...formulario, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              {/* Seleção de Participantes (Select Multicheck) */}
              {pesquisadoresGrupo.length > 0 && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Participantes do Grupo
                  </label>
                  <ParticipantesMultiSelect
                    opcoes={pesquisadoresGrupo}
                    selecionadosIds={formulario.participantesIds}
                    onChange={(novosIds) =>
                      setFormulario({ ...formulario, participantesIds: novosIds })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarLembrete}
                disabled={salvando}
                className="flex-1 py-2.5 bg-[#ff8c42] text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {salvando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : lembreteEmEdicao ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Lembrete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anexar Ata de Reunião (CA 6) */}
      {modalAtaLembrete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground font-semibold">Inserir Ata de Reunião</h2>
              <button
                onClick={() => setModalAtaLembrete(null)}
                className="p-1 hover:bg-border/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Selecione o arquivo de ata (PDF ou documento) para anexar ao lembrete{" "}
              <strong className="text-foreground">"{modalAtaLembrete.titulo}"</strong>.
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setArquivoAta(e.target.files?.[0] || null)}
              className="w-full p-2 bg-background border border-border/30 rounded-xl text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#ff8c42]/20 file:text-[#ff8c42] hover:file:bg-[#ff8c42]/30"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAtaLembrete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnexarAta}
                disabled={!arquivoAta || enviandoAta}
                className="flex-1 py-2.5 bg-[#ff8c42] text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {enviandoAta ? "Enviando..." : "Enviar Ata"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}