import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ErroAlerta {
  titulo: string;
  mensagem: string;
}

export function GlobalErrorAlert() {
  const [erro, setErro] = useState<ErroAlerta | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ErroAlerta>).detail;
      setErro(detail);
      
      clearTimeout(timer);
      timer = setTimeout(() => {
        setErro(null);
      }, 5000);
    };

    window.addEventListener("app:error", handler);

    return () => {
      window.removeEventListener("app:error", handler);
      clearTimeout(timer);
    };
  }, []);

  if (!erro) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full sm:w-96 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-card border border-[#ef4444]/40 rounded-2xl p-4 shadow-2xl flex items-start gap-3 text-foreground backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1 pr-1">
          <h4 className="font-semibold text-sm text-foreground leading-tight">
            {erro.titulo}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed break-words">
            {erro.mensagem}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setErro(null)}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/40 transition-colors cursor-pointer shrink-0 -mt-1 -mr-1"
          title="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}