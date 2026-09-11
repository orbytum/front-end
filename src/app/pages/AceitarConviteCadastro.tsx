import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import {
  Eye,
  EyeOff,
  UserPlus,
  Orbit,
  CheckCircle2,
  AlertTriangle,
  User,
  Lock,
  Phone,
  Award,
  ChevronDown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { ConviteService } from "../services/convites/ConviteService";
import { HttpError } from "../utils/HttpError";

const TITULOS = [
  "Aluno",
  "Graduando",
  "Especialista",
  "Mestrando",
  "Mestre",
  "Doutorando",
  "Doutor",
  "Pós-Doutor",
  "Professor",
  "Pesquisador",
  "Técnico",
  "Outro",
];

type Step = "form" | "success" | "invalid";

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

export function AceitarConviteCadastro() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ token?: string }>();
  const navigate = useNavigate();

  const token = routeParams.token || searchParams.get("token") || "";

  const [step, setStep] = useState<Step>(token ? "form" : "invalid");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const conviteService = new ConviteService();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nome: "",
    titulo: "",
    tituloCustom: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setForm((prev) => ({ ...prev, telefone: formatted }));
    if (errors.telefone) {
      setErrors((prev) => ({ ...prev, telefone: "" }));
    }
  };

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) {
      errs.nome = "Informe seu nome completo.";
    }

    const finalTitulo =
      form.titulo === "Outro" ? form.tituloCustom.trim() : form.titulo.trim();
    if (!finalTitulo) {
      errs.titulo = "Selecione ou informe seu título.";
    }

    const digitsOnly = form.telefone.replace(/\D/g, "");
    if (!digitsOnly) {
      errs.telefone = "Informe seu telefone.";
    } else if (digitsOnly.length < 10) {
      errs.telefone = "Telefone inválido (mínimo 10 dígitos).";
    }

    if (form.senha.length < 8) {
      errs.senha = "A senha deve ter no mínimo 8 caracteres.";
    }
    if (form.senha !== form.confirmarSenha) {
      errs.confirmarSenha = "As senhas não coincidem.";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!token) {
      setStep("invalid");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const finalTitulo =
      form.titulo === "Outro" ? form.tituloCustom.trim() : form.titulo.trim();

    const payload = {
      nome: form.nome.trim(),
      senha: form.senha,
      telefone: form.telefone.trim(),
      titulo: finalTitulo,
    };

    try {
      const data = await conviteService.aceitarCadastro(token, payload);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        if (data.tipo) {
          localStorage.setItem("token_tipo", data.tipo);
        }
      }

      setStep("success");
    } catch (err) {
      if (err instanceof HttpError) {
        setSubmitError(err.response?.mensagem || err.message);
      } else {
        setSubmitError(
          "Não foi possível concluir seu cadastro. Verifique os dados e tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background celestial circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#2e2e2e]/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#2e2e2e]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border border-[#2e2e2e]/05" />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#ff8c42]/20"
            style={{ top: `${12 + i * 8}%`, left: `${8 + i * 9}%` }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-[#ff8c42] flex items-center justify-center">
              <Orbit className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">ORBYTUM</h1>
        </div>

        {/* ── INVALID TOKEN ── */}
        {step === "invalid" && (
          <div className="bg-[#1e1e1e] rounded-2xl p-8 border border-[#ef4444]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Convite não identificado</h2>
            <p className="text-[#9e9e9e] text-sm mb-6">
              Nenhum token de convite foi encontrado no endereço acessado ou o convite expirou. Por favor, verifique o link recebido por e-mail ou solicite um novo convite ao coordenador.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white transition-colors text-sm"
            >
              Ir para o login
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <div className="bg-[#1e1e1e] rounded-2xl p-8 border border-[#10b981]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Cadastro concluído!</h2>
            <p className="text-[#9e9e9e] text-sm mb-6">
              Sua conta foi criada e ativada com sucesso. Você já pode acessar o sistema com suas credenciais.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-3 bg-[#ff8c42] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>Acessar o sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── FORM ── */}
        {step === "form" && (
          <div className="bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#2e2e2e]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Ativação de Conta</h2>
                  <p className="text-[#9e9e9e] text-xs">Preencha seus dados para completar seu cadastro</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {submitError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Nome */}
              <Field label="Nome completo" error={errors.nome} required>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e2e]" />
                  <input
                    type="text"
                    value={form.nome}
                    onChange={handleChange("nome")}
                    placeholder="Seu nome completo"
                    disabled={loading}
                    className={inputCls(!!errors.nome) + " pl-10"}
                  />
                </div>
              </Field>

              {/* Título */}
              <Field label="Título" error={errors.titulo} required>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e2e] pointer-events-none" />
                  <select
                    value={form.titulo}
                    onChange={handleChange("titulo")}
                    disabled={loading}
                    className={selectCls(!!errors.titulo)}
                  >
                    <option value="" disabled>Selecione seu título</option>
                    {TITULOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e2e] pointer-events-none" />
                </div>
                {form.titulo === "Outro" && (
                  <input
                    type="text"
                    value={form.tituloCustom}
                    onChange={handleChange("tituloCustom")}
                    placeholder="Especifique seu título..."
                    disabled={loading}
                    className={inputCls(false) + " mt-2"}
                  />
                )}
              </Field>

              {/* Telefone */}
              <Field label="Telefone" error={errors.telefone} required>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e2e]" />
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    disabled={loading}
                    className={inputCls(!!errors.telefone) + " pl-10"}
                  />
                </div>
              </Field>

              {/* Senha */}
              <Field label="Senha" error={errors.senha} required>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e2e]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.senha}
                    onChange={handleChange("senha")}
                    placeholder="Mínimo 8 caracteres"
                    disabled={loading}
                    className={inputCls(!!errors.senha) + " pl-10 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.senha && <PasswordStrength password={form.senha} />}
              </Field>

              {/* Confirmar Senha */}
              <Field label="Confirmar senha" error={errors.confirmarSenha} required>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e2e]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmarSenha}
                    onChange={handleChange("confirmarSenha")}
                    placeholder="Repita a senha digitada"
                    disabled={loading}
                    className={inputCls(!!errors.confirmarSenha) + " pl-10 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9e9e9e] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-[#ff8c42] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Concluindo cadastro...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Ativar minha conta</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-[#2e2e2e] pt-2">
                Já possui uma conta ativa?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#9e9e9e] hover:text-white transition-colors font-medium cursor-pointer"
                >
                  Fazer login
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">
        {label}
        {required && <span className="text-[#ff8c42] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[#ef4444] text-xs mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full py-2.5 bg-[#121212] rounded-xl border text-white placeholder-[#2e2e2e] focus:outline-none transition-colors ${
    hasError
      ? "border-[#ef4444]/50 focus:border-[#ef4444]/80"
      : "border-[#2e2e2e]/30 focus:border-[#ff8c42]/50"
  }`;
}

function selectCls(hasError: boolean) {
  return `w-full pl-10 pr-9 py-2.5 bg-[#121212] rounded-xl border text-white focus:outline-none appearance-none transition-colors ${
    hasError
      ? "border-[#ef4444]/50 focus:border-[#ef4444]/80"
      : "border-[#2e2e2e]/30 focus:border-[#ff8c42]/50"
  }`;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const levels = ["Muito fraca", "Fraca", "Média", "Forte", "Muito forte"];
  const colors = [
    "bg-[#ef4444]",
    "bg-[#ef4444]",
    "bg-[#f59e0b]",
    "bg-[#10b981]",
    "bg-[#10b981]",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all ${ i < score ? colors[score] : "bg-[#2e2e2e]/40" }`}
          />
        ))}
      </div>
      <p className="text-xs text-[#9e9e9e]">{levels[score]}</p>
    </div>
  );
}
