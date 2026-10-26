import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Newspaper,
  Plus,
  Search,
  Calendar,
  X,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Check,
  ThumbsDown,
  Link2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { NoticiaService } from "../services/noticias/NoticiaService";
import {
  NoticiaResponse,
  NoticiaStatusLabels,
  noticiaStatusSchema,
  type NoticiaStatus,
} from "../models/dto/noticias/Noticia";
import { nivelEhLider, nivelPodeEscrever } from "../models/dto/NivelMembro";
import { HttpError } from "../utils/HttpError";
import { DateInput } from "../components/DateInput";

type Aba = "publicadas" | "aprovacoes";

const TAMANHO_PAGINA = 9;

const STATUS_BADGE: Record<NoticiaStatus, string> = {
  PENDENTE: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
  APROVADA: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
  REJEITADA: "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30",
};

export function Noticias() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const noticiaService = useMemo(() => new NoticiaService(), []);

  // Aprovam notícias: Líder do grupo ou Líder de algum projeto do grupo
  const podeAprovar = nivelEhLider(grupoAtual?.nivel) || Boolean(grupoAtual?.isLiderDeProjeto);
  const podeCriar = nivelPodeEscrever(grupoAtual?.nivel);

  const [aba, setAba] = useState<Aba>("publicadas");

  const [noticias, setNoticias] = useState<NoticiaResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [termoAssunto, setTermoAssunto] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<NoticiaResponse | null>(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formConteudo, setFormConteudo] = useState("");
  const [formReferencia, setFormReferencia] = useState("");
  const [formAssunto, setFormAssunto] = useState("");
  const [formDataInicio, setFormDataInicio] = useState("");
  const [formDataFim, setFormDataFim] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [buscandoLink, setBuscandoLink] = useState(false);

  const [noticiaParaRejeitar, setNoticiaParaRejeitar] = useState<NoticiaResponse | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [rejeitando, setRejeitando] = useState(false);

  const [noticiaParaRemover, setNoticiaParaRemover] = useState<NoticiaResponse | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    if (!grupoAtual?.id) {
      setNoticias([]);
      setTotalElementos(0);
      setTotalPaginas(1);
      return;
    }

    setCarregando(true);
    try {
      const resposta =
        aba === "aprovacoes"
          ? await noticiaService.listarPendentes({
              grupoId: grupoAtual.id,
              page: paginaAtual,
              size: TAMANHO_PAGINA,
            })
          : await noticiaService.listar({
              grupoId: grupoAtual.id,
              assunto: termoAssunto.trim() || undefined,
              dataInicio: filtroDataInicio || undefined,
              dataFim: filtroDataFim || undefined,
              page: paginaAtual,
              size: TAMANHO_PAGINA,
            });

      setNoticias(resposta.items);
      setTotalElementos(resposta.totalElements);
      setTotalPaginas(Math.max(1, resposta.totalPages));
    } catch {
      setNoticias([]);
    } finally {
      setCarregando(false);
    }
  }, [
    grupoAtual?.id,
    aba,
    paginaAtual,
    termoAssunto,
    filtroDataInicio,
    filtroDataFim,
    noticiaService,
  ]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [grupoAtual?.id, aba]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const notificarSucesso = (mensagem: string) => {
    setMensagemSucesso(mensagem);
    setTimeout(() => setMensagemSucesso(null), 4500);
  };

  const limparFiltros = () => {
    setTermoAssunto("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setPaginaAtual(1);
  };

  const abrirModalCriacao = () => {
    setEditando(null);
    setFormTitulo("");
    setFormConteudo("");
    setFormReferencia("");
    setFormAssunto("");
    setFormDataInicio("");
    setFormDataFim("");
    setErroForm(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = (noticia: NoticiaResponse) => {
    setEditando(noticia);
    setFormTitulo(noticia.titulo);
    setFormConteudo(noticia.conteudo);
    setFormReferencia(noticia.referencia ?? "");
    setFormAssunto(noticia.assunto);
    setFormDataInicio(noticia.dataInicioExibicao ? noticia.dataInicioExibicao.substring(0, 10) : "");
    setFormDataFim(noticia.dataFimExibicao ? noticia.dataFimExibicao.substring(0, 10) : "");
    setErroForm(null);
    setModalAberto(true);
  };

  const buscarDadosDoLink = async () => {
    setErroForm(null);
    if (!formReferencia.trim()) {
      setErroForm("Informe o link da notícia para buscar os dados.");
      return;
    }

    setBuscandoLink(true);
    try {
      const preview = await noticiaService.previewLink(formReferencia.trim());
      if (preview.titulo) setFormTitulo(preview.titulo);
      if (preview.descricao) setFormConteudo(preview.descricao);
      notificarSucesso("Dados do link importados. Revise e edite como preferir antes de salvar.");
    } catch (err) {
      const mensagem =
        err instanceof HttpError
          ? err.response?.mensagem || err.message
          : "Não foi possível importar os dados do link.";
      setErroForm(mensagem);
    } finally {
      setBuscandoLink(false);
    }
  };

  const submeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    if (!grupoAtual?.id) {
      setErroForm("Selecione um grupo de pesquisa.");
      return;
    }
    if (!formTitulo.trim()) {
      setErroForm("O título da notícia é obrigatório.");
      return;
    }
    if (!formConteudo.trim()) {
      setErroForm("O conteúdo da notícia é obrigatório.");
      return;
    }
    if (!formAssunto.trim()) {
      setErroForm("O assunto da notícia é obrigatório.");
      return;
    }

    const payload = {
      titulo: formTitulo.trim(),
      conteudo: formConteudo.trim(),
      referencia: formReferencia.trim() || null,
      assunto: formAssunto.trim(),
      dataInicioExibicao: formDataInicio ? `${formDataInicio}T00:00:00` : null,
      dataFimExibicao: formDataFim ? `${formDataFim}T23:59:59` : null,
    };

    setSalvando(true);
    try {
      if (editando) {
        await noticiaService.atualizar(editando.id, payload);
        notificarSucesso(
          editando.status === "REJEITADA"
            ? "Notícia reenviada para aprovação."
            : "Notícia atualizada com sucesso."
        );
      } else {
        await noticiaService.criar({ grupoId: grupoAtual.id, ...payload });
        notificarSucesso("Notícia cadastrada e enviada para aprovação.");
      }
      setModalAberto(false);
      setAba("publicadas");
      setPaginaAtual(1);
      carregar();
    } catch (err) {
      const mensagem =
        err instanceof HttpError
          ? err.response?.mensagem || err.message
          : "Erro ao salvar a notícia.";
      setErroForm(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const aprovar = async (noticia: NoticiaResponse) => {
    setProcessandoId(noticia.id);
    try {
      await noticiaService.aprovar(noticia.id);
      notificarSucesso(`Notícia "${noticia.titulo}" publicada com sucesso.`);
      carregar();
    } catch {
      // Tratado globalmente
    } finally {
      setProcessandoId(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!noticiaParaRejeitar) return;
    setRejeitando(true);
    try {
      await noticiaService.rejeitar(noticiaParaRejeitar.id, motivoRejeicao.trim() || undefined);
      notificarSucesso(`Notícia "${noticiaParaRejeitar.titulo}" rejeitada.`);
      setNoticiaParaRejeitar(null);
      setMotivoRejeicao("");
      carregar();
    } catch {
      // Tratado globalmente
    } finally {
      setRejeitando(false);
    }
  };

  const confirmarRemocao = async () => {
    if (!noticiaParaRemover) return;
    setRemovendo(true);
    try {
      await noticiaService.remover(noticiaParaRemover.id);
      notificarSucesso(`Notícia "${noticiaParaRemover.titulo}" removida.`);
      setNoticiaParaRemover(null);
      carregar();
    } catch {
      // Tratado globalmente
    } finally {
      setRemovendo(false);
    }
  };

  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return "—";
    try {
      return new Date(dataIso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dataIso;
    }
  };

  const statusSeguro = (status: string): NoticiaStatus => {
    const parse = noticiaStatusSchema.safeParse(status);
    return parse.success ? parse.data : "PENDENTE";
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {mensagemSucesso && (
        <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold mb-1">Notícias</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre, filtre e acompanhe as notícias do grupo
            {grupoAtual ? ` "${grupoAtual.nome}"` : ""}
          </p>
        </div>
        <button
          onClick={abrirModalCriacao}
          disabled={!grupoAtual?.id || !podeCriar}
          title={podeCriar ? undefined : "Colaboradores têm acesso somente de leitura"}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nova Notícia
        </button>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 border-b border-border/30">
        <button
          onClick={() => setAba("publicadas")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
            aba === "publicadas"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            Publicadas
          </span>
        </button>
        {podeAprovar && (
          <button
            onClick={() => setAba("aprovacoes")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
              aba === "aprovacoes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Aprovações
            </span>
          </button>
        )}
      </div>

      {/* Filtros (somente aba de publicadas) */}
      {aba === "publicadas" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPaginaAtual(1);
            carregar();
          }}
          className="bg-card rounded-2xl p-4 border border-border/30 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filtrar por assunto..."
                value={termoAssunto}
                onChange={(e) => setTermoAssunto(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">De:</span>
              <DateInput
                type="date"
                value={filtroDataInicio}
                onChange={setFiltroDataInicio}
                className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Até:</span>
              <DateInput
                type="date"
                value={filtroDataFim}
                onChange={setFiltroDataFim}
                className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="md:col-span-1 flex items-center">
              <button
                type="submit"
                title="Filtrar"
                className="p-2 w-full bg-primary/15 text-primary hover:bg-primary/25 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(termoAssunto || filtroDataInicio || filtroDataFim) && (
            <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs text-muted-foreground">
              <span>Filtros ativos aplicados</span>
              <button type="button" onClick={limparFiltros} className="text-primary hover:underline cursor-pointer">
                Limpar filtros
              </button>
            </div>
          )}
        </form>
      )}

      {/* Lista */}
      {carregandoGrupos || carregando ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm">Carregando notícias...</span>
        </div>
      ) : !grupoAtual?.id ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
          <Newspaper className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold text-lg mb-1">Nenhum grupo selecionado</h3>
          <p className="text-muted-foreground text-sm">
            Selecione um grupo de pesquisa no cabeçalho para visualizar as notícias.
          </p>
        </div>
      ) : noticias.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
          <Newspaper className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold text-lg mb-1">
            {aba === "aprovacoes" ? "Nenhuma notícia aguardando aprovação" : "Nenhuma notícia encontrada"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            {aba === "aprovacoes"
              ? "As notícias cadastradas pelos pesquisadores aparecerão aqui para revisão."
              : termoAssunto || filtroDataInicio || filtroDataFim
              ? "Tente ajustar os filtros de assunto e datas."
              : "Cadastre a primeira notícia do grupo."}
          </p>
          {aba === "publicadas" && (termoAssunto || filtroDataInicio || filtroDataFim) && (
            <button
              onClick={limparFiltros}
              className="px-4 py-2 bg-border/20 text-foreground hover:bg-border/30 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {noticias.map((noticia) => {
            const status = statusSeguro(noticia.status);
            return (
              <div
                key={noticia.id}
                className="bg-card rounded-2xl p-5 border border-border/30 flex flex-col justify-between hover:border-border/60 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE[status]}`}
                      >
                        {NoticiaStatusLabels[status]}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-border/30 text-muted-foreground truncate max-w-[150px]">
                        {noticia.assunto}
                      </span>
                    </div>
                    {noticia.isExpirada && (
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">Expirada</span>
                    )}
                  </div>

                  <h3 className="text-foreground font-semibold text-base mb-2 line-clamp-2 leading-snug">
                    {noticia.titulo}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-3 leading-relaxed">
                    {noticia.conteudo}
                  </p>

                  {status === "REJEITADA" && noticia.motivoRejeicao && (
                    <div className="mb-3 p-2.5 bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-lg text-xs text-[#ef4444]">
                      Motivo: {noticia.motivoRejeicao}
                    </div>
                  )}

                  {noticia.referencia && (
                    <a
                      href={noticia.referencia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mb-2 break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[240px]">{noticia.referencia}</span>
                    </a>
                  )}
                </div>

                <div className="pt-3 border-t border-border/20 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatarData(noticia.dthRegistro)}</span>
                    </div>
                    {noticia.autorNome && (
                      <span className="truncate max-w-[150px]" title={noticia.autorNome}>
                        por {noticia.autorNome}
                      </span>
                    )}
                  </div>

                  {podeAprovar && (
                    <div className="flex items-center gap-2">
                      {aba === "aprovacoes" && status === "PENDENTE" && (
                        <>
                          <button
                            onClick={() => aprovar(noticia)}
                            disabled={processandoId === noticia.id}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/25 disabled:opacity-50 text-xs font-medium transition-colors cursor-pointer"
                          >
                            {processandoId === noticia.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => setNoticiaParaRejeitar(noticia)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] hover:bg-[#f59e0b]/25 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Rejeitar
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => abrirModalEdicao(noticia)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setNoticiaParaRemover(noticia)}
                        title="Remover"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/20 text-sm text-muted-foreground">
          <span>
            Página {paginaAtual} de {totalPaginas} ({totalElementos}{" "}
            {totalElementos === 1 ? "notícia" : "notícias"})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="p-2 rounded-lg border border-border/30 hover:bg-border/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="p-2 rounded-lg border border-border/30 hover:bg-border/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border/30 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editando ? "Editar Notícia" : "Nova Notícia"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                disabled={salvando}
                className="p-2 hover:bg-border/20 rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroForm && (
              <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-[#ef4444] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroForm}</span>
              </div>
            )}

            <form onSubmit={submeterFormulario} className="space-y-4">
              {/* Link + importação automática (REQ-079) */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Link / Referência
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      placeholder="https://portaldanoticia.com/artigo"
                      value={formReferencia}
                      onChange={(e) => setFormReferencia(e.target.value)}
                      disabled={salvando}
                      className="w-full pl-10 pr-4 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={buscarDadosDoLink}
                    disabled={salvando || buscandoLink}
                    className="px-4 py-2.5 bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    {buscandoLink ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    Importar
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Cole o link para preencher título e conteúdo automaticamente; você pode editar depois.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Título da notícia"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Conteúdo *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Descrição / conteúdo da notícia"
                  value={formConteudo}
                  onChange={(e) => setFormConteudo(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Assunto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inteligência Artificial, Editais, Eventos..."
                  value={formAssunto}
                  onChange={(e) => setFormAssunto(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Início da exibição
                  </label>
                  <DateInput
                    type="date"
                    value={formDataInicio}
                    onChange={setFormDataInicio}
                    disabled={salvando}
                    className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Fim da exibição
                  </label>
                  <DateInput
                    type="date"
                    value={formDataFim}
                    onChange={setFormDataFim}
                    disabled={salvando}
                    className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Se não informado, a notícia expira após o prazo padrão ao ser aprovada.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-4 py-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : editando ? (
                    "Salvar alterações"
                  ) : (
                    "Cadastrar Notícia"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {noticiaParaRejeitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border/30 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] mx-auto">
              <ThumbsDown className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-foreground">Rejeitar Notícia</h3>
              <p className="text-xs text-muted-foreground">
                Informe o motivo da rejeição de{" "}
                <strong>"{noticiaParaRejeitar.titulo}"</strong>. O autor poderá corrigir e reenviar.
              </p>
            </div>
            <textarea
              rows={3}
              placeholder="Motivo da rejeição (opcional)"
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              disabled={rejeitando}
              className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm resize-none"
            />
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNoticiaParaRejeitar(null);
                  setMotivoRejeicao("");
                }}
                disabled={rejeitando}
                className="flex-1 py-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRejeicao}
                disabled={rejeitando}
                className="flex-1 py-2 bg-[#f59e0b] hover:bg-[#f59e0b]/90 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {rejeitando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remoção */}
      {noticiaParaRemover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border/30 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-foreground">Remover Notícia</h3>
              <p className="text-xs text-muted-foreground">
                Tem certeza que deseja remover a notícia{" "}
                <strong>"{noticiaParaRemover.titulo}"</strong>? Ela deixará de ser exibida.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNoticiaParaRemover(null)}
                disabled={removendo}
                className="flex-1 py-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRemocao}
                disabled={removendo}
                className="flex-1 py-2 bg-[#ef4444] hover:bg-[#ef4444]/90 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {removendo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
