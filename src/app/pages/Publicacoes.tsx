import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  FileText,
  Calendar,
  X,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { PublicacaoService } from "../services/publicacoes/PublicacaoService";
import { PublicacaoResponse } from "../models/dto/publicacoes/Publicacao";

export function Publicacoes() {
  const publicacaoService = useMemo(() => new PublicacaoService(), []);

  // Estados de listagem e filtros
  const [publicacoes, setPublicacoes] = useState<PublicacaoResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const tamanhoPagina = 9;

  // Filtros
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  // Modal de Criação
  const [mostrarModalCriacao, setMostrarModalCriacao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState<string | null>(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoProjetoId, setNovoProjetoId] = useState<string>("");
  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);

  // Modal de Confirmação de Inativação
  const [publicacaoParaInativar, setPublicacaoParaInativar] = useState<PublicacaoResponse | null>(null);
  const [inativando, setInativando] = useState(false);

  // Feedback de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarPublicacoes = useCallback(async () => {
    setCarregando(true);
    try {
      const response = await publicacaoService.listarPublicacoes({
        page: paginaAtual,
        size: tamanhoPagina,
        titulo: termoBusca.trim() || undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim: filtroDataFim || undefined,
      });

      setPublicacoes(response.items);
      setTotalElementos(response.totalElements);
      setTotalPaginas(response.totalPages);
    } catch {
      // O erro já é tratado e despachado globalmente pelo BaseService / TratarExcecao
    } finally {
      setCarregando(false);
    }
  }, [publicacaoService, paginaAtual, termoBusca, filtroDataInicio, filtroDataFim]);

  useEffect(() => {
    carregarPublicacoes();
  }, [carregarPublicacoes]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginaAtual(1);
    carregarPublicacoes();
  };

  const limparFiltros = () => {
    setTermoBusca("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setPaginaAtual(1);
  };

  const handleArquivoChange = (file: File | null) => {
    setErroCriacao(null);
    if (!file) {
      setArquivoPdf(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErroCriacao("A publicação deve ser exclusivamente no formato PDF.");
      setArquivoPdf(null);
      return;
    }

    setArquivoPdf(file);
  };

  const handleCriarPublicacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroCriacao(null);

    if (!novoTitulo.trim()) {
      setErroCriacao("O título da publicação é obrigatório.");
      return;
    }
    if (!novaDescricao.trim()) {
      setErroCriacao("A descrição da publicação é obrigatória.");
      return;
    }
    const projetoIdNum = Number(novoProjetoId);
    if (!novoProjetoId || isNaN(projetoIdNum) || projetoIdNum <= 0) {
      setErroCriacao("Informe um ID de projeto válido.");
      return;
    }
    if (!arquivoPdf) {
      setErroCriacao("O arquivo PDF da publicação é obrigatório.");
      return;
    }

    setSalvando(true);
    try {
      await publicacaoService.criarPublicacao({
        titulo: novoTitulo.trim(),
        descricao: novaDescricao.trim(),
        projetoId: projetoIdNum,
        arquivo: arquivoPdf,
      });

      setMensagemSucesso("Publicação criada e enviada ao Amazon S3 com sucesso!");
      setTimeout(() => setMensagemSucesso(null), 4000);

      // Limpar formulário e fechar modal
      setNovoTitulo("");
      setNovaDescricao("");
      setNovoProjetoId("");
      setArquivoPdf(null);
      setMostrarModalCriacao(false);

      // Recarregar lista
      setPaginaAtual(1);
      carregarPublicacoes();
    } catch (err: any) {
      const msg = err?.response?.mensagem || err?.message || "Erro ao criar publicação.";
      setErroCriacao(msg);
    } finally {
      setSalvando(false);
    }
  };

  const handleConfirmarInativacao = async () => {
    if (!publicacaoParaInativar) return;

    setInativando(true);
    try {
      await publicacaoService.inativarPublicacao(publicacaoParaInativar.id);
      setMensagemSucesso(`Publicação "${publicacaoParaInativar.titulo}" inativada com sucesso.`);
      setTimeout(() => setMensagemSucesso(null), 4000);
      setPublicacaoParaInativar(null);
      carregarPublicacoes();
    } catch {
      // Tratado globalmente
    } finally {
      setInativando(false);
    }
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatarData = (dataIso: string) => {
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

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Notificação de Sucesso Local */}
      {mensagemSucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Publicações</h1>
          <p className="text-muted-foreground text-sm">
            Repositório de produções científicas e documentos PDF armazenados no Amazon S3
          </p>
        </div>
        <button
          onClick={() => {
            setErroCriacao(null);
            setMostrarModalCriacao(true);
          }}
          className="px-5 py-2.5 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer shrink-0 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Publicação
        </button>
      </div>

      {/* Barra de Filtros */}
      <form onSubmit={handleBuscar} className="bg-card rounded-2xl p-4 border border-border/30 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Busca por título */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filtrar por título..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm"
            />
          </div>

          {/* Data Início */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">De:</span>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/60"
            />
          </div>

          {/* Data Fim */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">Até:</span>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/60"
            />
          </div>

          {/* Botões de Ação */}
          <div className="md:col-span-1 flex items-center gap-2">
            <button
              type="submit"
              className="p-2 bg-[#ff8c42]/15 text-[#ff8c42] hover:bg-[#ff8c42]/25 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 w-full"
              title="Filtrar"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {(termoBusca || filtroDataInicio || filtroDataFim) && (
          <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs text-muted-foreground">
            <span>Filtros ativos aplicados</span>
            <button
              type="button"
              onClick={limparFiltros}
              className="text-[#ff8c42] hover:underline cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </form>

      {/* Lista de Publicações */}
      {carregando ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
          <span className="text-muted-foreground text-sm">Carregando publicações...</span>
        </div>
      ) : publicacoes.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
          <BookOpen className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold text-lg mb-1">Nenhuma publicação encontrada</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            {termoBusca || filtroDataInicio || filtroDataFim
              ? "Tente ajustar os filtros de título e datas para encontrar o que procura."
              : "Cadastre a primeira publicação vinculando um arquivo PDF que será salvo no Amazon S3."}
          </p>
          {(termoBusca || filtroDataInicio || filtroDataFim) && (
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
          {publicacoes.map((publicacao) => (
            <div
              key={publicacao.id}
              className="bg-card rounded-2xl p-5 border border-border/30 shadow-xs flex flex-col justify-between hover:border-border/60 transition-all duration-200 group"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ff8c42]/10 text-[#ff8c42]">
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </span>
                    {publicacao.projetoTitulo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-border/30 text-muted-foreground truncate max-w-[180px]">
                        <FolderKanban className="w-3 h-3 shrink-0" />
                        <span className="truncate">{publicacao.projetoTitulo}</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setPublicacaoParaInativar(publicacao)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Inativar publicação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Título & Descrição */}
                <h3 className="text-foreground font-semibold text-base mb-2 line-clamp-2 leading-snug">
                  {publicacao.titulo}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                  {publicacao.descricao}
                </p>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatarData(publicacao.dthRegistro)}</span>
                </div>

                <a
                  href={publicacao.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff8c42]/15 text-[#ff8c42] hover:bg-[#ff8c42]/25 font-medium transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/20 text-sm text-muted-foreground">
          <span>
            Página {paginaAtual} de {totalPaginas} ({totalElementos} {totalElementos === 1 ? "publicação" : "publicações"})
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

      {/* Modal de Criação de Publicação */}
      {mostrarModalCriacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Nova Publicação</h2>
                <p className="text-xs text-muted-foreground">O arquivo será armazenado com segurança no Amazon S3</p>
              </div>
              <button
                onClick={() => setMostrarModalCriacao(false)}
                disabled={salvando}
                className="p-2 hover:bg-border/20 rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroCriacao && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroCriacao}</span>
              </div>
            )}

            <form onSubmit={handleCriarPublicacao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Título da Publicação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Análise de Algoritmos Distribuídos"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Descrição / Resumo *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Breve resumo da publicação científica..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  ID do Projeto Vinculado *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Ex: 1"
                  value={novoProjetoId}
                  onChange={(e) => setNovoProjetoId(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm"
                />
              </div>

              {/* Upload do Arquivo PDF */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Arquivo PDF * <span className="text-muted-foreground font-normal">(apenas arquivos .pdf)</span>
                </label>

                {!arquivoPdf ? (
                  <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border/50 hover:border-[#ff8c42]/60 rounded-xl cursor-pointer bg-background/50 hover:bg-background transition-colors group">
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-[#ff8c42] transition-colors mb-2" />
                    <span className="text-sm font-medium text-foreground">Clique para selecionar o PDF</span>
                    <span className="text-xs text-muted-foreground mt-1">Formato exclusivamente PDF</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      required
                      disabled={salvando}
                      onChange={(e) => handleArquivoChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-[#ff8c42] shrink-0" />
                      <div className="truncate text-left">
                        <p className="text-sm font-medium text-foreground truncate">{arquivoPdf.name}</p>
                        <p className="text-xs text-muted-foreground">{formatarTamanho(arquivoPdf.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArquivoPdf(null)}
                      disabled={salvando}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Remover arquivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setMostrarModalCriacao(false)}
                  disabled={salvando}
                  className="px-4 py-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 bg-[#ff8c42] hover:bg-[#ff8c42]/90 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando para o S3...
                    </>
                  ) : (
                    "Cadastrar Publicação"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação */}
      {publicacaoParaInativar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border/30 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-foreground">Inativar Publicação</h3>
              <p className="text-xs text-muted-foreground">
                Tem certeza que deseja inativar a publicação <strong>"{publicacaoParaInativar.titulo}"</strong>? Ela não será mais exibida nas listagens ativas.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPublicacaoParaInativar(null)}
                disabled={inativando}
                className="flex-1 py-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarInativacao}
                disabled={inativando}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {inativando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Inativando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}