import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Plus, Search, Calendar, Clock, MapPin, Link2, Users, X,
  FileText, Presentation, Coffee, PenBox, CheckCircle, Filter,
  Repeat, Upload, UserCheck, Pencil, Trash2, Loader2, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight,
  Group
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { LembreteService } from "../services/lembretes/LembreteService";
import {
  LembreteResponse,
  TIPOS_LEMBRETE,
  TIPOS_RECORRENCIA,
  TipoLembrete,
  TipoRecorrencia,
} from "../models/dto/lembretes/Lembrete";
import { proximaOcorrencia } from "../utils/Recorrencia";
import { HttpError } from "../utils/HttpError";
import { nivelEhLider, nivelPodeEscrever } from "../models/dto/NivelMembro";
import { AuthService } from "../services/auth/AuthService";
import { DateInput } from "../components/DateInput";

type StatusLembrete = "Agendado" | "Próximo" | "Encerrado";

interface LembreteExibicao extends LembreteResponse {
  proxima: Date;
  status: StatusLembrete;
}

const DIAS_PROXIMO = 3;
const TAMANHO_PAGINA = 10;
const ATRASO_BUSCA_MS = 500;

const CONFIG_TIPO: Record<TipoLembrete, { icone: React.ElementType; cor: string; fundo: string }> = {
  Edital: { icone: FileText, cor: "text-[#f59e0b]", fundo: "bg-[#f59e0b]/20" },
  Reunião: { icone: Coffee, cor: "text-[#4a9eff]", fundo: "bg-[#4a9eff]/20" },
  Apresentação: { icone: Presentation, cor: "text-[#10b981]", fundo: "bg-[#10b981]/20" },
  Workshop: { icone: Users, cor: "text-[#a78bfa]", fundo: "bg-[#a78bfa]/20" },
};

const SECOES_DE_STATUS: { chave: StatusLembrete; rotulo: string; cor: string }[] = [
  { chave: "Próximo", rotulo: `Próximos (${DIAS_PROXIMO} dias)`, cor: "text-[#4a9eff]" },
  { chave: "Agendado", rotulo: "Agendados", cor: "text-[#ff8c42]" },
  { chave: "Encerrado", rotulo: "Encerrados", cor: "text-muted-foreground" },
];

const FORMULARIO_VAZIO = {
  titulo: "",
  descricao: "",
  tipo: "Reunião" as TipoLembrete,
  dataHora: "",
  local: "",
  link: "",
  recorrencia: "Nenhuma" as TipoRecorrencia,
};

/** Calcula a próxima ocorrência e o status com base nela (e não na data original). */
function prepararParaExibicao(lembrete: LembreteResponse, agora: Date): LembreteExibicao {
  const proxima = lembrete.proximaOcorrencia
    ? new Date(lembrete.proximaOcorrencia)
    : proximaOcorrencia(new Date(lembrete.dataHora), lembrete.recorrencia, agora);
  const diasAte = (proxima.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);
  let status: StatusLembrete;
  if (diasAte < 0) status = "Encerrado";
  else if (diasAte <= DIAS_PROXIMO) status = "Próximo";
  else status = "Agendado";
  return { ...lembrete, proxima, status };
}

function mensagemDeErro(err: unknown, padrao: string): string {
  if (err instanceof HttpError) return err.response?.mensagem || err.message;
  return padrao;
}

export function Lembretes() {
  const { grupoAtual } = useGrupo();
  const lembreteService = useMemo(() => new LembreteService(), []);
  const inputAtaRef = useRef<HTMLInputElement>(null);
  const lembreteAtaRef = useRef<number | null>(null);

  // Valor do campo de busca (a requisição só sai depois que o usuário para de digitar)
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"all" | TipoLembrete>("all");
  // Filtros efetivamente aplicados na última pesquisa
  const [filtrosAplicados, setFiltrosAplicados] = useState<{ busca: string; tipo: "all" | TipoLembrete }>({
    busca: "",
    tipo: "all",
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<LembreteResponse | null>(null);
  const [lembretes, setLembretes] = useState<LembreteResponse[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totaisPorTipo, setTotaisPorTipo] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [excluindo, setExcluindo] = useState<LembreteResponse | null>(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);

  const grupoId = grupoAtual?.id;
  const isAdmin = useMemo(() => new AuthService().isAdminOrInitialAdmin(), []);
  // Criam lembretes: Líder do grupo ou Líder de algum projeto do grupo
  const podeCriarLembrete =
    isAdmin || nivelEhLider(grupoAtual?.nivel) || Boolean(grupoAtual?.isLiderDeProjeto);
  const podeEscrever = isAdmin || nivelPodeEscrever(grupoAtual?.nivel);

  const carregarLembretes = useCallback(async () => {
    if (!grupoId) {
      setLembretes([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const resposta = await lembreteService.listarPorGrupo(grupoId, {
        busca: filtrosAplicados.busca,
        tipo: filtrosAplicados.tipo === "all" ? undefined : filtrosAplicados.tipo,
        page: paginaAtual,
        size: TAMANHO_PAGINA,
      });
      setLembretes(resposta.items);
      setTotalPaginas(resposta.totalPages);
      setTotalElementos(resposta.totalElements);
      setTotaisPorTipo(resposta.totaisPorTipo);
      // Página deixou de existir (ex.: último item excluído): volta para a última válida
      if (resposta.totalPages > 0 && paginaAtual > resposta.totalPages) {
        setPaginaAtual(resposta.totalPages);
      }
    } catch (err) {
      setLembretes([]);
      setErro(mensagemDeErro(err, "Erro ao carregar lembretes."));
    } finally {
      setCarregando(false);
    }
  }, [grupoId, lembreteService, filtrosAplicados, paginaAtual]);

  // Trocar de grupo volta para a primeira página
  useEffect(() => {
    setPaginaAtual(1);
  }, [grupoId]);

  useEffect(() => {
    carregarLembretes();
  }, [carregarLembretes]);

  const atualizarNaLista = (atualizado: LembreteResponse) =>
    setLembretes((atual) => atual.map((l) => (l.id === atualizado.id ? atualizado : l)));

  // Próxima ocorrência calculada a cada carga/alteração da lista
  const exibicao = useMemo(() => {
    const agora = new Date();
    return lembretes.map((l) => prepararParaExibicao(l, agora));
  }, [lembretes]);

  // Filtragem feita pela API; aqui só pesquisamos (novo objeto => nova requisição)
  // Busca por texto: aguarda o usuário parar de digitar antes de consultar a API
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosAplicados((atual) => {
        if (atual.busca === termoBusca) return atual;
        setPaginaAtual(1);
        return { ...atual, busca: termoBusca };
      });
    }, ATRASO_BUSCA_MS);
    return () => clearTimeout(timer);
  }, [termoBusca]);

  // Filtro de tipo: consulta imediatamente ao mudar
  const alterarTipo = (tipo: "all" | TipoLembrete) => {
    setFiltroTipo(tipo);
    setPaginaAtual(1);
    setFiltrosAplicados((atual) => ({ ...atual, tipo }));
  };
  const filtrados = exibicao;

  const abrirModalCriar = () => {
    setEditando(null);
    setFormulario(FORMULARIO_VAZIO);
    setErroForm("");
    setMostrarModal(true);
  };

  const abrirModalEditar = (l: LembreteResponse) => {
    setEditando(l);
    setFormulario({
      titulo: l.titulo,
      descricao: l.descricao ?? "",
      tipo: l.tipo,
      dataHora: l.dataHora.slice(0, 16),
      local: l.localizacao ?? "",
      link: l.link ?? "",
      recorrencia: l.recorrencia ?? "Nenhuma",
    });
    setErroForm("");
    setMostrarModal(true);
  };

  const salvarLembrete = async () => {
    if (!formulario.titulo.trim() || !formulario.dataHora) {
      setErroForm("Título e data/horário são obrigatórios.");
      return;
    }
    if (!editando && !grupoId) {
      setErroForm("Selecione um grupo de pesquisa para criar o lembrete.");
      return;
    }
    setSalvando(true);
    setErroForm("");
    const dados = {
      titulo: formulario.titulo.trim(),
      descricao: formulario.descricao.trim(),
      tipo: formulario.tipo,
      dataHora: formulario.dataHora.length === 16 ? `${formulario.dataHora}:00` : formulario.dataHora,
      localizacao: formulario.local.trim() || undefined,
      link: formulario.link.trim() || undefined,
      recorrencia: formulario.recorrencia,
    };
    try {
      if (editando) {
        await lembreteService.atualizar(editando.id, dados);
      } else {
        await lembreteService.criar({ ...dados, grupoId: grupoId! });
      }
      setMostrarModal(false);
      // A posição na ordem cronológica pode ter mudado: recarrega a página atual
      await carregarLembretes();
    } catch (err) {
      setErroForm(mensagemDeErro(err, "Erro ao salvar lembrete."));
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluindo) return;
    setSalvando(true);
    try {
      await lembreteService.excluir(excluindo.id);
      await carregarLembretes();
    } catch (err) {
      setErro(mensagemDeErro(err, "Erro ao excluir lembrete."));
    } finally {
      setExcluindo(null);
      setSalvando(false);
    }
  };

  const alternarPresenca = async (l: LembreteResponse) => {
    try {
      atualizarNaLista(await lembreteService.alternarPresenca(l.id));
    } catch (err) {
      setErro(mensagemDeErro(err, "Erro ao atualizar presença."));
    }
  };

  const enviarAta = async (arquivo: File | undefined) => {
    const id = lembreteAtaRef.current;
    if (!arquivo || id === null) return;
    try {
      atualizarNaLista(await lembreteService.inserirAta(id, arquivo));
    } catch (err) {
      setErro(mensagemDeErro(err, "Erro ao enviar ata."));
    } finally {
      lembreteAtaRef.current = null;
      if (inputAtaRef.current) inputAtaRef.current.value = "";
    }
  };

  const agrupadosPorStatus = SECOES_DE_STATUS.map((secao) => {
    // A API já devolve em ordem cronológica (próxima ocorrência); mantém a ordem recebida
    const itens = filtrados.filter((l) => l.status === secao.chave);
    return { ...secao, itens };
  });

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Lembretes</h1>
        <p className="text-muted-foreground">Editais, reuniões, apresentações e workshops do grupo</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {TIPOS_LEMBRETE.map((tipo) => {
          const config = CONFIG_TIPO[tipo];
          const Icone = config.icone;
          return (
            <div key={tipo} className="bg-card rounded-xl p-4 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{tipo}s</span>
                <Icone className={`w-5 h-5 ${config.cor}`} />
              </div>
              <div className="text-foreground text-2xl font-bold">
                {totaisPorTipo[tipo] ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações */}
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
            onChange={(e) => alterarTipo(e.target.value as "all" | TipoLembrete)}
            className="bg-transparent text-foreground focus:outline-none text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Edital">Editais</option>
            <option value="Reunião">Reuniões</option>
            <option value="Apresentação">Apresentações</option>
            <option value="Workshop">Workshops</option>
          </select>
        </div>

        <button
          onClick={abrirModalCriar}
          disabled={!grupoId || !podeCriarLembrete}
          title={podeCriarLembrete ? undefined : "Apenas Líderes do grupo ou de projeto criam lembretes"}
          className="px-6 py-3 disabled:opacity-50 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Novo Lembrete
        </button>
      </div>

      {erro && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{erro}</span>
          <button onClick={carregarLembretes} title="Recarregar" className="p-1 hover:opacity-70">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        ref={inputAtaRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => enviarAta(e.target.files?.[0])}
      />

      {/* Lista seccionada */}
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
                  const config = CONFIG_TIPO[lembrete.tipo];
                  const Icone = config.icone;
                  return (
                    <div
                      key={lembrete.id}
                      className={`bg-card rounded-2xl p-6 border transition-all duration-300 ${ chave === "Encerrado" ? "border-border/20 opacity-70" : "border-border/30" }`}
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
                              {lembrete.recorrencia !== "Nenhuma" && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-border/30 text-muted-foreground">
                                  <Repeat className="w-3 h-3" />
                                  {lembrete.recorrencia}
                                </span>
                              )}
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.fundo} ${config.cor}`}>
                                {lembrete.tipo}
                              </span>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{lembrete.descricao}</p>

                          {/* Metadados */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {lembrete.proxima.toLocaleDateString("pt-BR", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </span>
                              <Clock className="w-3.5 h-3.5 ml-1" />
                              <span>
                                {lembrete.proxima.toLocaleTimeString("pt-BR", {
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

                            {lembrete.participantes.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{lembrete.participantes.length} participante(s)</span>
                              </div>
                            )}
                          </div>

                          {/* Linha de ações */}
                          <div className="flex items-center gap-3 mt-4 flex-wrap">
                            {lembrete.link && (
                              <a
                                href={lembrete.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4a9eff]/10 text-[#4a9eff] hover:bg-[#4a9eff]/20 text-xs font-medium transition-colors"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                Acessar Link
                              </a>
                            )}

                            {lembrete.tipo === "Reunião" && chave !== "Encerrado" && podeEscrever && (
                              <button onClick={() => alternarPresenca(lembrete)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ lembrete.presencaConfirmada ? "bg-[#10b981]/10 text-[#10b981]" : "bg-border/20 text-muted-foreground hover:bg-border/30" }`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                {lembrete.presencaConfirmada ? "Presença Confirmada" : "Confirmar Presença"}
                              </button>
                            )}

                            {lembrete.tipo === "Reunião" && lembrete.temAta && lembrete.ataUrl && (
                              <a
                                href={lembrete.ataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-border/20 text-muted-foreground hover:bg-border/30 text-xs font-medium transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Ver Ata
                              </a>
                            )}

                            {lembrete.tipo === "Reunião" && chave === "Encerrado" && !lembrete.temAta && (
                              <button
                                onClick={() => { lembreteAtaRef.current = lembrete.id; inputAtaRef.current?.click(); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-border/20 text-muted-foreground hover:bg-border/30 text-xs font-medium transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Inserir Ata
                              </button>
                            )}

                            <div className="flex items-center gap-1.5 ml-auto">
                              <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">por {lembrete.organizador || lembrete.criadorNome}</span>
                              <button
                                onClick={() => abrirModalEditar(lembrete)}
                                title="Editar"
                                className="ml-2 p-1.5 rounded-lg hover:bg-border/30 text-muted-foreground"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setExcluindo(lembrete)}
                                title="Excluir"
                                className="p-1.5 rounded-lg hover:bg-[#ef4444]/10 text-[#ef4444]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando lembretes...
        </div>
      ) : filtrados.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/30">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {grupoId ? "Nenhum lembrete encontrado" : "Selecione um grupo de pesquisa para ver os lembretes"}
          </p>
        </div>
      )}

      {/* Paginação */}
      {!carregando && totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/20 text-sm text-muted-foreground">
          <span>
            Página {paginaAtual} de {totalPaginas} ({totalElementos}{" "}
            {totalElementos === 1 ? "lembrete" : "lembretes"})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="p-2 rounded-lg border border-border/30 hover:bg-border/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="p-2 rounded-lg border border-border/30 hover:bg-border/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {excluindo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border/30 p-6">
            <h2 className="text-foreground font-semibold mb-2">Excluir lembrete</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Deseja excluir "{excluindo.titulo}"? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setExcluindo(null)}
                disabled={salvando}
                className="flex-1 py-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={salvando}
                className="flex-1 py-2.5 bg-[#ef4444] text-white rounded-xl font-medium disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border/30 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-semibold">{editando ? "Editar Lembrete" : "Novo Lembrete"}</h2>
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
                    {TIPOS_LEMBRETE.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Recorrência</label>
                  <select
                    value={formulario.recorrencia}
                    onChange={(e) => setFormulario({ ...formulario, recorrencia: e.target.value as TipoRecorrencia })}
                    className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
                  >
                    {TIPOS_RECORRENCIA.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Data e Horário *</label>
                <DateInput
                  type="datetime-local"
                  value={formulario.dataHora}
                  onChange={(v) => setFormulario({ ...formulario, dataHora: v })}
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Localização</label>
                <input
                  type="text"
                  value={formulario.local}
                  onChange={(e) => setFormulario({ ...formulario, local: e.target.value })}
                  placeholder="Sala, auditório ou online"
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5 font-normal">Link de acesso</label>
                <input
                  type="url"
                  value={formulario.link}
                  onChange={(e) => setFormulario({ ...formulario, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>
            </div>

            {erroForm && <p className="mt-4 text-sm text-[#ef4444]">{erroForm}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarLembrete}
                disabled={salvando}
                className="flex-1 py-2.5 bg-[#ff8c42] text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Criar Lembrete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}