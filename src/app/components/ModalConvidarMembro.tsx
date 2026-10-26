import { useState } from "react";
import { X, Link2, Mail, Copy, Check, Loader2, Users, Send, ShieldCheck } from "lucide-react";
import { ConviteService } from "../services/convites/ConviteService";
import { AuthService } from "../services/auth/AuthService";
import { NivelMembro, NivelMembroLabels } from "../models/dto/NivelMembro";

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

  // Nível do convidado no grupo (líder só pode ser definido por administrador)
  const authService = new AuthService();
  const niveisDisponiveis: NivelMembro[] = authService.isAdminOrInitialAdmin()
    ? ["MEMBRO", "COLABORADOR", "LIDER"]
    : ["MEMBRO", "COLABORADOR"];
  const [nivelSelecionado, setNivelSelecionado] = useState<NivelMembro>("MEMBRO");

  // Estado para Link
  const [linkGerado, setLinkGerado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [diasValidadeLink, setDiasValidadeLink] = useState<number>(7);
  const [limiteUsoLink, setLimiteUsoLink] = useState<number>(5);

  // Estado para E-mail
  const [emailsInput, setEmailsInput] = useState("");
  const [diasValidadeEmail, setDiasValidadeEmail] = useState<number>(7);

  const conviteService = new ConviteService();

  const handleGerarLink = async () => {
    setLoading(true);
    setErro("");
    setSucessoMsg("");

    try {
      const res = await conviteService.gerarConviteGrupo({
        idGrupo: grupoId,
        diasValidade: diasValidadeLink || 7,
        limiteUso: limiteUsoLink || 5,
        nivel: nivelSelecionado,
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
          nivel: nivelSelecionado,
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
      <div className="bg-card border border-border/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-foreground font-bold text-lg">Convidar Membro</h2>
              <p className="text-muted-foreground text-xs">Grupo: {nomeGrupo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border/40 bg-background/50 p-1.5 gap-1 mx-6 mt-5 rounded-xl border">
          <button
            type="button"
            onClick={() => {
              setTab("link");
              setErro("");
              setSucessoMsg("");
            }}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === "link"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
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
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
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
          {/* Seleção de nível no grupo */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Nível do Convidado no Grupo *</span>
            </label>
            <select
              value={nivelSelecionado}
              onChange={(e) => setNivelSelecionado(e.target.value as NivelMembro)}
              className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              {niveisDisponiveis.map((n) => (
                <option key={n} value={n}>
                  {NivelMembroLabels[n]}
                </option>
              ))}
            </select>
          </div>

          {tab === "link" ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Gere um link reutilizável para compartilhar com novos membros do grupo de pesquisa.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                    Validade (dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={diasValidadeLink}
                    onChange={(e) => setDiasValidadeLink(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                    Limite de uso *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={limiteUsoLink}
                    onChange={(e) => setLimiteUsoLink(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              {!linkGerado ? (
                <button
                  type="button"
                  onClick={handleGerarLink}
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
                  <label className="block text-xs text-muted-foreground font-medium">
                    Link de Convite Gerado:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={linkGerado}
                      className="flex-1 px-3 py-2 bg-background rounded-xl border border-border/40 text-foreground text-xs select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopiarLink}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiado ? (
                        <>
                          <Check className="w-4 h-4 text-primary-foreground" />
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
              <p className="text-xs text-muted-foreground">
                Envie um convite próprio por e-mail para um ou mais convidados. Usuários não cadastrados no sistema serão ignorados.
              </p>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                  E-mails dos convidados (separados por vírgula) *
                </label>
                <textarea
                  rows={3}
                  value={emailsInput}
                  onChange={(e) => setEmailsInput(e.target.value)}
                  placeholder="usuario1@empresa.com, usuario2@empresa.com"
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/60 resize-none"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Você pode colar múltiplos e-mails separados por vírgula. Cada um receberá seu convite individual. E-mails não cadastrados no sistema serão ignorados.
                </span>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                  Validade dos convites por e-mail (dias) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={diasValidadeEmail}
                  onChange={(e) => setDiasValidadeEmail(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-background rounded-xl border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !emailsInput.trim()}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
