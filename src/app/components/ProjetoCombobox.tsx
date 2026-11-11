import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, FolderKanban, Loader2, Clock, CheckCircle2, AlertCircle, Circle, Star } from "lucide-react";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";

interface ProjetoComboboxProps {
  projetos: ProjetoResponse[];
  projetoSelecionado: ProjetoResponse | null;
  onSelecionarProjeto: (projeto: ProjetoResponse) => void;
  carregando?: boolean;
}

export function ProjetoCombobox({
  projetos,
  projetoSelecionado,
  onSelecionarProjeto,
  carregando = false,
}: ProjetoComboboxProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border/40 bg-background/50 text-muted-foreground text-sm font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-[#ff8c42]" />
        <span>Carregando projetos...</span>
      </div>
    );
  }

  if (projetos.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border/40 bg-background/50 text-muted-foreground text-sm font-medium">
        <FolderKanban className="w-5 h-5 text-muted-foreground" />
        <span>Nenhum projeto no grupo</span>
      </div>
    );
  }

  const handleSelecionar = (projeto: ProjetoResponse) => {
    onSelecionarProjeto(projeto);
    setAberto(false);
  };

  const obterIconeStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONCLUIDA":
      case "CONCLUÍDO":
      case "CONCLUIDO":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "EM_ANDAMENTO":
      case "EM ANDAMENTO":
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "ATRASADA":
      case "ATRASADO":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const obterCorStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONCLUIDA":
      case "CONCLUÍDO":
      case "CONCLUIDO":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "EM_ANDAMENTO":
      case "EM ANDAMENTO":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "ATRASADA":
      case "ATRASADO":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-muted text-muted-foreground border-border/40";
    }
  };

  return (
    <div className="relative inline-block text-left max-w-full z-10" ref={containerRef}>
      {/* Botão Principal Trigger */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
          aberto
            ? "bg-background border-[#ff8c42]/80 text-foreground shadow-lg shadow-[#ff8c42]/10"
            : "bg-background/70 hover:bg-background border-border/50 hover:border-[#ff8c42]/50 text-foreground"
        }`}
        title="Alternar projeto selecionado"
        aria-expanded={aberto}
      >
        <div className="w-8 h-8 rounded-lg bg-[#ff8c42]/15 flex items-center justify-center text-[#ff8c42] shrink-0 shadow-xs">
          <FolderKanban className="w-4 h-4" />
        </div>

        <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate max-w-[280px] sm:max-w-md">
          {projetoSelecionado?.titulo || "Selecione um projeto"}
        </span>

        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
            aberto ? "rotate-180 text-[#ff8c42]" : ""
          }`}
        />
      </button>

      {/* Popover Menu Suspenso */}
      {aberto && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 origin-top-left rounded-2xl bg-card border border-border/60 p-2 shadow-2xl shadow-black/80 z-40 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border/40 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Projetos do Grupo
            </span>
            <span className="text-[11px] font-semibold text-[#ff8c42] px-2 py-0.5 rounded-full bg-[#ff8c42]/10">
              {projetos.length} {projetos.length === 1 ? "projeto" : "projetos"}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {projetos.map((proj) => {
              const selecionado = proj.id === projetoSelecionado?.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => handleSelecionar(proj)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer ${
                    selecionado
                      ? "bg-[#ff8c42]/15 text-[#ff8c42] font-semibold border border-[#ff8c42]/30"
                      : "text-foreground hover:bg-background/80 hover:text-foreground border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {proj.isFavorito && (
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" fill="currentColor" />
                    )}
                    <span className="truncate text-sm font-medium">{proj.titulo}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium ${obterCorStatusBadge(
                        proj.status
                      )}`}
                    >
                      {obterIconeStatus(proj.status)}
                      {proj.status.replaceAll("_", " ")}
                    </span>
                    {selecionado && <Check className="w-4 h-4 text-[#ff8c42]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
