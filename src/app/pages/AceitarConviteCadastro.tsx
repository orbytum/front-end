import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Eye, EyeOff, UserPlus, Orbit, CheckCircle2, AlertTriangle,
  User, Lock, Phone, Award, ChevronDown
} from "lucide-react";

const TITULOS = [
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
];

type Step = "form" | "success" | "invalid";

function resolveInvite(token: string | null) {
  if (!token) return null;
}

const ROLE_COLOR: Record<string, string> = {
  Pesquisador: "text-[#4a9eff] bg-[#4a9eff]/15 border-[#4a9eff]/30",
  Coordenador: "text-[#10b981] bg-[#10b981]/15 border-[#10b981]/30",
  Líder: "text-[#ff8c42] bg-[#ff8c42]/15 border-[#ff8c42]/30",
};

export function AceitarConviteCadastro() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  resolveInvite(token);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    titulo: "",
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Informe seu nome completo.";
    if (form.password.length < 8) errs.password = "A senha deve ter no mínimo 8 caracteres.";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "As senhas não coincidem.";
    if (!form.phone.trim()) errs.phone = "Informe seu telefone.";
    if (!form.titulo) errs.titulo = "Selecione seu título.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep("success");
  };

  const roleColorClass = invite ? (ROLE_COLOR[invite.role] ?? ROLE_COLOR["Pesquisador"]) : "";

  return (
    <div className="min-h-screen bg-[#0a1929] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#3d4f62]/12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#3d4f62]/08" />
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff8c42] to-[#f94c10] shadow-[0_0_28px_rgba(255,140,66,0.45)] flex items-center justify-center">
              <Orbit className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">ORBYTUM</h1>
        </div>

        {/* ── INVALID TOKEN ── */}
        {step === "invalid" && (
          <div className="bg-[#0d1f30] rounded-2xl p-8 shadow-[8px_8px_24px_#050c14,-8px_-8px_24px_#0f2638] border border-[#ef4444]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Convite inválido</h2>
            <p className="text-[#8b96a5] text-sm mb-6">
              Este link de convite é inválido ou expirou. Solicite um novo convite de cadastro ao administrador.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-[#8b96a5] hover:text-white transition-colors text-sm shadow-[inset_2px_2px_4px_#050c14]"
            >
              Ir para o login
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && invite && (
          <div className="bg-[#0d1f30] rounded-2xl p-8 shadow-[8px_8px_24px_#050c14,-8px_-8px_24px_#0f2638] border border-[#10b981]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Cadastro realizado!</h2>
            <p className="text-[#8b96a5] text-sm mb-2">
              Bem-vindo ao grupo <span className="text-white font-medium">{invite.group}</span>.
            </p>
            <p className="text-[#8b96a5] text-sm mb-6">
              Seu acesso como <span className={`font-medium px-2 py-0.5 rounded-full text-xs border ${roleColorClass}`}>{invite.role}</span> está ativo.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-gradient-to-r from-[#ff8c42] to-[#f94c10] text-white rounded-xl font-semibold shadow-[0_4px_16px_rgba(255,140,66,0.35)] hover:shadow-[0_6px_20px_rgba(255,140,66,0.55)] transition-all"
            >
              Acessar o sistema
            </button>
          </div>
        )}

        {/* ── FORM ── */}
        {step === "form" && invite && (
          <div className="bg-[#0d1f30] rounded-2xl shadow-[8px_8px_24px_#050c14,-8px_-8px_24px_#0f2638] border border-[#3d4f62]/30 overflow-hidden">
            {/* Invite banner */}
            <div className="px-6 pt-6 pb-4 border-b border-[#3d4f62]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8c42] to-[#f94c10] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,140,66,0.3)]">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">Você foi convidado!</p>
                  <p className="text-[#8b96a5] text-xs mt-0.5">
                    por <span className="text-white">{invite.invitedBy}</span> para o grupo{" "}
                    <span className="text-white">{invite.group}</span>
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${roleColorClass}`}>
                  {invite.role}
                </span>
              </div>

              {invite.email && (
                <p className="mt-3 text-xs text-[#3d4f62] bg-[#0a1929] rounded-lg px-3 py-2 shadow-[inset_1px_1px_3px_#050c14]">
                  Convite enviado para <span className="text-[#8b96a5]">{invite.email}</span>
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <p className="text-[#8b96a5] text-sm">Complete seu cadastro para ativar o acesso.</p>

              {/* Nome */}
              <Field label="Nome completo" error={errors.name} required>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Seu nome completo"
                    className={inputCls(!!errors.name) + " pl-10"}
                  />
                </div>
              </Field>

              <Field label="Título acadêmico" error={errors.titulo} required>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62] pointer-events-none" />
                  <select
                    value={form.titulo}
                    onChange={set("titulo")}
                    className={selectCls(!!errors.titulo)}
                  >
                    <option value="" disabled>Selecione seu título</option>
                    {TITULOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62] pointer-events-none" />
                </div>
              </Field>

              <Field label="Telefone" error={errors.phone} required>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62]" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="(00) 00000-0000"
                    className={inputCls(!!errors.phone) + " pl-10"}
                  />
                </div>
              </Field>

              <Field label="Senha" error={errors.password} required>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Mínimo 8 caracteres"
                    className={inputCls(!!errors.password) + " pl-10 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b96a5] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <PasswordStrength password={form.password} />
                )}
              </Field>

              <Field label="Confirmar senha" error={errors.confirmPassword} required>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="Repita a senha"
                    className={inputCls(!!errors.confirmPassword) + " pl-10 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b96a5] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-gradient-to-r from-[#ff8c42] to-[#f94c10] text-white rounded-xl font-semibold shadow-[0_4px_16px_rgba(255,140,66,0.35)] hover:shadow-[0_6px_20px_rgba(255,140,66,0.55)] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Ativar minha conta
              </button>

              <p className="text-center text-xs text-[#3d4f62]">
                Já tem conta?{" "}
                <button type="button" onClick={() => navigate("/login")} className="text-[#8b96a5] hover:text-white transition-colors">
                  Entrar
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
  label, error, required, children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">
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
  return `w-full py-2.5 bg-[#0a1929] rounded-xl border text-white placeholder-[#3d4f62] shadow-[inset_2px_2px_4px_#050c14] focus:outline-none transition-colors ${
    hasError
      ? "border-[#ef4444]/50 focus:border-[#ef4444]/80"
      : "border-[#3d4f62]/30 focus:border-[#ff8c42]/50"
  }`;
}

function selectCls(hasError: boolean) {
  return `w-full pl-10 pr-9 py-2.5 bg-[#0a1929] rounded-xl border text-white shadow-[inset_2px_2px_4px_#050c14] focus:outline-none appearance-none transition-colors ${
    hasError
      ? "border-[#ef4444]/50 focus:border-[#ef4444]/80"
      : "border-[#3d4f62]/30 focus:border-[#ff8c42]/50"
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
  const colors = ["bg-[#ef4444]", "bg-[#ef4444]", "bg-[#f59e0b]", "bg-[#10b981]", "bg-[#10b981]"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all ${i < score ? colors[score] : "bg-[#3d4f62]/40"}`}
          />
        ))}
      </div>
      <p className="text-xs text-[#8b96a5]">{levels[score]}</p>
    </div>
  );
}
