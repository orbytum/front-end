import { useState } from "react";
import { Users, LogOut, RefreshCw, AlertCircle } from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { AuthService } from "../services/auth/AuthService";
import { useNavigate } from "react-router";

export function SemGrupoView() {
  const { recarregarGrupos } = useGrupo();
  const [recarregando, setRecarregando] = useState(false);
  const authService = new AuthService();
  const navigate = useNavigate();

  const handleRecarregar = async () => {
    setRecarregando(true);
    try {
      await recarregarGrupos();
    } finally {
      setRecarregando(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Anéis de órbita decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#2e2e2e]/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#2e2e2e]/10" />
      </div>

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Card */}
        <div className="bg-[#1e1e1e] rounded-2xl p-8 border border-[#2e2e2e]/30 shadow-2xl">
          {/* Ícone */}
          <div className="w-16 h-16 rounded-2xl bg-[#ff8c42]/10 border border-[#ff8c42]/20 flex items-center justify-center mx-auto mb-6 text-[#ff8c42]">
            <Users className="w-8 h-8" />
          </div>

          <h2 className="text-white text-xl font-bold mb-3">
            Nenhum Grupo de Pesquisa Vinculado
          </h2>

          <p className="text-[#9e9e9e] text-sm leading-relaxed mb-8">
            Sua conta está ativa no sistema, mas você ainda não está associado a nenhum grupo de pesquisa.
            Aguarde o convite ou a inclusão por parte de um líder ou administrador para navegar pelas ferramentas.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRecarregar}
              disabled={recarregando}
              className="w-full py-3 px-4 bg-[#ff8c42] hover:bg-[#ff8c42]/90 disabled:opacity-50 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff8c42]/10"
            >
              <RefreshCw className={`w-4 h-4 ${recarregando ? "animate-spin" : ""}`} />
              <span>{recarregando ? "Verificando..." : "Verificar novamente"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-[#121212] hover:bg-[#2e2e2e]/40 text-[#9e9e9e] hover:text-white font-medium rounded-xl border border-[#2e2e2e]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#9e9e9e]/60 mt-6">ORBYTUM • Sistema de Gestão Acadêmica</p>
      </div>
    </div>
  );
}
