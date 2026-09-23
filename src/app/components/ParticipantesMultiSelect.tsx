import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Users, Search, X } from "lucide-react";

export interface ParticipanteOpcao {
  usuarioId: number;
  nome: string;
  email: string;
}

interface ParticipantesMultiSelectProps {
  opcoes: ParticipanteOpcao[];
  selecionadosIds: number[];
  onChange: (novosIds: number[]) => void;
}

export function ParticipantesMultiSelect({
  opcoes,
  selecionadosIds,
  onChange,
}: ParticipantesMultiSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const opcoesFiltradas = opcoes.filter(
    (o) =>
      o.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      o.email.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const toggleItem = (usuarioId: number) => {
    if (selecionadosIds.includes(usuarioId)) {
      onChange(selecionadosIds.filter((id) => id !== usuarioId));
    } else {
      onChange([...selecionadosIds, usuarioId]);
    }
  };

  const selecionarTodos = () => {
    onChange(opcoes.map((o) => o.usuarioId));
  };

  const limparSelecao = () => {
    onChange([]);
  };

  const rotuloTrigger = () => {
    if (selecionadosIds.length === 0) return "Selecione participantes...";
    if (selecionadosIds.length === 1) {
      const p = opcoes.find((o) => o.usuarioId === selecionadosIds[0]);
      return p ? p.nome : "1 participante selecionado";
    }
    return `${selecionadosIds.length} participantes selecionados`;
  };

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${
          aberto
            ? "bg-background border-[#ff8c42]/60 text-foreground ring-2 ring-[#ff8c42]/20"
            : "bg-background border-border/30 hover:border-border/60 text-foreground"
        }`}
      >
        <div className="flex items-center gap-2 truncate text-muted-foreground">
          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className={`truncate text-sm ${selecionadosIds.length > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {rotuloTrigger()}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            aberto ? "rotate-180 text-[#ff8c42]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {aberto && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl bg-card border border-border/60 p-3 shadow-2xl shadow-black/80 z-[9999] animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Busca e Ações Rápidas */}
          <div className="space-y-2 mb-2 pb-2 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background rounded-lg border border-border/30 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>{selecionadosIds.length} de {opcoes.length} selecionado(s)</span>
              <div className="flex items-center gap-2 font-medium">
                <button
                  type="button"
                  onClick={selecionarTodos}
                  className="text-[#ff8c42] hover:underline cursor-pointer"
                >
                  Selecionar Todos
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={limparSelecao}
                  className="hover:underline text-muted-foreground cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Opções */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {opcoesFiltradas.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">
                Nenhum participante encontrado
              </div>
            ) : (
              opcoesFiltradas.map((op) => {
                const estaMarcado = selecionadosIds.includes(op.usuarioId);
                return (
                  <div
                    key={op.usuarioId}
                    onClick={() => toggleItem(op.usuarioId)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-150 ${
                      estaMarcado
                        ? "bg-[#ff8c42]/15 text-foreground font-medium"
                        : "hover:bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <input
                        type="checkbox"
                        checked={estaMarcado}
                        onChange={() => {}}
                        className="rounded border-border/40 text-[#ff8c42] focus:ring-[#ff8c42] shrink-0 pointer-events-none"
                      />
                      <div className="flex flex-col truncate">
                        <span className="text-foreground truncate">{op.nome}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{op.email}</span>
                      </div>
                    </div>

                    {estaMarcado && <Check className="w-3.5 h-3.5 text-[#ff8c42] shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Badges dos selecionados */}
      {selecionadosIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selecionadosIds.map((id) => {
            const p = opcoes.find((o) => o.usuarioId === id);
            if (!p) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#ff8c42]/15 text-[#ff8c42] border border-[#ff8c42]/30 font-medium"
              >
                {p.nome}
                <button
                  type="button"
                  onClick={() => toggleItem(id)}
                  className="hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
