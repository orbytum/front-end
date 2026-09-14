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

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho com Botão Voltar */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/grupos")}
          className="flex items-center gap-2 text-[#9e9e9e] hover:text-[#ff8c42] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Grupos</span>
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{nomeGrupoExibicao}</h1>
            <p className="text-[#9e9e9e] text-sm">Gerenciar participantes e cargos do grupo</p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Total de Participantes</span>
            <Users className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{totalAtivos}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Líderes</span>
            <Crown className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-white text-2xl font-bold">{lideresCount}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Membros / Pesquisadores</span>
            <UserCheck className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-2xl font-bold">{membrosCount}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar participantes por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50 text-sm"
          />
        </div>

        {/* Botão Adicionar Participante (Apenas Líder/Admin) */}
        {podeConvidar ? (
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
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30">
            <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
            <p className="text-[#9e9e9e] text-sm">Carregando participantes...</p>
          </div>
        ) : participantes.length === 0 ? (
          <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30">
            <UserCheck className="w-16 h-16 text-[#2e2e2e] mx-auto mb-4" />
            <p className="text-white font-medium mb-1">Nenhum participante encontrado</p>
            <p className="text-[#9e9e9e] text-xs">
              {termoBusca ? `Nenhum resultado para "${termoBusca}"` : "Este grupo não possui participantes vinculados."}
            </p>
          </div>
        ) : (
          participantes.map((participante, idx) => {
            const id = participante.usuarioId || participante.id || idx;
            const cargoStr = participante.isLider
              ? "Líder"
              : (participante.cargo || participante.role || participante.titulo || "Membro");

            return (
              <div
                key={id}
                className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300 hover:border-[#ff8c42]/30"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                          participante.isLider
                            ? "bg-[#ff8c42] text-white shadow-lg shadow-[#ff8c42]/20"
                            : "bg-[#2e2e2e] text-[#ff8c42] border border-[#ff8c42]/30"
                        }`}
                      >
                        {getAvatarText(participante.nome)}
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

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10b981]/20 text-[#10b981]">
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Convidar Membro */}
      <ModalConvidarMembro
        isOpen={modalConvidarAberto}
        onClose={() => {
          setModalConvidarAberto(false);
          carregarParticipantes();
        }}
        grupoId={numericGroupId}
        nomeGrupo={nomeGrupoExibicao}
      />
    </div>
  );
}
