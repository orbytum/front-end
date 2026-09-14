import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { LoginService } from "../services/auth/LoginService";
import { Eye, EyeOff, LogIn, Orbit } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const loginService = new LoginService();
  const [formulario, setFormulario] = useState({ usuario: "", senha: "" });
  const [erro, setErro] = useState("");

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const loginFormulario = {
      email: formulario.usuario,
      senha: formulario.senha,
    };
    try {
      const response = await loginService.login(loginFormulario);
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("token_tipo", response.tipo || "Bearer");
        navigate(redirect);
      }
    } catch (err: any) {
      setErro(err?.mensagem || err?.message || "Erro ao realizar login. Verifique suas credenciais.");
    }
  };

  

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Anéis de órbita de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#2e2e2e]/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#2e2e2e]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-[#2e2e2e]/05" />
        {/* Partículas flutuantes */}
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
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#ff8c42] flex items-center justify-center">
                <Orbit className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">ORBYTUM</h1>
        </div>

        {/* Card */}
        <div className="bg-[#1e1e1e] rounded-2xl p-8 border border-[#2e2e2e]/30">
          <h2 className="text-white text-xl font-semibold mb-2">Login</h2>
          <p className="text-[#9e9e9e] text-sm mb-6">Informe seu email e senha</p>

          <form onSubmit={enviarFormulario} className="space-y-5">
            {/* Usuário */}
            <div>
              <label className="block text-sm text-[#9e9e9e] mb-2 font-normal">E-mail</label>
              <input
                type="email"
                value={formulario.usuario}
                onChange={(e) => setFormulario({ ...formulario, usuario: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#2e2e2e] focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm text-[#9e9e9e] mb-2 font-normal">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={formulario.senha}
                  onChange={(e) => setFormulario({ ...formulario, senha: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#2e2e2e] focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-white transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="text-[#ef4444] text-sm">{erro}</p>
            )}

            {/* Enviar */}
            <button
              type="submit"
              className="w-full py-3 bg-[#ff8c42] text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2e2e2e]/30 text-center">
            <p className="text-xs text-[#2e2e2e]">
              Acesso via convite? Use o link recebido por e-mail.
            </p>
          </div>
        </div>

        {/* Badges de funções */}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {["Administrador", "Líder", "Coordenador", "Pesquisador"].map((funcao) => (
            <span
              key={funcao}
              className="px-3 py-1 rounded-full text-xs text-[#9e9e9e] bg-[#1e1e1e]/60 border border-[#2e2e2e]/20"
            >
              {funcao}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}