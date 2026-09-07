import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  MailPlus,
  Plus,
  Copy,
  Check,
  Ban,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  Send,
  Link as LinkIcon,
} from "lucide-react";
import { DataTable, Column } from "../components/DataTable";
import {
  conviteApi,
  authApi,
  ApiError,
  ConviteCadastroDetalhe,
} from "@/api";

export function GestaoConvitesCadastro() {
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [convites, setConvites] = useState<ConviteCadastroDetalhe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal novo convite
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [diasValidade, setDiasValidade] = useState(7);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Feedback de link copiado por ID
  const [copiedId, setCopiedId] = useState<number | "modal" | null>(null);

  // Revogação
  const [revokingId, setRevokingId] = useState<number | null>(null);

  // Validação de acesso
  useEffect(() => {
    const hasAdminAccess = authApi.isAdminOrInitialAdmin();
    setIsAdmin(hasAdminAccess);
  }, []);

  const carregarConvites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await conviteApi.listarCadastros();
      setConvites(data || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível carregar a lista de convites.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      carregarConvites();
    }
  }, [isAdmin, carregarConvites]);

  const handleCopyLink = (token: string, id: number | "modal") => {
    const fullUrl = `${window.location.origin}/convite?token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setGeneratedLink("");

    if (!email.trim()) {
      setModalError("Informe um endereço de e-mail válido.");
      return;
    }

    setCreating(true);
    try {
      const res = await conviteApi.gerarCadastro({
        email: email.trim(),
        diasValidade: Number(diasValidade),
      });

      const fullUrl = `${window.location.origin}/convite?token=${res.token}`;
      setGeneratedLink(fullUrl);
      setEmail("");
      carregarConvites();
    } catch (err) {
      if (err instanceof ApiError) {
        setModalError(err.message);
      } else {
        setModalError("Falha ao enviar convite. Verifique os dados e tente novamente.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!window.confirm("Deseja realmente revogar este convite? Ele não poderá mais ser utilizado.")) {
      return;
    }
    setRevokingId(id);
    try {
      await conviteApi.revogarCadastro(id);
      await carregarConvites();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Erro ao revogar convite.");
    } finally {
      setRevokingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Se ainda estiver verificando permissão
  if (isAdmin === null) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
      </div>
    );
  }

  // Se o usuário não for ADMIN nem INITIAL_ADMIN
  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="bg-[#0d1f30] rounded-2xl p-8 max-w-md w-full border border-[#ef4444]/30 shadow-[6px_6px_16px_#050c14,-6px_-6px_16px_#0f2638] text-center">
          <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-[#ef4444]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-[#8b96a5] text-sm mb-6">
            Esta página é restrita exclusivamente a <strong>Administradores</strong> e <strong>Administradores Iniciais</strong> da plataforma.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/40 text-white hover:border-[#ff8c42]/60 transition-colors text-sm font-medium cursor-pointer"
          >
            Fazer login com outra conta
          </button>
        </div>
      </div>
    );
  }

  const totalConvites = convites.length;
  const convitesAtivos = convites.filter((c) => c.ativo).length;
  const convitesInativos = totalConvites - convitesAtivos;

  const columns: Column<ConviteCadastroDetalhe>[] = [
    {
      key: "email",
      header: "Convidado",
      align: "left",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0a1929] border border-[#3d4f62]/40 flex items-center justify-center text-[#ff8c42] shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-medium block">{c.email}</span>
            <span className="text-xs text-[#8b96a5]">Convite por email</span>
          </div>
        </div>
      ),
    },
    {
      key: "dthRegistro",
      header: "Data de Envio",
      align: "left",
      render: (c) => (
        <div className="flex items-center gap-2 text-[#8b96a5] text-sm">
          <Calendar className="w-3.5 h-3.5 text-[#3d4f62]" />
          <span>{formatDate(c.dthRegistro)}</span>
        </div>
      ),
    },
    {
      key: "dthExpiracao",
      header: "Expiração",
      align: "left",
      render: (c) => (
        <div className="flex items-center gap-2 text-[#8b96a5] text-sm">
          <Clock className="w-3.5 h-3.5 text-[#3d4f62]" />
          <span>{formatDate(c.dthExpiracao)}</span>
        </div>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      align: "center",
      render: (c) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${
            c.ativo
              ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
              : "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              c.ativo ? "bg-[#10b981]" : "bg-[#ef4444]"
            }`}
          />
          {c.ativo ? "Ativo" : "Expirado / Inativo"}
        </span>
      ),
    },
    {
      key: "link",
      header: "Link de Acesso",
      align: "center",
      render: (c) => (
        <button
          type="button"
          onClick={() => handleCopyLink(c.token, c.id)}
          className="px-3 py-1.5 bg-[#0a1929] hover:bg-[#3d4f62]/30 border border-[#3d4f62]/40 rounded-lg text-xs text-[#8b96a5] hover:text-white transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
          title="Copiar link do convite"
        >
          {copiedId === c.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[#10b981] font-medium">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar link</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      align: "right",
      render: (c) => (
        c.ativo ? (
          <button
            type="button"
            onClick={() => handleRevoke(c.id)}
            disabled={revokingId === c.id}
            className="p-1.5 rounded-lg border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors disabled:opacity-40 cursor-pointer"
            title="Revogar convite"
          >
            {revokingId === c.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="text-xs text-[#3d4f62] italic">Sem ações</span>
        )
      ),
    },
  ];

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">
            Gestão de Convites de Cadastro
          </h1>
          <p className="text-[#8b96a5] text-sm">
            Gere e acompanhe convites para novos usuários se cadastrarem na plataforma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={carregarConvites}
            disabled={loading}
            className="p-2.5 bg-[#0d1f30] hover:bg-[#3d4f62]/30 border border-[#3d4f62]/40 rounded-xl text-[#8b96a5] hover:text-white transition-colors cursor-pointer"
            title="Recarregar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setGeneratedLink("");
              setModalError("");
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#ff8c42] to-[#f94c10] text-white rounded-xl font-semibold text-sm shadow-[0_4px_16px_rgba(255,140,66,0.35)] hover:shadow-[0_6px_20px_rgba(255,140,66,0.55)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Convite</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 shadow-[6px_6px_16px_#050c14,-6px_-6px_16px_#0f2638]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a9eff] to-[#2e7dd4] flex items-center justify-center shadow-lg">
              <MailPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[#8b96a5] text-xs">Total de Convites</p>
              <h3 className="text-white text-2xl font-bold">{totalConvites}</h3>
            </div>
          </div>
          <span className="text-xs text-[#8b96a5]">Registrados no histórico</span>
        </div>

        <div className="bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 shadow-[6px_6px_16px_#050c14,-6px_-6px_16px_#0f2638]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[#8b96a5] text-xs">Convites Ativos</p>
              <h3 className="text-white text-2xl font-bold text-[#10b981]">
                {convitesAtivos}
              </h3>
            </div>
          </div>
          <span className="text-xs text-[#10b981]">Disponíveis para uso</span>
        </div>

        <div className="bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 shadow-[6px_6px_16px_#050c14,-6px_-6px_16px_#0f2638]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center shadow-lg">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[#8b96a5] text-xs">Expirados ou Inativos</p>
              <h3 className="text-white text-2xl font-bold text-[#ef4444]">
                {convitesInativos}
              </h3>
            </div>
          </div>
          <span className="text-xs text-[#8b96a5]">Não utilizáveis</span>
        </div>
      </div>

      {/* Erro de carregamento */}
      {error && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={carregarConvites}
            className="underline font-semibold hover:text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabela de Convites */}
      <DataTable
        title="Histórico de Convites de Cadastro"
        data={convites}
        columns={columns}
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        emptyMessage="Nenhum convite de cadastro gerado até o momento."
      />

      {/* Modal / Diálogo para Gerar Novo Convite */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1f30] rounded-2xl w-full max-w-lg border border-[#3d4f62]/40 shadow-[8px_8px_32px_#050c14] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3d4f62]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8c42] to-[#f94c10] flex items-center justify-center shadow-md">
                  <MailPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Novo Convite de Cadastro
                  </h3>
                  <p className="text-[#8b96a5] text-xs">
                    Um link de registro exclusivo será gerado e enviado por email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8b96a5] hover:text-white hover:bg-[#3d4f62]/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {generatedLink ? (
                <div className="p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-[#10b981] font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Convite gerado com sucesso!</span>
                  </div>
                  <p className="text-xs text-[#8b96a5]">
                    O convite foi registrado e o email foi disparado. Você também pode copiar o link direto abaixo para encaminhar:
                  </p>
                  <div className="flex items-center gap-2 bg-[#0a1929] p-2.5 rounded-xl border border-[#3d4f62]/40">
                    <LinkIcon className="w-4 h-4 text-[#ff8c42] shrink-0" />
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="bg-transparent text-white text-xs flex-1 outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        setCopiedId("modal");
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#ff8c42] to-[#f94c10] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedId === "modal" ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-[#0a1929] hover:bg-[#3d4f62]/30 border border-[#3d4f62]/40 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">
                      E-mail do convidado <span className="text-[#ff8c42]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d4f62]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@exemplo.com"
                        disabled={creating}
                        className="w-full py-2.5 pl-10 pr-4 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#3d4f62] shadow-[inset_2px_2px_4px_#050c14] focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">
                      Validade do convite
                    </label>
                    <select
                      value={diasValidade}
                      onChange={(e) => setDiasValidade(Number(e.target.value))}
                      disabled={creating}
                      className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white shadow-[inset_2px_2px_4px_#050c14] focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm cursor-pointer"
                    >
                      <option value={1}>1 dia</option>
                      <option value={3}>3 dias</option>
                      <option value={7}>7 dias (padrão)</option>
                      <option value={15}>15 dias</option>
                      <option value={30}>30 dias</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      disabled={creating}
                      className="px-4 py-2.5 bg-[#0a1929] hover:bg-[#3d4f62]/20 border border-[#3d4f62]/40 text-[#8b96a5] hover:text-white rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#ff8c42] to-[#f94c10] text-white rounded-xl font-semibold text-sm shadow-[0_4px_16px_rgba(255,140,66,0.35)] hover:shadow-[0_6px_20px_rgba(255,140,66,0.55)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gerar e Enviar Convite</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
