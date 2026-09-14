import { useState, useEffect } from "react";
import { X, Link2, Mail, Copy, Check, Loader2, Users, Send, ShieldCheck } from "lucide-react";
import { ConviteService } from "../services/convites/ConviteService";
import { RoleService } from "../services/roles/RoleService";
import { RoleResponse } from "../models/dto/roles/Role";

interface ModalConvidarMembroProps {
  isOpen: boolean;
  onClose: () => void;
  grupoId: number;
  nomeGrupo: string;
}

export function ModalConvidarMembro({
  isOpen,
  onClose,
  grupoId,
  nomeGrupo,
}: ModalConvidarMembroProps) {
  if (!isOpen) return null;

  const [tab, setTab] = useState<"link" | "email">("link");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucessoMsg, setSucessoMsg] = useState("");

  // Roles do sistema
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [idRoleSelecionada, setIdRoleSelecionada] = useState<number | null>(null);

  // Estado para Link
  const [linkGerado, setLinkGerado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [diasValidadeLink, setDiasValidadeLink] = useState<number>(7);
  const [limiteUsoLink, setLimiteUsoLink] = useState<number>(5);

  // Estado para E-mail
  const [emailsInput, setEmailsInput] = useState("");
  const [diasValidadeEmail, setDiasValidadeEmail] = useState<number>(7);

  const conviteService = new ConviteService();
  const roleService = new RoleService();

  useEffect(() => {
    let montado = true;
    roleService
      .listarRoles()
      .then((lista) => {
        if (montado && lista && lista.length > 0) {
          setRoles(lista);
          const membro =
            lista.find((r) => !r.isLider && r.nome.toLowerCase() === "membro") ||
            lista.find((r) => !r.isLider) ||
            lista[0];
          if (membro) {
            setIdRoleSelecionada(membro.id);
          }
        }
      })
      .catch((e) => {
        console.error("Erro ao carregar cargos/roles:", e);
      });
    return () => {
      montado = false;
    };
  }, []);

  const handleGerarLink = async () => {
    setLoading(true);
    setErro("");
    setSucessoMsg("");

    try {
      const res = await conviteService.gerarConviteGrupo({
        idGrupo: grupoId,
        diasValidade: diasValidadeLink || 7,
        limiteUso: limiteUsoLink || 5,
        idRole: idRoleSelecionada,
      });

      const fullUrl = `${window.location.origin}/convites/aceitar/grupo/${res.token}`;
      setLinkGerado(fullUrl);
    } catch (err: any) {
      setErro(err?.mensagem || err?.message || "Erro ao gerar link de convite.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarLink = async () => {
    if (!linkGerado) return;
    try {
      await navigator.clipboard.writeText(linkGerado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (e) {
      console.error("Erro ao copiar link:", e);
    }
  };

  const handleEnviarEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailsInput.trim()) return;

    setLoading(true);
    setErro("");
    setSucessoMsg("");

    const listaEmails = emailsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (listaEmails.length === 0) {
      setErro("Informe ao menos um e-mail válido.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsInvalidos = listaEmails.filter((email) => !emailRegex.test(email));

    if (emailsInvalidos.length > 0) {
      setErro(`Os seguintes e-mails possuem formato inválido: ${emailsInvalidos.join(", ")}`);
      setLoading(false);
      return;
    }

    const enviados: string[] = [];
    const ignorados: string[] = [];
    const erros: string[] = [];

    for (const email of listaEmails) {
      try {
        await conviteService.enviarConviteGrupo({
          idGrupo: grupoId,
          email,
          diasValidade: diasValidadeEmail || 7,
          idRole: idRoleSelecionada,
        });
        enviados.push(email);
      } catch (err: any) {
        const isNotFound =
          err?.status === 404 ||
          err?.response?.codigo === 404 ||
          (err?.response?.mensagem || err?.mensagem || err?.message || "")
            .toLowerCase()
            .includes("não encontrado");

        if (isNotFound) {
          ignorados.push(email);
        } else {
          const msg = err?.response?.mensagem || err?.mensagem || err?.message || "Erro ao enviar";
          erros.push(`${email} (${msg})`);
        }
      }
    }

    if (enviados.length > 0) {
      let msg = `${enviados.length} convite(s) criado(s) e enviado(s) com sucesso para: ${enviados.join(", ")}.`;
      if (ignorados.length > 0) {
        msg += ` Os seguintes e-mails não estão cadastrados no sistema e foram ignorados: ${ignorados.join(", ")}.`;
      }
      setSucessoMsg(msg);
      setEmailsInput("");
    } else if (ignorados.length > 0 && erros.length === 0) {
      setSucessoMsg(
        `Nenhum convite foi enviado. Os seguintes e-mails não estão cadastrados no sistema e foram ignorados: ${ignorados.join(", ")}.`
      );
      setEmailsInput("");
    }

    if (erros.length > 0) {
      setErro(`Falha ao enviar convite para: ${erros.join("; ")}`);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#2e2e2e]/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2e2e2e]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff8c42]/10 border border-[#ff8c42]/20 flex items-center justify-center text-[#ff8c42]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Convidar Membro</h2>
              <p className="text-[#9e9e9e] text-xs">Grupo: {nomeGrupo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9e9e9e] hover:text-white hover:bg-[#121212] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-[#2e2e2e]/40 bg-[#121212]/50 p-1.5 gap-1 mx-6 mt-5 rounded-xl border">
          <button
            type="button"
            onClick={() => {
              setTab("link");
              setErro("");
              setSucessoMsg("");
            }}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === "link"
                ? "bg-[#ff8c42] text-white shadow-md shadow-[#ff8c42]/20"
                : "text-[#9e9e9e] hover:text-white"
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Gerar Link</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("email");
              setErro("");
              setSucessoMsg("");
            }}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === "email"
                ? "bg-[#ff8c42] text-white shadow-md shadow-[#ff8c42]/20"
                : "text-[#9e9e9e] hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Enviar por E-mail</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          {erro && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ef4444] text-xs">
              {erro}
            </div>
          )}

          {sucessoMsg && (
            <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl text-[#22c55e] text-xs break-words">
              {sucessoMsg}
            </div>
          )}

          {/* Seleção de Cargo/Role */}
          {roles.length > 0 && (
            <div>
              <label className="block text-xs text-[#9e9e9e] mb-1.5 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff8c42]" />
                <span>Cargo / Função do Convidado *</span>
              </label>
              <select
                value={idRoleSelecionada ?? ""}
                onChange={(e) => setIdRoleSelecionada(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white text-sm focus:outline-none focus:border-[#ff8c42]/60 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome} {r.isLider ? "(Líder)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === "link" ? (
            <div className="space-y-4">
              <p className="text-xs text-[#9e9e9e]">
                Gere um link reutilizável para compartilhar com novos membros do grupo de pesquisa.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9e9e9e] mb-1.5 font-medium">
                    Validade (dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={diasValidadeLink}
                    onChange={(e) => setDiasValidadeLink(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white text-sm focus:outline-none focus:border-[#ff8c42]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9e9e9e] mb-1.5 font-medium">
                    Limite de uso *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={limiteUsoLink}
                    onChange={(e) => setLimiteUsoLink(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white text-sm focus:outline-none focus:border-[#ff8c42]/60"
                  />
                </div>
              </div>

              {!linkGerado ? (
                <button
                  type="button"
                  onClick={handleGerarLink}
                  disabled={loading}
                  className="w-full py-3 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando link...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      <span>Gerar Link de Convite</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs text-[#9e9e9e] font-medium">
                    Link de Convite Gerado:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={linkGerado}
                      className="flex-1 px-3 py-2 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white text-xs select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopiarLink}
                      className="px-4 py-2 bg-[#ff8c42] text-white rounded-xl text-xs font-semibold hover:bg-[#ff8c42]/90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiado ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleEnviarEmails} className="space-y-4">
              <p className="text-xs text-[#9e9e9e]">
                Envie um convite próprio por e-mail para um ou mais convidados. Usuários não cadastrados no sistema serão ignorados.
              </p>

              <div>
                <label className="block text-xs text-[#9e9e9e] mb-1.5 font-medium">
                  E-mails dos convidados (separados por vírgula) *
                </label>
                <textarea
                  rows={3}
                  value={emailsInput}
                  onChange={(e) => setEmailsInput(e.target.value)}
                  placeholder="usuario1@empresa.com, usuario2@empresa.com"
                  className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white text-sm placeholder-[#404040] focus:outline-none focus:border-[#ff8c42]/60 resize-none"
                />
                <span className="text-[10px] text-[#9e9e9e] mt-1 block">
                  Você pode colar múltiplos e-mails separados por vírgula. Cada um receberá seu convite individual. E-mails não cadastrados no sistema serão ignorados.
                </span>
              </div>

              <div>
                <label className="block text-xs text-[#9e9e9e] mb-1.5 font-medium">
                  Validade dos convites por e-mail (dias) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={diasValidadeEmail}
                  onChange={(e) => setDiasValidadeEmail(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white text-sm focus:outline-none focus:border-[#ff8c42]/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !emailsInput.trim()}
                className="w-full py-3 bg-[#ff8c42] hover:bg-[#ff8c42]/90 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando convite(s)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Convite(s)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
