import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Users, Loader2 } from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { MeuGrupoResponse } from "../models/dto/grupos/MeuGrupo";

export function GrupoCombobox() {
  const { grupoAtual, meusGrupos, carregandoGrupos, selecionarGrupo } = useGrupo();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  if (carregandoGrupos) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2e2e2e]/40 bg-[#121212]/50 text-xs text-[#9e9e9e]">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff8c42]" />
        <span>Carregando grupo...</span>
      </div>
    );
  }

  if (!grupoAtual || meusGrupos.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2e2e2e]/40 bg-[#121212]/50 text-xs text-[#9e9e9e]">
        <Users className="w-3.5 h-3.5 text-[#9e9e9e]" />
        <span>Sem grupo vinculado</span>
      </div>
    );
  }

  const handleSelecionar = (grupo: MeuGrupoResponse) => {
    selecionarGrupo(grupo);
    setAberto(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
          aberto
            ? "bg-[#121212] border-[#ff8c42]/60 text-white shadow-md shadow-[#ff8c42]/5"
            : "bg-[#121212]/60 hover:bg-[#121212] border-[#2e2e2e]/50 hover:border-[#ff8c42]/40 text-white"
        }`}
        title="Alternar grupo de pesquisa"
        aria-expanded={aberto}
      >
        <div className="w-5 h-5 rounded-md bg-[#ff8c42]/10 flex items-center justify-center text-[#ff8c42] shrink-0">
          <Users className="w-3 h-3" />
        </div>
        <span className="text-sm font-medium max-w-[200px] truncate text-white">
          {grupoAtual.nome}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#9e9e9e] transition-transform duration-200 ${
            aberto ? "rotate-180 text-[#ff8c42]" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-xl bg-[#1e1e1e] border border-[#2e2e2e]/60 p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[#2e2e2e]/40 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e9e9e]">
              Seus Grupos de Pesquisa
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {meusGrupos.map((grupo) => {
              const selecionado = grupo.id === grupoAtual.id;
              return (
                <button
                  key={grupo.id}
                  type="button"
                  onClick={() => handleSelecionar(grupo)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-sm transition-all duration-150 cursor-pointer ${
                    selecionado
                      ? "bg-[#ff8c42]/15 text-[#ff8c42] font-semibold"
                      : "text-white hover:bg-[#121212] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="truncate">{grupo.nome}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {grupo.role && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          grupo.isLider
                            ? "bg-[#ff8c42]/10 border-[#ff8c42]/30 text-[#ff8c42]"
                            : "bg-[#121212] border-[#2e2e2e]/50 text-[#9e9e9e]"
                        }`}
                      >
                        {grupo.role}
                      </span>
                    )}
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
