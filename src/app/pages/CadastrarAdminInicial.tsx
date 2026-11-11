import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  UserPlus,
  Orbit,
  CheckCircle2,
  User,
  Lock,
  Phone,
  Loader2,
  Mail,
} from "lucide-react";
import { LoginService } from "../services/auth/LoginService";
import { AuthService } from "../services/auth/AuthService";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function CadastrarAdminInicial() {
  const navigate = useNavigate();
  const authService = new AuthService();
  const loginService = new LoginService();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const accessLevel = authService.getUserAccessLevel();
  if (accessLevel !== "initial_admin") {
    return <Navigate to="/" replace />;
  }

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setForm((prev) => ({ ...prev, telefone: formatted }));
    if (errors.telefone) {
      setErrors((prev) => ({ ...prev, telefone: "" }));
    }
  };

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.nome.trim()) {
      errs.nome = "Informe o nome completo.";
    }

    if (!form.email.trim()) {
      errs.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Informe um e-mail válido.";
    }

    if (!form.telefone.trim()) {
      errs.telefone = "Informe o telefone.";
    }

    if (!form.senha) {
      errs.senha = "Informe a senha.";
    } else if (form.senha.length < 6) {
      errs.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (form.senha !== form.confirmarSenha) {
      errs.confirmarSenha = "As senhas não coincidem.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!validate()) return;

    setLoading(true);

    try {
      await loginService.registerAdmin({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        telefone: form.telefone.trim(),
        titulo: "Administrador do Sistema",
      });

      authService.logout();
      setSucesso(true);
    } catch (err: any) {
      setErro(
        err?.mensagem ||
          err?.message ||
          "Erro ao cadastrar administrador. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-[#1e1e1e] rounded-2xl p-8 border border-[#2e2e2e]/30 text-center relative z-10">
          <div className="w-16 h-16 bg-[#22c55e]/10 text-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#22c55e]/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Administrador Cadastrado!
          </h2>
          <p className="text-[#9e9e9e] text-sm mb-6">
            O primeiro administrador do sistema foi cadastrado com sucesso. Sua sessão de Administrador Inicial foi encerrada.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-[#ff8c42] text-white rounded-xl font-semibold hover:bg-[#ff8c42]/90 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Ir para a tela de Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbit Rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#2e2e2e]/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#2e2e2e]/10" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#ff8c42] flex items-center justify-center">
              <Orbit className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">ORBYTUM</h1>
          <p className="text-[#9e9e9e] text-sm mt-1">Configuração Inicial do Sistema</p>
        </div>

        {/* Card */}
        <div className="bg-[#1e1e1e] rounded-2xl p-8 border border-[#2e2e2e]/30 shadow-2xl">
          <div className="mb-6 border-b border-[#2e2e2e]/40 pb-4">
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#ff8c42]" />
              Cadastrar Primeiro Administrador
            </h2>
            <p className="text-[#9e9e9e] text-xs mt-1">
              Como Administrador Inicial, cadastre a conta do primeiro administrador definitivo do sistema. Ao concluir, você será deslogado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-medium text-[#9e9e9e] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#ff8c42]" />
                Nome Completo *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={handleChange("nome")}
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white placeholder-[#404040] text-sm focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
              {errors.nome && (
                <p className="text-[#ef4444] text-xs mt-1">{errors.nome}</p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-medium text-[#9e9e9e] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#ff8c42]" />
                E-mail do Administrador *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="admin@empresa.com"
                className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white placeholder-[#404040] text-sm focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
              {errors.email && (
                <p className="text-[#ef4444] text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-medium text-[#9e9e9e] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#ff8c42]" />
                Telefone *
              </label>
              <input
                type="text"
                value={form.telefone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white placeholder-[#404040] text-sm focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
              />
              {errors.telefone && (
                <p className="text-[#ef4444] text-xs mt-1">{errors.telefone}</p>
              )}
            </div>

            {/* Senha e Confirmação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9e9e9e] mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#ff8c42]" />
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={form.senha}
                    onChange={handleChange("senha")}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white placeholder-[#404040] text-sm focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-white"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-[#ef4444] text-xs mt-1">{errors.senha}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9e9e9e] mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#ff8c42]" />
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <input
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    value={form.confirmarSenha}
                    onChange={handleChange("confirmarSenha")}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white placeholder-[#404040] text-sm focus:outline-none focus:border-[#ff8c42]/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-white"
                  >
                    {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-[#ef4444] text-xs mt-1">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>

            {erro && (
              <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ef4444] text-xs">
                {erro}
              </div>
            )}

            {/* Enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-[#ff8c42] hover:bg-[#ff8c42]/90 disabled:opacity-50 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Cadastrar Administrador
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
