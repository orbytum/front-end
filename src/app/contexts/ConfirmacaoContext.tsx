import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

export interface OpcoesConfirmacao {
  titulo: string;
  mensagem: React.ReactNode;
  /** Texto do botão de confirmação (padrão: "Confirmar"). */
  textoConfirmar?: string;
  /** Texto do botão de cancelamento (padrão: "Cancelar"). */
  textoCancelar?: string;
  /** Ação destrutiva (excluir, remover, revogar…): botão vermelho e foco inicial em "Cancelar". */
  perigo?: boolean;
}

type Confirmar = (opcoes: OpcoesConfirmacao) => Promise<boolean>;

const ConfirmacaoContext = createContext<Confirmar>(async () => false);

/**
 * Substitui o window.confirm do navegador por um modal no tema do sistema.
 * Uso: `const confirmar = useConfirmacao(); if (!(await confirmar({ ... }))) return;`
 */
export function useConfirmacao(): Confirmar {
  return useContext(ConfirmacaoContext);
}

interface Pendente extends OpcoesConfirmacao {
  resolver: (confirmado: boolean) => void;
}

export function ConfirmacaoProvider({ children }: { children: React.ReactNode }) {
  const [pendente, setPendente] = useState<Pendente | null>(null);
  const botaoCancelarRef = useRef<HTMLButtonElement>(null);
  const botaoConfirmarRef = useRef<HTMLButtonElement>(null);

  const confirmar = useCallback<Confirmar>(
    (opcoes) =>
      new Promise<boolean>((resolver) => {
        setPendente({ ...opcoes, resolver });
      }),
    []
  );

  const responder = useCallback(
    (confirmado: boolean) => {
      setPendente((atual) => {
        atual?.resolver(confirmado);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!pendente) return;
    (pendente.perigo ? botaoCancelarRef : botaoConfirmarRef).current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") responder(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [pendente, responder]);

  const Icone = pendente?.perigo ? AlertTriangle : HelpCircle;

  return (
    <ConfirmacaoContext.Provider value={confirmar}>
      {children}
      {pendente && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) responder(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmacao-titulo"
            aria-describedby="confirmacao-mensagem"
            className="bg-card rounded-lg w-full max-w-md border border-border/40 shadow-2xl overflow-hidden"
          >
            <div className="p-6 flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  pendente.perigo
                    ? "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                <Icone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirmacao-titulo" className="text-foreground font-semibold text-lg">
                  {pendente.titulo}
                </h3>
                <div id="confirmacao-mensagem" className="text-muted-foreground text-sm mt-1.5 break-words">
                  {pendente.mensagem}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                ref={botaoCancelarRef}
                type="button"
                onClick={() => responder(false)}
                className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-lg text-sm transition-colors cursor-pointer"
              >
                {pendente.textoCancelar ?? "Cancelar"}
              </button>
              <button
                ref={botaoConfirmarRef}
                type="button"
                onClick={() => responder(true)}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer text-white ${
                  pendente.perigo ? "bg-[#ef4444] hover:bg-[#ef4444]/90" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {pendente.textoConfirmar ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmacaoContext.Provider>
  );
}
