import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, LogOut, User } from "lucide-react";
import { AuthService } from "../services/auth/AuthService";

interface PerfilMenuProps {
  isAdmin: boolean;
  role: string;
  avatarLabel: string;
}

export function PerfilMenu({ isAdmin, role, avatarLabel }: PerfilMenuProps) {
  const navigate = useNavigate();
  const authService = new AuthService();
  const [aberto, setAberto] = useState(false);
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

  const payload = authService.getTokenPayload();
  const identificacao =
    payload?.nome || payload?.name || payload?.email || payload?.sub || "Usuário";

  const handleSair = () => {
    authService.logout();
    setAberto(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-colors cursor-pointer ${
          aberto
            ? "bg-background border-primary/60"
            : "bg-transparent border-transparent hover:bg-background hover:border-border/40"
        }`}
        aria-expanded={aberto}
        title="Menu do perfil"
      >
        <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-semibold">{avatarLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-card border border-border/60 p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center gap-3 px-3 py-3 border-b border-border/40 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{identificacao}</p>
              <p className="text-xs text-muted-foreground truncate">
                {isAdmin ? "Administrador" : role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSair}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}
