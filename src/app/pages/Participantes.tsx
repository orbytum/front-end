import { UserCheck, Search, Mail, Phone, MoreVertical, BookOpen, UserPlus, Lock, Crown, Loader2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
        <h1 className="text-white mb-2">Participantes do Grupo</h1>
        <p className="text-[#9e9e9e]">
          {grupoAtual ? `Membros do grupo ${grupoAtual.nome}` : "Selecione um grupo no menu superior para visualizar os participantes"}
        </p>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar participante por nome..."
            value={termoBusca}
            onChange={handleBuscaChange}
            disabled={!grupoAtual}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50 text-sm disabled:opacity-50"
          />
        </div>

        {/* Botão Convidar Participante (Apenas Líder ou Admin) */}
        {podeConvidar && grupoAtual ? (
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

      {/* Alerta sem grupo selecionado */}
      {!grupoAtual ? (
        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30 p-12 text-center">
          <Users className="w-16 h-16 text-[#ff8c42]/40 mx-auto mb-4" />
          <h2 className="text-white text-lg font-bold mb-2">Nenhum grupo de pesquisa selecionado</h2>
          <p className="text-[#9e9e9e] text-sm max-w-md mx-auto">
            Por favor, selecione um grupo de pesquisa no menu superior (header) para visualizar seus participantes.
          </p>
        </div>
      ) : (
        <>
          {/* Tabela de Participantes */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30 overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
                <p className="text-[#9e9e9e] text-sm">Carregando participantes do banco de dados...</p>
              </div>
            ) : participantes.length === 0 ? (
              <div className="text-center py-16">
                <UserCheck className="w-16 h-16 text-[#2e2e2e] mx-auto mb-4" />
                <p className="text-white font-medium text-base mb-1">Nenhum participante encontrado</p>
                <p className="text-[#9e9e9e] text-xs">
                  {termoBusca ? `Nenhum resultado para "${termoBusca}"` : "Este grupo ainda não possui participantes cadastrados."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e2e2e]/30 bg-[#121212]/40">
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9e9e9e]">Participante</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9e9e9e]">Cargo / Função</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9e9e9e]">Grupo</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9e9e9e]">Contato</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9e9e9e]">Status</th>
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
                          className={`border-b border-[#2e2e2e]/30 hover:bg-[#121212]/50 transition-colors ${
                            index === participantes.length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                                participante.isLider ? "bg-[#ff8c42] text-white" : "bg-[#2e2e2e] text-[#ff8c42] border border-[#ff8c42]/30"
                              }`}>
                                {getAvatarText(participante.nome)}
                              </div>
                              <div>
                                <div className="text-white font-medium flex items-center gap-2">
                                  <span>{participante.nome}</span>
                                  {participante.isLider && (
                                    <Crown className="w-4 h-4 text-[#ff8c42] inline" title="Líder do Grupo" />
                                  )}
                                </div>
                                {participante.titulo && (
                                  <div className="text-xs text-[#9e9e9e]">{participante.titulo}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-[#9e9e9e]">
                              {participante.isLider ? (
                                <Crown className="w-4 h-4 text-[#ff8c42]" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-[#ff8c42]" />
                              )}
                              <span className={participante.isLider ? "text-[#ff8c42] font-semibold" : ""}>
                                {cargoStr}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[#9e9e9e] font-medium">{grupoAtual.nome}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-[#9e9e9e]">
                                <Mail className="w-3.5 h-3.5 text-[#ff8c42]" />
                                <span>{participante.email}</span>
                              </div>
                              {participante.telefone && (
                                <div className="flex items-center gap-2 text-sm text-[#9e9e9e]">
                                  <Phone className="w-3.5 h-3.5 text-[#9e9e9e]" />
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
              <div className="px-6 py-4 border-t border-[#2e2e2e]/30 bg-[#121212]/40 flex items-center justify-between">
                <span className="text-xs text-[#9e9e9e]">
                  Mostrando {participantes.length} de {totalElements} participantes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e]/40 text-[#9e9e9e] hover:text-white hover:border-[#ff8c42]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white px-2">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg bg-[#1e1e1e] border border-[#2e2e2e]/40 text-[#9e9e9e] hover:text-white hover:border-[#ff8c42]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
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