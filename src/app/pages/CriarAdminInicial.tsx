import { useState } from "react";
import { useNavigate } from "react-router";
import { LoginService } from "../services/auth/LoginService";
import { HttpError } from "../utils/HttpError";
import { Eye, EyeOff, Orbit, UserPlus } from "lucide-react";

export function CriarAdminInicial() {
  const navigate = useNavigate();
  const loginService = new LoginService();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    titulo: "",
  });

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    try {
      const response = await loginService.registerAdmin(formulario);
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("token_tipo", response.tipo || "Bearer");
        navigate("/");
      }
    } catch (err) {
      if (err instanceof HttpError) {
        setErro(err.response?.mensagem || err.message);
      } else {
        setErro("Erro ao criar administrador. Tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-border/10" />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#ff8c42]/30"
            style={{
              top: `${15 + i * 10}%`,
              left: `${10 + i * 11}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#ff8c42] flex items-center justify-center">
                <Orbit className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-wider">ORBYTUM</h1>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border/30">
          <h2 className="text-foreground text-xl font-semibold mb-2">Criar Administrador</h2>
          <p className="text-muted-foreground text-sm mb-6">Preencha os dados para o primeiro administrador do sistema</p>

          <form onSubmit={enviarFormulario} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2 font-normal">Nome completo</label>
              <input
                type="text"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                placeholder="Seu nome"
                required
                className="w-full px-4 py-3 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2 font-normal">E-mail</label>
              <input
                type="email"
                value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2 font-normal">Telefone</label>
              <input
                type="tel"
                value={formulario.telefone}
                onChange={(e) => setFormulario({ ...formulario, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
                className="w-full px-4 py-3 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2 font-normal">Título acadêmico</label>
              <input
                type="text"
                value={formulario.titulo}
                onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                placeholder="Ex: Dr., Ms., Prof."
                required
                className="w-full px-4 py-3 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2 font-normal">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={formulario.senha}
                  onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="text-[#ef4444] text-sm">{erro}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#ff8c42] text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Criar Administrador
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
