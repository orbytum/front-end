import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType, FormEvent } from "react";
import {
  Telescope,
  Plus,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Building2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  FileText,
  Presentation,
  Coffee,
  Users,
  MapPin,
  Link2,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { EditalService } from "../services/editais/EditalService";
import { EditalResponse } from "../models/dto/editais/Edital";
import { LembreteService } from "../services/lembretes/LembreteService";
import {
  LembreteResponse,
  TIPOS_LEMBRETE,
  type TipoLembrete,
} from "../models/dto/lembretes/Lembrete";
import { nivelEhCoordenadorOuAcima } from "../models/dto/NivelMembro";
import { HttpError } from "../utils/HttpError";
import { DateInput } from "../components/DateInput";

type Aba = "editais" | "eventos";

const TAMANHO_PAGINA = 9;

const FILTROS_EDITAIS_VAZIOS = {
  palavraChave: "",
  organizacao: "",
  dataInicio: "",
  dataFim: "",
};

const FILTROS_EVENTOS_VAZIOS: {
  busca: string;
  tipo: "all" | TipoLembrete;
  dataInicio: string;
  dataFim: string;
} = {
  busca: "",
  tipo: "all",
  dataInicio: "",
  dataFim: "",
};

const CONFIG_TIPO_EVENTO: Record<
  TipoLembrete,
  { icone: ElementType; cor: string; fundo: string }
> = {
  Edital: { icone: FileText, cor: "text-[#f59e0b]", fundo: "bg-[#f59e0b]/20" },
  Reunião: { icone: Coffee, cor: "text-[#4a9eff]", fundo: "bg-[#4a9eff]/20" },
  Apresentação: { icone: Presentation, cor: "text-[#10b981]", fundo: "bg-[#10b981]/20" },
  Workshop: { icone: Users, cor: "text-[#a78bfa]", fundo: "bg-[#a78bfa]/20" },
};

function mensagemDeErro(err: unknown, padrao: string): string {
  if (err instanceof HttpError) return err.response?.mensagem || err.message;
  return padrao;
}

function formatarDataHora(valor?: string | null): string {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarValor(valor?: number | null): string | null {
  if (valor === null || valor === undefined) return null;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusDoEdital(edital: EditalResponse): { rotulo: string; classe: string } {
  const agora = Date.now();
  const abertura = new Date(edital.dthAbertura).getTime();
  const encerramento = new Date(edital.dthEncerramento).getTime();

  if (Number.isFinite(encerramento) && agora > encerramento) {
    return {
      rotulo: "Encerrado",
      classe: "bg-border/30 text-muted-foreground border-border/40",
    };
  }
  if (Number.isFinite(abertura) && agora >= abertura) {
    return {
      rotulo: "Em andamento",
      classe: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
    };
  }
  return {
    rotulo: "Em breve",
    classe: "bg-[#4a9eff]/15 text-[#4a9eff] border-[#4a9eff]/30",
  };
}

function normalizarDataHora(valor: string): string {
  return valor.length === 16 ? `${valor}:00` : valor;
}

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
  rotulo: string;
  onChange: (pagina: number) => void;
}

function Paginacao({ pagina, totalPaginas, totalElementos, rotulo, onChange }: PaginacaoProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        {totalElementos} {rotulo}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className="p-2 rounded-lg bg-card border border-border/40 text-foreground hover:bg-border/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-medium text-foreground whitespace-nowrap">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
          className="p-2 rounded-lg bg-card border border-border/40 text-foreground hover:bg-border/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Editais() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const editalService = useMemo(() => new EditalService(), []);
  const lembreteService = useMemo(() => new LembreteService(), []);

  const grupoId = grupoAtual?.id;
  const podeGerenciar = nivelEhCoordenadorOuAcima(grupoAtual?.nivel);

  const [aba, setAba] = useState<Aba>("editais");
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const [editais, setEditais] = useState<EditalResponse[]>([]);
  const [carregandoEditais, setCarregandoEditais] = useState(false);
  const [erroEditais, setErroEditais] = useState("");
  const [paginaEditais, setPaginaEditais] = useState(1);
  const [totalPaginasEditais, setTotalPaginasEditais] = useState(1);
  const [totalElementosEditais, setTotalElementosEditais] = useState(0);

  const [palavraChave, setPalavraChave] = useState("");
  const [organizacao, setOrganizacao] = useState("");
  const [dataInicioEdital, setDataInicioEdital] = useState("");
  const [dataFimEdital, setDataFimEdital] = useState("");
  const [filtrosEditais, setFiltrosEditais] = useState(FILTROS_EDITAIS_VAZIOS);

  const [eventos, setEventos] = useState<LembreteResponse[]>([]);
  const [carregandoEventos, setCarregandoEventos] = useState(false);
  const [erroEventos, setErroEventos] = useState("");
  const [paginaEventos, setPaginaEventos] = useState(1);
  const [totalPaginasEventos, setTotalPaginasEventos] = useState(1);
  const [totalElementosEventos, setTotalElementosEventos] = useState(0);

  const [termoEvento, setTermoEvento] = useState("");
  const [tipoEvento, setTipoEvento] = useState<"all" | TipoLembrete>("all");
  const [dataInicioEvento, setDataInicioEvento] = useState("");
  const [dataFimEvento, setDataFimEvento] = useState("");
  const [filtrosEventos, setFiltrosEventos] = useState(FILTROS_EVENTOS_VAZIOS);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<EditalResponse | null>(null);
  const [formOrganizador, setFormOrganizador] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formValor, setFormValor] = useState("");
  const [formUri, setFormUri] = useState("");
  const [formAbertura, setFormAbertura] = useState("");
  const [formEncerramento, setFormEncerramento] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [editalParaRemover, setEditalParaRemover] = useState<EditalResponse | null>(null);
  const [removendo, setRemovendo] = useState(false);

  const carregarEditais = useCallback(async () => {
    if (!grupoId) {
      setEditais([]);
      setTotalElementosEditais(0);
      setTotalPaginasEditais(1);
      return;
    }

    setCarregandoEditais(true);
    setErroEditais("");
    try {
      const resposta = await editalService.listar({
        grupoId,
        palavraChave: filtrosEditais.palavraChave,
        organizacao: filtrosEditais.organizacao,
        dataInicio: filtrosEditais.dataInicio,
        dataFim: filtrosEditais.dataFim,
        page: paginaEditais,
        size: TAMANHO_PAGINA,
      });
      const totalPaginas = Math.max(1, resposta.totalPages);
      setEditais(resposta.items);
      setTotalElementosEditais(resposta.totalElements);
      setTotalPaginasEditais(totalPaginas);
      if (totalPaginas > 0 && paginaEditais > totalPaginas) {
        setPaginaEditais(totalPaginas);
      }
    } catch (err) {
      setEditais([]);
      setErroEditais(mensagemDeErro(err, "Erro ao carregar editais."));
    } finally {
      setCarregandoEditais(false);
    }
  }, [grupoId, editalService, filtrosEditais, paginaEditais]);

  const carregarEventos = useCallback(async () => {
    if (!grupoId) {
      setEventos([]);
      setTotalElementosEventos(0);
      setTotalPaginasEventos(1);
      return;
    }

    setCarregandoEventos(true);
    setErroEventos("");
    try {
      const resposta = await lembreteService.listarPorGrupo(grupoId, {
        busca: filtrosEventos.busca,
        tipo: filtrosEventos.tipo === "all" ? undefined : filtrosEventos.tipo,
        dataInicio: filtrosEventos.dataInicio,
        dataFim: filtrosEventos.dataFim,
        page: paginaEventos,
        size: TAMANHO_PAGINA,
      });
      const totalPaginas = Math.max(1, resposta.totalPages);
      setEventos(resposta.items);
      setTotalElementosEventos(resposta.totalElements);
      setTotalPaginasEventos(totalPaginas);
      if (totalPaginas > 0 && paginaEventos > totalPaginas) {
        setPaginaEventos(totalPaginas);
      }
    } catch (err) {
      setEventos([]);
      setErroEventos(mensagemDeErro(err, "Erro ao carregar eventos."));
    } finally {
      setCarregandoEventos(false);
    }
  }, [grupoId, lembreteService, filtrosEventos, paginaEventos]);

  useEffect(() => {
    setPaginaEditais(1);
    setPaginaEventos(1);
    setModalAberto(false);
    setEditando(null);
    setEditalParaRemover(null);
  }, [grupoId]);

  useEffect(() => {
    if (aba === "editais") carregarEditais();
  }, [aba, carregarEditais]);

  useEffect(() => {
    if (aba === "eventos") carregarEventos();
  }, [aba, carregarEventos]);

  const notificarSucesso = (mensagem: string) => {
    setMensagemSucesso(mensagem);
    setTimeout(() => setMensagemSucesso(null), 4500);
  };

  const aplicarFiltrosEditais = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaginaEditais(1);
    setFiltrosEditais({
      palavraChave,
      organizacao,
      dataInicio: dataInicioEdital,
      dataFim: dataFimEdital,
    });
  };

  const limparFiltrosEditais = () => {
    setPalavraChave("");
    setOrganizacao("");
    setDataInicioEdital("");
    setDataFimEdital("");
    setPaginaEditais(1);
    setFiltrosEditais(FILTROS_EDITAIS_VAZIOS);
  };

  const aplicarFiltrosEventos = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaginaEventos(1);
    setFiltrosEventos({
      busca: termoEvento,
      tipo: tipoEvento,
      dataInicio: dataInicioEvento,
      dataFim: dataFimEvento,
    });
  };

  const limparFiltrosEventos = () => {
    setTermoEvento("");
    setTipoEvento("all");
    setDataInicioEvento("");
    setDataFimEvento("");
    setPaginaEventos(1);
    setFiltrosEventos(FILTROS_EVENTOS_VAZIOS);
  };

  const abrirModalCriacao = () => {
    setEditando(null);
    setFormOrganizador("");
    setFormDescricao("");
    setFormValor("");
    setFormUri("");
    setFormAbertura("");
    setFormEncerramento("");
    setErroForm("");
    setModalAberto(true);
  };

  const abrirModalEdicao = (edital: EditalResponse) => {
    setEditando(edital);
    setFormOrganizador(edital.organizador);
    setFormDescricao(edital.descricao);
    setFormValor(edital.valor !== null && edital.valor !== undefined ? String(edital.valor) : "");
    setFormUri(edital.uri);
    setFormAbertura(edital.dthAbertura ? edital.dthAbertura.substring(0, 16) : "");
    setFormEncerramento(
      edital.dthEncerramento ? edital.dthEncerramento.substring(0, 16) : ""
    );
    setErroForm("");
    setModalAberto(true);
  };

  const submeterFormulario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroForm("");

    if (!grupoId) return;

    if (
      !formOrganizador.trim() ||
      !formDescricao.trim() ||
      !formUri.trim() ||
      !formAbertura ||
      !formEncerramento
    ) {
      setErroForm("Preencha organizador, descrição, link e as datas de abertura e encerramento.");
      return;
    }

    if (!/^https?:\/\/.+/.test(formUri.trim())) {
      setErroForm("O link do edital deve começar com http:// ou https://.");
      return;
    }

    if (new Date(formEncerramento) <= new Date(formAbertura)) {
      setErroForm("A data de encerramento deve ser posterior à data de abertura.");
      return;
    }

    let valor: number | null = null;
    if (formValor.trim()) {
      valor = Number(formValor.replace(",", "."));
      if (!Number.isFinite(valor) || valor < 0) {
        setErroForm("Informe um valor válido para o edital.");
        return;
      }
    }

    setSalvando(true);
    try {
      const payload = {
        organizador: formOrganizador.trim(),
        descricao: formDescricao.trim(),
        valor,
        uri: formUri.trim(),
        dthAbertura: normalizarDataHora(formAbertura),
        dthEncerramento: normalizarDataHora(formEncerramento),
      };

      if (editando) {
        await editalService.atualizar(grupoId, editando.id, payload);
        notificarSucesso("Edital atualizado com sucesso.");
      } else {
        await editalService.criar(grupoId, payload);
        notificarSucesso("Edital cadastrado com sucesso.");
      }

      setModalAberto(false);
      await carregarEditais();
    } catch (err) {
      setErroForm(mensagemDeErro(err, "Não foi possível salvar o edital."));
    } finally {
      setSalvando(false);
    }
  };

  const confirmarRemocao = async () => {
    if (!grupoId || !editalParaRemover) return;

    setRemovendo(true);
    try {
      await editalService.remover(grupoId, editalParaRemover.id);
      notificarSucesso("Edital removido do grupo.");
      setEditalParaRemover(null);
      await carregarEditais();
    } catch (err) {
      setErroEditais(mensagemDeErro(err, "Não foi possível remover o edital."));
    } finally {
      setRemovendo(false);
    }
  };

  const filtrosEditaisAtivos =
    !!filtrosEditais.palavraChave ||
    !!filtrosEditais.organizacao ||
    !!filtrosEditais.dataInicio ||
    !!filtrosEditais.dataFim;

  const filtrosEventosAtivos =
    !!filtrosEventos.busca ||
    filtrosEventos.tipo !== "all" ||
    !!filtrosEventos.dataInicio ||
    !!filtrosEventos.dataFim;

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {mensagemSucesso && (
        <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{mensagemSucesso}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold mb-1">Editais e Eventos</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe oportunidades de fomento e eventos do grupo
            {grupoAtual ? ` "${grupoAtual.nome}"` : ""}
          </p>
        </div>
        {aba === "editais" && podeGerenciar && (
          <button
            type="button"
            onClick={abrirModalCriacao}
            disabled={!grupoId}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            Novo Edital
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-border/30">
        <button
          type="button"
          onClick={() => setAba("editais")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
            aba === "editais"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Telescope className="w-4 h-4" />
            Editais
          </span>
        </button>
        <button
          type="button"
          onClick={() => setAba("eventos")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
            aba === "eventos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Eventos
          </span>
        </button>
      </div>

      {aba === "editais" ? (
        <>
          <form
            onSubmit={aplicarFiltrosEditais}
            className="bg-card rounded-2xl p-4 border border-border/30 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Palavra-chave
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar na descrição..."
                    value={palavraChave}
                    onChange={(e) => setPalavraChave(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Organização
                </label>
                <input
                  type="text"
                  placeholder="Ex.: FAPESP, CNPq..."
                  value={organizacao}
                  onChange={(e) => setOrganizacao(e.target.value)}
                  className="w-full px-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Abertura a partir de
                </label>
                <DateInput
                  type="date"
                  value={dataInicioEdital}
                  onChange={setDataInicioEdital}
                  className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Encerramento até
                </label>
                <DateInput
                  type="date"
                  value={dataFimEdital}
                  onChange={setDataFimEdital}
                  className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  title="Filtrar"
                  aria-label="Filtrar editais"
                  className="p-2 w-full bg-primary/15 text-primary hover:bg-primary/25 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filtrosEditaisAtivos && (
              <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs text-muted-foreground">
                <span>Filtros ativos aplicados</span>
                <button
                  type="button"
                  onClick={limparFiltrosEditais}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </form>

          {erroEditais && (
            <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroEditais}</span>
              </div>
              <button
                type="button"
                onClick={() => setErroEditais("")}
                className="p-1 rounded-lg hover:bg-[#ef4444]/20 transition-colors cursor-pointer"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {carregandoGrupos || carregandoEditais ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-muted-foreground text-sm">Carregando editais...</span>
            </div>
          ) : !grupoId ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
              <Telescope className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-foreground font-semibold text-lg mb-1">
                Nenhum grupo selecionado
              </h3>
              <p className="text-muted-foreground text-sm">
                Selecione um grupo de pesquisa no cabeçalho para visualizar os editais.
              </p>
            </div>
          ) : editais.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
              <Telescope className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-foreground font-semibold text-lg mb-1">
                {filtrosEditaisAtivos
                  ? "Nenhum edital encontrado"
                  : "Nenhum edital cadastrado"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                {filtrosEditaisAtivos
                  ? "Tente ajustar os filtros de palavra-chave, organização e datas."
                  : podeGerenciar
                  ? "Cadastre o primeiro edital de fomento do grupo."
                  : "Ainda não há editais vinculados a este grupo."}
              </p>
              {filtrosEditaisAtivos ? (
                <button
                  type="button"
                  onClick={limparFiltrosEditais}
                  className="px-4 py-2 bg-border/20 text-foreground hover:bg-border/30 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              ) : (
                podeGerenciar && (
                  <button
                    type="button"
                    onClick={abrirModalCriacao}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cadastrar Edital
                  </button>
                )
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {editais.map((edital) => {
                  const status = statusDoEdital(edital);
                  const valorFormatado = formatarValor(edital.valor);
                  return (
                    <div
                      key={edital.id}
                      className="bg-card rounded-2xl p-5 border border-border/30 flex flex-col justify-between hover:border-border/60 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.classe}`}
                          >
                            {status.rotulo}
                          </span>
                          {valorFormatado && (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                              <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                              {valorFormatado}
                            </span>
                          )}
                        </div>

                        <h3 className="text-foreground font-semibold text-base mb-2 line-clamp-3 leading-snug">
                          {edital.descricao}
                        </h3>

                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate" title={edital.organizador}>
                              {edital.organizador}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              {formatarDataHora(edital.dthAbertura)} até{" "}
                              {formatarDataHora(edital.dthEncerramento)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border/20 space-y-3">
                        <a
                          href={edital.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[260px]">{edital.uri}</span>
                        </a>

                        {podeGerenciar && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => abrirModalEdicao(edital)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-border/20 text-foreground hover:bg-border/30 text-xs font-medium transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditalParaRemover(edital)}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 text-xs font-medium transition-colors cursor-pointer"
                              aria-label="Remover edital"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Paginacao
                pagina={paginaEditais}
                totalPaginas={totalPaginasEditais}
                totalElementos={totalElementosEditais}
                rotulo={totalElementosEditais === 1 ? "edital encontrado" : "editais encontrados"}
                onChange={setPaginaEditais}
              />
            </>
          )}
        </>
      ) : (
        <>
          <form
            onSubmit={aplicarFiltrosEventos}
            className="bg-card rounded-2xl p-4 border border-border/30 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Nome do evento
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou descrição..."
                    value={termoEvento}
                    onChange={(e) => setTermoEvento(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Tipo
                </label>
                <select
                  value={tipoEvento}
                  onChange={(e) => setTipoEvento(e.target.value as "all" | TipoLembrete)}
                  className="w-full px-4 py-2 bg-background rounded-xl border border-border/40 text-foreground focus:outline-none focus:border-primary/60 text-sm cursor-pointer"
                >
                  <option value="all">Todos os tipos</option>
                  {TIPOS_LEMBRETE.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  A partir de
                </label>
                <DateInput
                  type="date"
                  value={dataInicioEvento}
                  onChange={setDataInicioEvento}
                  className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Até
                </label>
                <DateInput
                  type="date"
                  value={dataFimEvento}
                  onChange={setDataFimEvento}
                  className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  title="Filtrar"
                  aria-label="Filtrar eventos"
                  className="p-2 w-full bg-primary/15 text-primary hover:bg-primary/25 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filtrosEventosAtivos && (
              <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs text-muted-foreground">
                <span>Filtros ativos aplicados</span>
                <button
                  type="button"
                  onClick={limparFiltrosEventos}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </form>

          {erroEventos && (
            <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroEventos}</span>
              </div>
              <button
                type="button"
                onClick={() => setErroEventos("")}
                className="p-1 rounded-lg hover:bg-[#ef4444]/20 transition-colors cursor-pointer"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {carregandoGrupos || carregandoEventos ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-muted-foreground text-sm">Carregando eventos...</span>
            </div>
          ) : !grupoId ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
              <Calendar className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-foreground font-semibold text-lg mb-1">
                Nenhum grupo selecionado
              </h3>
              <p className="text-muted-foreground text-sm">
                Selecione um grupo de pesquisa no cabeçalho para visualizar os eventos.
              </p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/30 p-6">
              <Calendar className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-foreground font-semibold text-lg mb-1">
                {filtrosEventosAtivos
                  ? "Nenhum evento encontrado"
                  : "Nenhum evento cadastrado"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                {filtrosEventosAtivos
                  ? "Tente ajustar os filtros de nome, tipo e datas."
                  : "Os eventos cadastrados no grupo aparecerão aqui."}
              </p>
              {filtrosEventosAtivos && (
                <button
                  type="button"
                  onClick={limparFiltrosEventos}
                  className="px-4 py-2 bg-border/20 text-foreground hover:bg-border/30 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {eventos.map((evento) => {
                  const config = CONFIG_TIPO_EVENTO[evento.tipo];
                  const IconeTipo = config.icone;
                  return (
                    <div
                      key={evento.id}
                      className="bg-card rounded-2xl p-5 border border-border/30 flex flex-col justify-between hover:border-border/60 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.fundo} ${config.cor}`}
                          >
                            <IconeTipo className="w-3.5 h-3.5" />
                            {evento.tipo}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatarDataHora(evento.proximaOcorrencia || evento.dataHora)}
                          </span>
                        </div>

                        <h3 className="text-foreground font-semibold text-base mb-2 line-clamp-2 leading-snug">
                          {evento.titulo}
                        </h3>
                        {evento.descricao && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-3 leading-relaxed">
                            {evento.descricao}
                          </p>
                        )}

                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          {evento.organizador && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{evento.organizador}</span>
                            </div>
                          )}
                          {evento.localizacao && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{evento.localizacao}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {evento.link && (
                        <div className="pt-3 mt-3 border-t border-border/20">
                          <a
                            href={evento.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
                          >
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[260px]">{evento.link}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Paginacao
                pagina={paginaEventos}
                totalPaginas={totalPaginasEventos}
                totalElementos={totalElementosEventos}
                rotulo={totalElementosEventos === 1 ? "evento encontrado" : "eventos encontrados"}
                onChange={setPaginaEventos}
              />
            </>
          )}
        </>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card rounded-2xl border border-border/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border/30">
              <div>
                <h2 className="text-foreground font-bold text-lg">
                  {editando ? "Editar Edital" : "Novo Edital"}
                </h2>
                <p className="text-muted-foreground text-xs mt-1">
                  {editando
                    ? "Atualize as informações do edital vinculado ao grupo."
                    : "Cadastre um edital de fomento para o grupo."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submeterFormulario} className="p-5 space-y-4">
              {erroForm && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center gap-2 text-sm text-[#ef4444]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroForm}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Organização *
                </label>
                <input
                  type="text"
                  value={formOrganizador}
                  onChange={(e) => setFormOrganizador(e.target.value)}
                  placeholder="Ex.: FAPESP, CNPq, CAPES..."
                  className="w-full px-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Descrição *
                </label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  rows={4}
                  placeholder="Descreva o edital, requisitos e áreas contempladas..."
                  className="w-full px-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Link do edital *
                  </label>
                  <input
                    type="url"
                    value={formUri}
                    onChange={(e) => setFormUri(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-background rounded-xl border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Abertura *
                  </label>
                  <DateInput
                    type="datetime-local"
                    value={formAbertura}
                    onChange={setFormAbertura}
                    className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Encerramento *
                  </label>
                  <DateInput
                    type="datetime-local"
                    value={formEncerramento}
                    onChange={setFormEncerramento}
                    className="w-full px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-4 py-2 bg-border/20 text-foreground hover:bg-border/30 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  {salvando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {editando ? "Salvar Alterações" : "Cadastrar Edital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editalParaRemover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card rounded-2xl border border-border/40 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#ef4444]/10 text-[#ef4444]">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2 className="text-foreground font-bold text-lg">Remover edital</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Tem certeza que deseja remover o edital{" "}
              <span className="text-foreground font-medium">
                "{editalParaRemover.descricao}"
              </span>{" "}
              do grupo?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditalParaRemover(null)}
                disabled={removendo}
                className="px-4 py-2 bg-border/20 text-foreground hover:bg-border/30 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRemocao}
                disabled={removendo}
                className="px-4 py-2 bg-[#ef4444] text-white hover:bg-[#ef4444]/90 disabled:opacity-60 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                {removendo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}