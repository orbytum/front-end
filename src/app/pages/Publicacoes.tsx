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
  Pencil,
  Link2,
} from "lucide-react";
import { PublicacaoService } from "../services/publicacoes/PublicacaoService";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { AuthService } from "../services/auth/AuthService";
import { useGrupo } from "../contexts/GrupoContext";
import { PublicacaoResponse, TIPOS_PUBLICACAO } from "../models/dto/publicacoes/Publicacao";
import { ParticipanteProjetoResponse } from "../models/dto/projetos/ParticipanteProjeto";
import {
  nivelEhColaborador,
  nivelEhLider,
} from "../models/dto/NivelMembro";
import { DateInput } from "../components/DateInput";
import { Seletor } from "../components/Seletor";

export interface PublicacoesProps {
  projetoId?: number;
  projetoTitulo?: string;
  ocultarCabecalho?: boolean;
}

export function Publicacoes({
  projetoId,
  projetoTitulo,
  ocultarCabecalho = false,
}: PublicacoesProps = {}) {
  const publicacaoService = useMemo(() => new PublicacaoService(), []);
  const projetoService = useMemo(() => new ProjetoService(), []);
  const authService = useMemo(() => new AuthService(), []);
  const { grupoAtual } = useGrupo();

  const [participantesProjeto, setParticipantesProjeto] = useState<ParticipanteProjetoResponse[]>([]);
  const usuarioEmail = (authService.getUserEmail() || "").toLowerCase();
  const isAdmin = authService.isAdminOrInitialAdmin();
  const isColaborador = nivelEhColaborador(grupoAtual?.nivel);
  const isLiderProjeto = participantesProjeto.some(
    (participante) => participante.nivel === "LIDER"
      && (participante.email || "").toLowerCase() === usuarioEmail
  );
  const podeGerenciar = !isColaborador
    && (isAdmin || nivelEhLider(grupoAtual?.nivel) || isLiderProjeto);

  useEffect(() => {
    if (!projetoId) {
      setParticipantesProjeto([]);
      return;
    }
    projetoService
      .listarParticipantes(projetoId)
      .then(setParticipantesProjeto)
      .catch(() => setParticipantesProjeto([]));
  }, [projetoId, projetoService]);

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
  const [novoProjetoId, setNovoProjetoId] = useState<string>(
    projetoId ? String(projetoId) : ""
  );
  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [novoTipo, setNovoTipo] = useState<string>(TIPOS_PUBLICACAO[0]);
  const [novaDataPublicacao, setNovaDataPublicacao] = useState("");
  const [novoLink, setNovoLink] = useState("");

  // Modal de Edição
  const [publicacaoParaEditar, setPublicacaoParaEditar] =
    useState<PublicacaoResponse | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editArquivoPdf, setEditArquivoPdf] = useState<File | null>(null);
  const [editTipo, setEditTipo] = useState<string>(TIPOS_PUBLICACAO[0]);
  const [editDataPublicacao, setEditDataPublicacao] = useState("");
  const [editLink, setEditLink] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  // Modal de Confirmação de Inativação
  const [publicacaoParaInativar, setPublicacaoParaInativar] =
    useState<PublicacaoResponse | null>(null);
  const [inativando, setInativando] = useState(false);

  // Feedback de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Atualiza novoProjetoId quando projetoId prop mudar
  useEffect(() => {
    if (projetoId) {
      setNovoProjetoId(String(projetoId));
    }
  }, [projetoId]);

  const carregarPublicacoes = useCallback(async () => {
    if (!projetoId && !novoProjetoId && !grupoAtual?.id) {
      setPublicacoes([]);
      setTotalElementos(0);
      setTotalPaginas(1);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const targetProjetoId = projetoId ?? (novoProjetoId ? Number(novoProjetoId) : undefined);
      const response = await publicacaoService.listarPublicacoes({
        page: paginaAtual,
        size: tamanhoPagina,
        titulo: termoBusca.trim() || undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim: filtroDataFim || undefined,
        projetoId: targetProjetoId,
        grupoId: targetProjetoId ? undefined : grupoAtual?.id,
      });

      setPublicacoes(response.items);
      setTotalElementos(response.totalElements);
      setTotalPaginas(response.totalPages);
    } catch {
      // O erro já é tratado e despachado globalmente pelo BaseService / TratarExcecao
    } finally {
      setCarregando(false);
    }
  }, [
    publicacaoService,
    paginaAtual,
    termoBusca,
    filtroDataInicio,
    filtroDataFim,
    projetoId,
    novoProjetoId,
    grupoAtual?.id,
  ]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [projetoId]);

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

    const targetProjetoId = projetoId ?? Number(novoProjetoId);

    if (!novoTitulo.trim()) {
      setErroCriacao("O título da publicação é obrigatório.");
      return;
    }
    if (!novaDescricao.trim()) {
      setErroCriacao("A descrição da publicação é obrigatória.");
      return;
    }
    if (!targetProjetoId || isNaN(targetProjetoId) || targetProjetoId <= 0) {
      setErroCriacao("Informe um projeto válido.");
      return;
    }
    if (!arquivoPdf) {
      setErroCriacao("O arquivo PDF da publicação é obrigatório.");
      return;
    }
    if (!novaDataPublicacao) {
      setErroCriacao("A data da publicação é obrigatória.");
      return;
    }
    if (novoLink.trim() && !/^https?:\/\/\S+$/.test(novoLink.trim())) {
      setErroCriacao("O link deve começar com http:// ou https://.");
      return;
    }

    setSalvando(true);
    try {
      await publicacaoService.criarPublicacao({
        titulo: novoTitulo.trim(),
        descricao: novaDescricao.trim(),
        projetoId: targetProjetoId,
        arquivo: arquivoPdf,
        tipo: novoTipo,
        dataPublicacao: novaDataPublicacao,
        link: novoLink.trim() || undefined,
      });

      setMensagemSucesso(
        "Publicação criada com sucesso!"
      );
      setTimeout(() => setMensagemSucesso(null), 4000);

      // Limpar formulário e fechar modal
      setNovoTitulo("");
      setNovaDescricao("");
      if (!projetoId) setNovoProjetoId("");
      setArquivoPdf(null);
      setNovoTipo(TIPOS_PUBLICACAO[0]);
      setNovaDataPublicacao("");
      setNovoLink("");
      setMostrarModalCriacao(false);

      // Recarregar lista
      setPaginaAtual(1);
      carregarPublicacoes();
    } catch (err: any) {
      const msg =
        err?.response?.mensagem ||
        err?.message ||
        "Erro ao criar publicação.";
      setErroCriacao(msg);
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicaoPublicacao = (publicacao: PublicacaoResponse) => {
    setPublicacaoParaEditar(publicacao);
    setEditTitulo(publicacao.titulo);
    setEditDescricao(publicacao.descricao);
    setEditArquivoPdf(null);
    setEditTipo(publicacao.tipo || TIPOS_PUBLICACAO[0]);
    setEditDataPublicacao(publicacao.dataPublicacao || "");
    setEditLink(publicacao.link || "");
    setErroEdicao(null);
  };

  const handleEditArquivoChange = (file: File | null) => {
    setErroEdicao(null);
    if (!file) {
      setEditArquivoPdf(null);
      return;
    }
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErroEdicao("A publicação deve ser exclusivamente no formato PDF.");
      setEditArquivoPdf(null);
      return;
    }
    setEditArquivoPdf(file);
  };

  const handleAtualizarPublicacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicacaoParaEditar) return;

    setErroEdicao(null);
    if (!editTitulo.trim()) {
      setErroEdicao("O título da publicação é obrigatório.");
      return;
    }
    if (!editDescricao.trim()) {
      setErroEdicao("A descrição da publicação é obrigatória.");
      return;
    }
    if (!editDataPublicacao) {
      setErroEdicao("A data da publicação é obrigatória.");
      return;
    }
    if (editLink.trim() && !/^https?:\/\/\S+$/.test(editLink.trim())) {
      setErroEdicao("O link deve começar com http:// ou https://.");
      return;
    }

    setSalvandoEdicao(true);
    try {
      await publicacaoService.atualizarPublicacao(publicacaoParaEditar.id, {
        titulo: editTitulo.trim(),
        descricao: editDescricao.trim(),
        projetoId: publicacaoParaEditar.projetoId ?? undefined,
        arquivo: editArquivoPdf,
        tipo: editTipo,
        dataPublicacao: editDataPublicacao,
        link: editLink.trim(),
      });
      setMensagemSucesso("Publicação atualizada com sucesso!");
      setTimeout(() => setMensagemSucesso(null), 4000);
      setPublicacaoParaEditar(null);
      carregarPublicacoes();
    } catch (err: any) {
      setErroEdicao(
        err?.response?.mensagem ||
        err?.message ||
        "Erro ao atualizar publicação."
      );
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const abrirPdfPublicacao = async (publicacao: PublicacaoResponse) => {
    if (!publicacao.uuid) {
      window.open(publicacao.url, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const blob = await publicacaoService.baixarArquivo(publicacao.uuid);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      // O erro já é tratado globalmente pelo BaseService / TratarExcecao
    }
  };

  const handleConfirmarInativacao = async () => {
    if (!publicacaoParaInativar) return;

    setInativando(true);
    try {
      await publicacaoService.inativarPublicacao(publicacaoParaInativar.id);
      setMensagemSucesso(
        `Publicação "${publicacaoParaInativar.titulo}" inativada com sucesso.`
      );
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

  const formatarDataSimples = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
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
    <div className="space-y-6">
      {/* Notificação de Sucesso Local */}
      {mensagemSucesso && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {!ocultarCabecalho && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 empty:hidden">
          {podeGerenciar && (
            <button
              onClick={() => {
                setErroCriacao(null);
                setMostrarModalCriacao(true);
              }}
              className="px-5 py-2.5 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nova Publicação
            </button>
          )}
        </div>
      )}

      {ocultarCabecalho && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#ff8c42]" />
            <h2 className="text-lg font-bold text-foreground">
              Publicações do Projeto
            </h2>
            {totalElementos > 0 && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#ff8c42]/10 text-[#ff8c42]">
                {totalElementos}
              </span>
            )}
          </div>
          {podeGerenciar && (
            <button
              onClick={() => {
                setErroCriacao(null);
                setMostrarModalCriacao(true);
              }}
              className="px-4 py-2 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer shrink-0 shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Publicação
            </button>
          )}
        </div>
      )}

      {/* Barra de Filtros */}
      <form
        onSubmit={handleBuscar}
        className="bg-card rounded-lg p-4 border border-border/30 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Busca por título */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filtrar por título..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm"
            />
          </div>

          {/* Data Início */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
              De:
            </span>
            <DateInput
              type="date"
              value={filtroDataInicio}
              onChange={setFiltroDataInicio}
              className="w-full px-3 py-2 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/60"
            />
          </div>

          {/* Data Fim */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
              Até:
            </span>
            <DateInput
              type="date"
              value={filtroDataFim}
              onChange={setFiltroDataFim}
              className="w-full px-3 py-2 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/60"
            />
          </div>

          {/* Botões de Ação */}
          <div className="md:col-span-1 flex items-center gap-2">
            <button
              type="submit"
              className="p-2 bg-[#ff8c42]/15 text-[#ff8c42] hover:bg-[#ff8c42]/25 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0 w-full"
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
          <span className="text-muted-foreground text-sm">
            Carregando publicações...
          </span>
        </div>
      ) : publicacoes.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border/30 p-6">
          <BookOpen className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold text-lg mb-1">
            Nenhuma publicação encontrada
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            {termoBusca || filtroDataInicio || filtroDataFim
              ? "Tente ajustar os filtros de título e datas para encontrar o que procura."
              : projetoTitulo
              ? `Nenhuma publicação cadastrada para o projeto "${projetoTitulo}".`
              : "Cadastre a primeira publicação vinculando um arquivo PDF."}
          </p>
          {(termoBusca || filtroDataInicio || filtroDataFim) && (
            <button
              onClick={limparFiltros}
              className="px-4 py-2 bg-border/20 text-foreground hover:bg-border/30 rounded-lg text-sm transition-colors cursor-pointer"
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
              className="bg-card rounded-lg p-5 border border-border/30 shadow-xs flex flex-col justify-between hover:border-border/60 transition-all duration-200 group"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ff8c42]/10 text-[#ff8c42]">
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </span>
                    {(publicacao.projetoTitulo || projetoTitulo) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-border/30 text-muted-foreground truncate max-w-[180px]">
                        <FolderKanban className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {publicacao.projetoTitulo || projetoTitulo}
                        </span>
                      </span>
                    )}
                  </div>
                  {podeGerenciar && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirEdicaoPublicacao(publicacao)}
                        className="p-1.5 text-muted-foreground hover:text-[#ff8c42] hover:bg-[#ff8c42]/10 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Editar publicação"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPublicacaoParaInativar(publicacao)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Inativar publicação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Título & Descrição */}
                {publicacao.tipo && (
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/20">
                    {publicacao.tipo}
                  </span>
                )}
                <h3 className="text-foreground font-semibold text-base mb-2 line-clamp-2 leading-snug">
                  {publicacao.titulo}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                  {publicacao.descricao}
                </p>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground gap-2">
                <div className="flex items-center gap-1.5" title={publicacao.dataPublicacao ? "Data da publicação" : "Data de cadastro"}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {publicacao.dataPublicacao
                      ? formatarDataSimples(publicacao.dataPublicacao)
                      : formatarData(publicacao.dthRegistro)}
                  </span>
                </div>

                {publicacao.link && (
                  <a
                    href={publicacao.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Link
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => abrirPdfPublicacao(publicacao)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff8c42]/15 text-[#ff8c42] hover:bg-[#ff8c42]/25 font-medium transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/20 text-sm text-muted-foreground">
          <span>
            Página {paginaAtual} de {totalPaginas} ({totalElementos}{" "}
            {totalElementos === 1 ? "publicação" : "publicações"})
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
              onClick={() =>
                setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
              }
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
          <div className="w-full max-w-lg bg-card rounded-lg border border-border/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Nova Publicação
                </h2>
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
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs flex items-center gap-2">
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
                  maxLength={100}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm"
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
                  maxLength={1000}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Tipo *
                  </label>
                  <Seletor
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value)}
                    disabled={salvando}
                    className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  >
                    {TIPOS_PUBLICACAO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    {!TIPOS_PUBLICACAO.includes(novoTipo as (typeof TIPOS_PUBLICACAO)[number]) && (
                      <option value={novoTipo}>{novoTipo}</option>
                    )}
                  </Seletor>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Data da publicação *
                  </label>
                  <DateInput
                    type="date"
                    value={novaDataPublicacao}
                    onChange={setNovaDataPublicacao}
                    className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Link{" "}
                  <span className="text-muted-foreground font-normal">(opcional, ex.: DOI)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://doi.org/..."
                  value={novoLink}
                  onChange={(e) => setNovoLink(e.target.value)}
                  disabled={salvando}
                  className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              {/* Projeto Vinculado */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Projeto *
                </label>
                {projetoId ? (
                  <div className="w-full px-3.5 py-2.5 bg-muted/40 rounded-lg border border-border/40 text-foreground text-sm font-medium flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-[#ff8c42]" />
                    <span>{projetoTitulo || `Projeto #${projetoId}`}</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Ex: 1"
                    value={novoProjetoId}
                    onChange={(e) => setNovoProjetoId(e.target.value)}
                    disabled={salvando}
                    className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 text-sm"
                  />
                )}
              </div>

              {/* Upload do Arquivo PDF */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Arquivo PDF *{" "}
                  <span className="text-muted-foreground font-normal">
                    (apenas arquivos .pdf)
                  </span>
                </label>

                {!arquivoPdf ? (
                  <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border/50 hover:border-[#ff8c42]/60 rounded-lg cursor-pointer bg-background/50 hover:bg-background transition-colors group">
                    <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-[#ff8c42] transition-colors mb-2" />
                    <span className="text-sm font-medium text-foreground">
                      Clique para selecionar o PDF
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Formato exclusivamente PDF
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      required
                      disabled={salvando}
                      onChange={(e) =>
                        handleArquivoChange(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/40">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-[#ff8c42] shrink-0" />
                      <div className="truncate text-left">
                        <p className="text-sm font-medium text-foreground truncate">
                          {arquivoPdf.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatarTamanho(arquivoPdf.size)}
                        </p>
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
                  className="px-4 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 bg-[#ff8c42] hover:bg-[#ff8c42]/90 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
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

      {/* Modal de Edição de Publicação */}
      {publicacaoParaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-card rounded-lg border border-border/30 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Editar Publicação</h2>
              <button
                onClick={() => setPublicacaoParaEditar(null)}
                disabled={salvandoEdicao}
                className="p-2 hover:bg-border/20 rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroEdicao && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroEdicao}</span>
              </div>
            )}

            <form onSubmit={handleAtualizarPublicacao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Título da Publicação *
                </label>
                <input
                  type="text"
                  required
                  value={editTitulo}
                  maxLength={100}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  disabled={salvandoEdicao}
                  className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Descrição / Resumo *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editDescricao}
                  maxLength={1000}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  disabled={salvandoEdicao}
                  className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/60 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Tipo *
                  </label>
                  <Seletor
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value)}
                    disabled={salvandoEdicao}
                    className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  >
                    {TIPOS_PUBLICACAO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    {!TIPOS_PUBLICACAO.includes(editTipo as (typeof TIPOS_PUBLICACAO)[number]) && (
                      <option value={editTipo}>{editTipo}</option>
                    )}
                  </Seletor>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Data da publicação *
                  </label>
                  <DateInput
                    type="date"
                    value={editDataPublicacao}
                    onChange={setEditDataPublicacao}
                    className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Link{" "}
                  <span className="text-muted-foreground font-normal">(opcional, ex.: DOI)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://doi.org/..."
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  disabled={salvandoEdicao}
                  className="w-full px-3.5 py-2.5 bg-background rounded-lg border border-border/40 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Substituir PDF{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={salvandoEdicao}
                  onChange={(e) => handleEditArquivoChange(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted-foreground file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#ff8c42]/15 file:text-[#ff8c42] file:font-medium hover:file:bg-[#ff8c42]/25"
                />
                {editArquivoPdf && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Novo arquivo: {editArquivoPdf.name}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setPublicacaoParaEditar(null)}
                  disabled={salvandoEdicao}
                  className="px-4 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="px-5 py-2 bg-[#ff8c42] hover:bg-[#ff8c42]/90 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                >
                  {salvandoEdicao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação */}
      {publicacaoParaInativar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card rounded-lg border border-border/30 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Inativar Publicação
              </h3>
              <p className="text-xs text-muted-foreground">
                Tem certeza que deseja inativar a publicação{" "}
                <strong>"{publicacaoParaInativar.titulo}"</strong>? Ela não será
                mais exibida nas listagens ativas.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPublicacaoParaInativar(null)}
                disabled={inativando}
                className="flex-1 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-border/20 text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarInativacao}
                disabled={inativando}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
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