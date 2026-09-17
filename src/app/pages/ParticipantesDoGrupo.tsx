import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Search, UserCheck, Shield, Crown, User, Users, Lock, UserPlus, Loader2, Mail, Phone } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useGrupo } from "../contexts/GrupoContext";
import { AuthService } from "../services/auth/AuthService";
import { GrupoService } from "../services/grupos/GrupoService";
import { PesquisadorResponse } from "../models/dto/grupos/PesquisadorPaginado";
import { ModalConvidarMembro } from "../components/ModalConvidarMembro";

export function ParticipantesDoGrupo() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const grupoService = new GrupoService();

  const [grupo, setGrupo] = useState<GrupoDetalhe | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [modalConvidarAberto, setModalConvidarAberto] = useState(false);

  const [participantes, setParticipantes] = useState<PesquisadorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const { grupoAtual } = useGrupo();
  const authService = new AuthService();
  const grupoService = new GrupoService();

  const isAdmin = authService.isAdmin();
  const numericGroupId = Number(groupId) || grupoAtual?.id || 0;
  const podeConvidar = isAdmin || (grupoAtual?.id === numericGroupId && Boolean(grupoAtual?.isLider));

  const nomeGrupoExibicao = (grupoAtual && grupoAtual.id === numericGroupId) ? grupoAtual.nome : `Grupo #${numericGroupId}`;

  const carregarParticipantes = useCallback(async () => {
    if (!numericGroupId) return;

    setLoading(true);
    setErro("");
    try {
      const res = await grupoService.listarPesquisadores(numericGroupId, {
        page: 1,
        size: 50,
        nome: termoBusca || undefined,
      });
      setParticipantes(res.items || []);
    } catch (err: any) {
      setErro(err?.mensagem || err?.message || "Erro ao carregar participantes do grupo.");
      setParticipantes([]);
    } finally {
      setLoading(false);
    }
  }, [numericGroupId, termoBusca]);

  useEffect(() => {
    carregarParticipantes();
  }, [carregarParticipantes]);

  const totalAtivos = participantes.length;
  const lideresCount = participantes.filter((p) => p.isLider).length;
  const membrosCount = totalAtivos - lideresCount;

  const getAvatarText = (nome: string) => {
    if (!nome) return "U";
    const partes = nome.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const participantesFiltrados = participantes.filter((p) => {
    const termo = termoBusca.toLowerCase();
    const correspondeBusca =
      p.nome.toLowerCase().includes(termo) ||
      p.email.toLowerCase().includes(termo) ||
      (p.cargo && p.cargo.toLowerCase().includes(termo)) ||
      (p.titulo && p.titulo.toLowerCase().includes(termo));

    if (filtroFuncao === "Líder") {
      return correspondeBusca && p.isLider;
    }
    if (filtroFuncao === "Pesquisador") {
      return correspondeBusca && !p.isLider;
    }
    return correspondeBusca;
  });

  const totalParticipantes = participantes.length;
  const totalLideres = participantes.filter((p) => p.isLider).length;
  const totalPesquisadores = participantes.filter((p) => !p.isLider).length;

  if (loading && !grupo) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/grupos")}
          className="flex items-center gap-2 text-muted-foreground hover:text-[#ff8c42] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Grupos</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-bold">
                {grupo ? grupo.nome : `Grupo #${groupId}`}
              </h1>
              <p className="text-muted-foreground text-sm">
                Gerencie os membros, líderes e pesquisadores vinculados ao grupo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={carregarDados}
            disabled={loading}
            className="p-2.5 bg-card hover:bg-border/30 border border-border/40 rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer self-start sm:self-auto"
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4a9eff] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total de Membros</p>
              <h3 className="text-foreground text-2xl font-bold">{totalParticipantes}</h3>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Integrantes ativos no grupo</span>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Líderes Responsáveis</p>
              <h3 className="text-foreground text-2xl font-bold text-[#ff8c42]">{totalLideres}</h3>
            </div>
          </div>
          <div className="text-white text-2xl font-bold">{lideresCount}</div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Pesquisadores</p>
              <h3 className="text-foreground text-2xl font-bold text-[#10b981]">{totalPesquisadores}</h3>
            </div>
          </div>
          <div className="text-white text-2xl font-bold">{membrosCount}</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar participantes por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-[#ff8c42]/50 transition-colors"
          />
          {termoBusca && (
            <button
              type="button"
              onClick={() => setTermoBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="px-4 py-2.5 bg-background rounded-xl border border-border/30 text-foreground text-sm focus:outline-none focus:border-[#ff8c42]/50 cursor-pointer"
        >
          <option value="all">Todos os Membros</option>
          <option value="Líder">Apenas Líderes</option>
          <option value="Pesquisador">Apenas Pesquisadores</option>
        </select>
      </div>

      {actionError && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setModalConvidarAberto(true)}
            className="px-6 py-3 bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium cursor-pointer shadow-lg shadow-[#ff8c42]/20 text-sm"
          >
            <UserPlus className="w-5 h-5" />
            <span>Convidar Membro</span>
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="px-6 py-3 bg-[#2e2e2e]/40 text-[#9e9e9e] rounded-xl flex items-center gap-2 font-medium cursor-not-allowed text-sm border border-[#2e2e2e]/30"
            >
              <Lock className="w-4 h-4" />
              <span>Convidar Membro</span>
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#121212] text-[#9e9e9e] text-xs px-3 py-1.5 rounded-lg border border-[#2e2e2e]/40 whitespace-nowrap shadow-xl z-10">
              Apenas o líder do grupo pode convidar participantes
            </div>
          </div>
        )}
      </div>

      {erro && (
        <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ef4444] text-sm">
          {erro}
        </div>
      )}

      {/* Lista de Participantes */}
      <div className="space-y-4">
        {participantesFiltrados.map((participante) => (
          <div
            key={participante.usuarioId}
            className="bg-card rounded-2xl p-6 border border-border/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${participante.isLider
                        ? "bg-[#ff8c42] text-white"
                        : "bg-[#4a9eff]/20 text-[#4a9eff]"
                      }`}
                  >
                    {participante.isLider ? (
                      <Crown className="w-5 h-5" />
                    ) : (
                      participante.nome.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-foreground font-semibold text-base">{participante.nome}</h3>
                      {participante.isLider ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-[#ff8c42]/15 text-[#ff8c42] border border-[#ff8c42]/30">
                          <Crown className="w-3.5 h-3.5" />
                          Líder
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-[#4a9eff]/15 text-[#4a9eff] border border-[#4a9eff]/30">
                          <UserCheck className="w-3.5 h-3.5" />
                          {participante.cargo || "Pesquisador"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{participante.email}</span>
                      </div>

                      {/* Detalhes */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-base">{participante.nome}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                              participante.isLider
                                ? "bg-[#ff8c42]/20 text-[#ff8c42] border border-[#ff8c42]/30"
                                : "bg-[#4a9eff]/20 text-[#4a9eff] border border-[#4a9eff]/30"
                            }`}
                          >
                            {participante.isLider ? (
                              <Crown className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            {cargoStr}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-[#9e9e9e]">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-[#ff8c42]" />
                            <span>{participante.email}</span>
                          </div>
                          {participante.telefone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-[#9e9e9e]" />
                              <span>{participante.telefone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(participante)}
                  className="p-2 rounded-lg bg-background hover:bg-[#ff8c42]/10 transition-colors border border-border/30 text-[#ff8c42] cursor-pointer"
                  title="Editar participante"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteParticipante(participante)}
                  disabled={deletingId === participante.usuarioId}
                  className="p-2 rounded-lg bg-background hover:bg-[#ef4444]/10 transition-colors border border-border/30 text-[#ef4444] cursor-pointer disabled:opacity-40"
                  title="Remover do grupo"
                >
                  {deletingId === participante.usuarioId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {participantesFiltrados.length === 0 && !loading && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/30">
          <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {termoBusca || filtroFuncao !== "all"
              ? "Nenhum participante encontrado para os filtros aplicados."
              : "Nenhum participante vinculado a este grupo até o momento."}
          </p>
        </div>
      )}

      {editModalOpen && editingParticipante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border/40 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">Editar Participante</h3>
                  <p className="text-muted-foreground text-xs">Atualize os dados cadastrais do membro</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateParticipante} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Nome Completo <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    disabled={updating}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Telefone <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                    disabled={updating}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Titulação <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    placeholder="Ex: Doutor, Mestre, Pesquisador"
                    disabled={updating}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    disabled={updating}
                    className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar Alterações</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
