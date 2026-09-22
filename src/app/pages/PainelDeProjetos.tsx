import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FolderKanban,
  BookOpen,
  LayoutDashboard,
  Loader2,
  ChevronDown,
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Layers,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";
import { Publicacoes } from "./Publicacoes";
import { ProjetoCombobox } from "../components/ProjetoCombobox";

type TabId = "publicacoes" | "visao-geral" | "atividades" | "materiais";

export function PainelDeProjetos() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const projetoService = useMemo(() => new ProjetoService(), []);

  const [projetos, setProjetos] = useState<ProjetoResponse[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoResponse | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<TabId>("publicacoes");

  // Carrega projetos quando o grupo atual mudar
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
        // Preserva seleção atual se ainda estiver na lista, ou seleciona o primeiro
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

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  const obterIconeStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONCLUIDA":
      case "CONCLUÍDO":
      case "CONCLUIDO":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "EM_ANDAMENTO":
      case "EM ANDAMENTO":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "ATRASADA":
      case "ATRASADO":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const obterCorStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONCLUIDA":
      case "CONCLUÍDO":
      case "CONCLUIDO":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "EM_ANDAMENTO":
      case "EM ANDAMENTO":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "ATRASADA":
      case "ATRASADO":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border/40";
    }
  };

  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return "N/A";
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
      {/* Cabeçalho do Painel & Seletor de Projeto */}
      <div className="bg-card rounded-2xl p-6 border border-border/30 shadow-xs space-y-5">
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
                ? `Grupo de Pesquisa: ${grupoAtual.nome} ${
                    grupoAtual.isLider ? "(Líder)" : ""
                  }`
                : "Selecione um grupo no cabeçalho"}
            </p>
          </div>
        </div>

        {/* Detalhes rápidos do Projeto Selecionado */}
        {projetoSelecionado && (
          <div className="pt-4 border-t border-border/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold ${obterCorStatusBadge(
                  projetoSelecionado.status
                )}`}
              >
                {obterIconeStatus(projetoSelecionado.status)}
                {projetoSelecionado.status.replaceAll("_", " ")}
              </span>
              {projetoSelecionado.assunto && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <strong>Descrição:</strong> {projetoSelecionado.assunto}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>
                Criado em: {formatarData(projetoSelecionado.dthRegistro)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Se houver projeto selecionado, exibe Abas e Conteúdo */}
      {projetoSelecionado ? (
        <div className="space-y-6">
          {/* Navegação por Abas */}
          <div className="flex border-b border-border/30 gap-1 overflow-x-auto">
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
                      {projetoSelecionado.status}
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
                </div>
              </div>
            )}

            {abaAtiva === "atividades" && (
              <div className="bg-card rounded-2xl p-12 border border-border/30 text-center space-y-3">
                <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                <h3 className="text-foreground font-semibold text-base">
                  Aba de Atividades em breve
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Esta aba exibirá as atividades e tarefas vinculadas ao projeto "{projetoSelecionado.titulo}".
                </p>
              </div>
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
        </div>
      )}
    </div>
  );
}
