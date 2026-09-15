import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  Orbit,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Calendar,
  UserCheck,
  LogIn,
} from "lucide-react";
import { ConviteService } from "../services/convites/ConviteService";
import { AuthService } from "../services/auth/AuthService";
import { ConviteGrupoDetalhe } from "../models/dto/convites/ConviteGrupoDetalhe";
import { HttpError } from "../utils/HttpError";

type ViewStatus = "carregando" | "visualizacao" | "sucesso" | "ja_membro" | "invalido";

function formatarData(dataIso?: string | null) {
  if (!dataIso) return null;
  try {
    const data = new Date(dataIso);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return null;
  }
}

export function AceitarConviteGrupo() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<ViewStatus>("carregando");
  const [convite, setConvite] = useState<ConviteGrupoDetalhe | null>(null);
  const [mensagemErro, setMensagemErro] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  const conviteService = new ConviteService();
  const authService = new AuthService();
  const estaAutenticado = authService.isAuthenticated();

  useEffect(() => {
    if (!token) {
      setStatus("invalido");
      setMensagemErro("Token de convite não informado.");
      return;
    }

    let montado = true;

    async function buscarConvite() {
      try {
        const dados = await conviteService.buscarConviteGrupo(token!);
        if (!montado) return;
        setConvite(dados);
        setStatus("visualizacao");
      } catch (err: any) {
        if (!montado) return;
        setStatus("invalido");
        if (err instanceof HttpError) {
          setMensagemErro(err.response?.mensagem || "Este convite é inválido, expirou ou atingiu o limite de usos.");
        } else {
          setMensagemErro("Não foi possível carregar os dados deste convite.");
        }
      }
    }

    buscarConvite();

    return () => {
      montado = false;
    };
  }, [token]);

  const handleAceitarConvite = async () => {
    if (!token) return;

    if (!estaAutenticado) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    setSubmetendo(true);
    setMensagemErro("");

    try {
      const res = await conviteService.aceitarConviteGrupo(token);

      const novoGrupo = {
        id: res.idGrupo,
        nome: res.nomeGrupo,
      };

      try {
        const json = JSON.stringify(novoGrupo);
        localStorage.setItem("grupo_atual", json);
        localStorage.setItem("grupo_id", String(res.idGrupo));
        sessionStorage.setItem("grupo_atual", json);
        sessionStorage.setItem("grupo_id", String(res.idGrupo));
        window.dispatchEvent(new CustomEvent("grupoAlterado", { detail: novoGrupo }));
      } catch (e) {
        console.error("Erro ao sincronizar armazenamento do grupo:", e);
      }

      setStatus("sucesso");
    } catch (err: any) {
      if (err instanceof HttpError) {
        const msg = err.response?.mensagem || err.message;
        if (err.status === 409 || msg.toLowerCase().includes("já pertence a este grupo") || msg.toLowerCase().includes("ja no grupo")) {
          setStatus("ja_membro");
          return;
        }
        setMensagemErro(msg);
      } else {
        setMensagemErro("Ocorreu um erro ao tentar entrar no grupo. Tente novamente.");
      }
    } finally {
      setSubmetendo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos orbitais de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-border/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-border/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border border-border/05" />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#ff8c42]/20"
            style={{ top: `${10 + i * 8}%`, left: `${6 + i * 9}%` }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo superior */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-[#ff8c42] flex items-center justify-center">
              <Orbit className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-wider">ORBYTUM</h1>
          <p className="text-muted-foreground text-xs mt-1">Gestão acadêmica orbital</p>
        </div>

        {/* ── CARREGANDO ── */}
        {status === "carregando" && (
          <div className="bg-card rounded-2xl p-8 border border-border/30 text-center">
            <Loader2 className="w-10 h-10 text-[#ff8c42] animate-spin mx-auto mb-4" />
            <h2 className="text-foreground font-semibold text-base mb-1">Localizando convite...</h2>
            <p className="text-muted-foreground text-xs">Aguarde enquanto verificamos os dados do grupo.</p>
          </div>
        )}

        {/* ── INVÁLIDO OU EXPIRADO ── */}
        {status === "invalido" && (
          <div className="bg-card rounded-2xl p-8 border border-[#ef4444]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Convite indisponível</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {mensagemErro || "Este link de convite é inválido, expirou ou já atingiu o limite máximo de utilizações."}
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-2.5 bg-background rounded-xl border border-border/30 text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
              >
                Ir para o login
              </button>
            </div>
          </div>
        )}

        {/* ── JÁ É MEMBRO DO GRUPO ── */}
        {status === "ja_membro" && (
          <div className="bg-card rounded-2xl p-8 border border-[#ff8c42]/30 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ff8c42]/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-[#ff8c42]" />
            </div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Você já pertence a este grupo</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sua conta já possui vínculo ativo com o grupo <span className="text-foreground font-medium">{convite?.nomeGrupo}</span>.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-3 bg-[#ff8c42] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-[#ff8c42]/90"
            >
              <span>Acessar o sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── SUCESSO ── */}
        {status === "sucesso" && (
          <div className="bg-card rounded-2xl p-8 border border-[#10b981]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-foreground font-semibold text-lg mb-2">Bem-vindo ao grupo!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Você agora é membro do grupo <span className="text-foreground font-semibold">{convite?.nomeGrupo}</span>. Você já pode visualizar projetos, atividades e recursos associados.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-3 bg-[#ff8c42] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-[#ff8c42]/90"
            >
              <span>Acessar o grupo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── VISUALIZAÇÃO E CONFIRMAÇÃO DO CONVITE ── */}
        {status === "visualizacao" && convite && (
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-2xl">
            {/* Cabeçalho do Card */}
            <div className="px-6 pt-6 pb-4 border-b border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-foreground font-semibold text-base">Convite de Grupo</h2>
                  <p className="text-muted-foreground text-xs">Participe deste grupo de pesquisa</p>
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6 space-y-5">
              {mensagemErro && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{mensagemErro}</span>
                </div>
              )}

              {/* Destaque do Nome do Grupo */}
              <div className="p-5 bg-background rounded-xl border border-border/40 text-center">
                <p className="text-xs uppercase tracking-wider text-[#ff8c42] font-semibold mb-1">
                  Grupo de Pesquisa
                </p>
                <h3 className="text-xl font-bold text-foreground tracking-wide break-words">
                  {convite.nomeGrupo}
                </h3>
              </div>

              {/* Detalhes do Convite */}
              <div className="space-y-2.5 text-sm">
                {convite.cargo && (
                  <div className="flex items-center justify-between py-2 px-3 bg-background/60 rounded-lg border border-border/20">
                    <span className="text-muted-foreground flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#ff8c42]" />
                      Função atribuída:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ff8c42]/10 text-[#ff8c42] border border-[#ff8c42]/20">
                      {convite.cargo}
                    </span>
                  </div>
                )}

                {convite.nomeRemetente && (
                  <div className="flex items-center justify-between py-2 px-3 bg-background/60 rounded-lg border border-border/20">
                    <span className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Convidado por:
                    </span>
                    <span className="text-foreground text-xs font-medium">
                      {convite.nomeRemetente}
                    </span>
                  </div>
                )}

                {convite.dthExpiracao && formatarData(convite.dthExpiracao) && (
                  <div className="flex items-center justify-between py-2 px-3 bg-background/60 rounded-lg border border-border/20">
                    <span className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Válido até:
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatarData(convite.dthExpiracao)}
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="pt-2">
                {estaAutenticado ? (
                  <button
                    type="button"
                    onClick={handleAceitarConvite}
                    disabled={submetendo}
                    className="w-full py-3.5 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#ff8c42]/20"
                  >
                    {submetendo ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Entrando no grupo...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar e Entrar no Grupo</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-xl border border-border/40 text-xs text-muted-foreground text-center">
                      Você precisa estar autenticado com sua conta para confirmar e entrar neste grupo.
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                      className="w-full py-3.5 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff8c42]/20"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Fazer login para entrar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}