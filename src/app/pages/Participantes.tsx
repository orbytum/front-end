import { UserCheck, Search, Mail, Phone, BookOpen, UserPlus, Lock, Crown, Loader2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useGrupo } from "../contexts/GrupoContext";
import { AuthService } from "../services/auth/AuthService";
import { GrupoService } from "../services/grupos/GrupoService";
import { PesquisadorResponse } from "../models/dto/grupos/PesquisadorPaginado";
import { ModalConvidarMembro } from "../components/ModalConvidarMembro";

export function Participantes() {
  const [termoBusca, setTermoBusca] = useState("");
  const [modalConvidarAberto, setModalConvidarAberto] = useState(false);

  const [participantes, setParticipantes] = useState<PesquisadorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { grupoAtual } = useGrupo();
  const authService = new AuthService();
  const grupoService = new GrupoService();

  const isAdmin = authService.isAdmin();
  const podeConvidar = isAdmin || Boolean(grupoAtual?.isLider);

  const carregarParticipantes = useCallback(async () => {
    if (!grupoAtual?.id) {
      setParticipantes([]);
      setTotalElements(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const res = await grupoService.listarPesquisadores(grupoAtual.id, {
        page,
        size: 10,
        nome: termoBusca || undefined,
      });
      setParticipantes(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      setErro(err?.mensagem || err?.message || "Erro ao carregar participantes do grupo.");
      setParticipantes([]);
    } finally {
      setLoading(false);
    }
  }, [grupoAtual?.id, page, termoBusca]);

  useEffect(() => {
    carregarParticipantes();
  }, [carregarParticipantes]);

  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermoBusca(e.target.value);
    setPage(1);
  };

  const getAvatarText = (nome: string) => {
    if (!nome) return "U";
    const partes = nome.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold mb-2">Participantes</h1>
        <p className="text-muted-foreground">Gerencie os participantes do grupo de pesquisa</p>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar participante por nome..."
            value={termoBusca}
            onChange={handleBuscaChange}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>

        {/* Botão Convidar Participante */}
        {podeConvidar && grupoAtual ? (
          <button
            onClick={() => setModalConvidarAberto(true)}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 flex items-center gap-2 font-medium cursor-pointer shadow-lg shadow-primary/20 text-sm whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5" />
            <span>Convidar Membro</span>
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="px-6 py-3 bg-card text-muted-foreground rounded-xl flex items-center gap-2 font-medium cursor-not-allowed text-sm border border-border/30 whitespace-nowrap"
            >
              <Lock className="w-4 h-4" />
              <span>Convidar Membro</span>
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-card text-muted-foreground text-xs px-3 py-1.5 rounded-lg border border-border/40 whitespace-nowrap shadow-xl z-10">
              {!grupoAtual ? "Selecione um grupo no header para convidar membros" : "Apenas o líder do grupo pode convidar membros"}
            </div>
          </div>
        )}
      </div>

      {erro && (
        <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ef4444] text-sm">
          {erro}
        </div>
      )}

      {!grupoAtual ? (
        <div className="bg-card rounded-2xl p-12 border border-border/30 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground font-semibold text-lg mb-2">Nenhum grupo selecionado</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Por favor, selecione um grupo de pesquisa no menu superior (header) para visualizar seus participantes.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/30 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Carregando participantes...</p>
            </div>
          ) : participantes.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium text-base mb-1">Nenhum participante encontrado</p>
              <p className="text-muted-foreground text-xs">
                {termoBusca ? `Nenhum resultado para "${termoBusca}"` : "Este grupo ainda não possui participantes cadastrados."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-background/40">
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participante</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cargo / Função</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grupo</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contato</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((participante, index) => {
                    const id = participante.usuarioId || participante.id || index;
                    const cargoStr = participante.isLider
                      ? "Líder"
                      : (participante.cargo || participante.role || participante.titulo || "Membro");

                    return (
                      <tr
                        key={id}
                        className={`border-b border-border/30 hover:bg-background/50 transition-colors ${
                          index === participantes.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                              participante.isLider
                                ? "bg-primary/15 text-primary border border-primary/30"
                                : "bg-[#4a9eff]/15 text-[#4a9eff] border border-[#4a9eff]/30"
                            }`}>
                              {getAvatarText(participante.nome)}
                            </div>
                            <div>
                              <div className="text-foreground font-medium flex items-center gap-2">
                                <span>{participante.nome}</span>
                                {participante.isLider && (
                                  <span title="Líder do Grupo">
                                    <Crown className="w-4 h-4 text-primary inline" />
                                  </span>
                                )}
                              </div>
                              {participante.titulo && (
                                <div className="text-xs text-muted-foreground">{participante.titulo}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {participante.isLider ? (
                              <Crown className="w-4 h-4 text-primary" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-primary" />
                            )}
                            <span className={participante.isLider ? "text-primary font-semibold" : ""}>
                              {cargoStr}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-muted-foreground font-medium">{grupoAtual.nome}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 text-primary" />
                              <span>{participante.email}</span>
                            </div>
                            {participante.telefone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{participante.telefone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10b981]/20 text-[#10b981]">
                            Ativo
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border/30 bg-background/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Mostrando {participantes.length} de {totalElements} participantes
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-foreground px-2">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Convidar Membro */}
      {grupoAtual && (
        <ModalConvidarMembro
          isOpen={modalConvidarAberto}
          onClose={() => {
            setModalConvidarAberto(false);
            carregarParticipantes();
          }}
          grupoId={grupoAtual.id}
          nomeGrupo={grupoAtual.nome}
        />
      )}
    </div>
  );
}