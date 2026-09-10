import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Search, UserCheck, Shield, Edit, Trash2, Crown, User, Users } from "lucide-react";
import { useState } from "react";

export function ParticipantesDoGrupo() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroFuncao, setFiltroFuncao] = useState("all");

  // Dados fictícios - seriam buscados via API usando groupId
  const informacoesDoGrupo = {
    id: groupId,
    nome: "Inteligência Artificial e Machine Learning",
    supervisor: "Dr. Carlos Silva"
  };

  const participantes = [
    {
      id: 1,
      nome: "Dr. Carlos Silva",
      email: "carlos.silva@universidade.edu.br",
      funcao: "Supervisor",
      dataEntrada: "2024-01-15",
      status: "Ativo",
      permissoes: ["Gerenciar Grupo", "Aprovar Projetos", "Gerenciar Orçamento", "Gerenciar Membros"]
    },
    {
      id: 2,
      nome: "João Pedro Oliveira",
      email: "joao.oliveira@universidade.edu.br",
      funcao: "Coordenador",
      dataEntrada: "2024-01-20",
      status: "Ativo",
      permissoes: ["Criar Projetos", "Editar Materiais", "Visualizar Orçamento"]
    },
    {
      id: 3,
      nome: "Ana Carolina Lima",
      email: "ana.lima@universidade.edu.br",
      funcao: "Pesquisador",
      dataEntrada: "2024-02-01",
      status: "Ativo",
      permissoes: ["Criar Projetos", "Editar Materiais"]
    },
    {
      id: 4,
      nome: "Rafael Santos Costa",
      email: "rafael.costa@universidade.edu.br",
      funcao: "Pesquisador",
      dataEntrada: "2024-02-10",
      status: "Ativo",
      permissoes: ["Criar Projetos", "Editar Materiais"]
    },
    {
      id: 5,
      nome: "Beatriz Almeida Rocha",
      email: "beatriz.rocha@universidade.edu.br",
      funcao: "Colaborador",
      dataEntrada: "2024-03-01",
      status: "Ativo",
      permissoes: ["Visualizar Projetos", "Comentar"]
    },
    {
      id: 6,
      nome: "Lucas Ferreira Silva",
      email: "lucas.silva@universidade.edu.br",
      funcao: "Colaborador",
      dataEntrada: "2024-03-05",
      status: "Ativo",
      permissoes: ["Visualizar Projetos", "Comentar"]
    },
    {
      id: 7,
      nome: "Marina Souza Santos",
      email: "marina.santos@universidade.edu.br",
      funcao: "Aluno",
      dataEntrada: "2024-03-15",
      status: "Ativo",
      permissoes: ["Visualizar Projetos"]
    },
    {
      id: 8,
      nome: "Felipe Rodrigues Lima",
      email: "felipe.lima@universidade.edu.br",
      funcao: "Aluno",
      dataEntrada: "2024-03-15",
      status: "Inativo",
      permissoes: ["Visualizar Projetos"]
    },
  ];

  const participantesFiltrados = participantes.filter(p => {
    const correspondeBusca = p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         p.email.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeFiltro = filtroFuncao === "all" || p.funcao === filtroFuncao;
    return correspondeBusca && correspondeFiltro;
  });

  const estatisticas = {
    total: participantes.filter(p => p.status === "Ativo").length,
    supervisores: participantes.filter(p => p.funcao === "Supervisor").length,
    coordenadores: participantes.filter(p => p.funcao === "Coordenador").length,
    pesquisadores: participantes.filter(p => p.funcao === "Pesquisador").length,
  };

  const obterIconeFuncao = (funcao: string) => {
    switch (funcao) {
      case "Supervisor": return <Crown className="w-5 h-5" />;
      case "Coordenador": return <Shield className="w-5 h-5" />;
      case "Pesquisador": return <UserCheck className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const obterCorFuncao = (funcao: string) => {
    switch (funcao) {
      case "Supervisor": return "bg-[#ff8c42] text-white";
      case "Coordenador": return "bg-[#7c3aed]/20 text-[#7c3aed]";
      case "Pesquisador": return "bg-[#4a9eff]/20 text-[#4a9eff]";
      case "Colaborador": return "bg-[#10b981]/20 text-[#10b981]";
      default: return "bg-[#8b96a5]/20 text-[#8b96a5]";
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho com Botão Voltar */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/grupos")}
          className="flex items-center gap-2 text-[#8b96a5] hover:text-[#ff8c42] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Grupos</span>
        </button>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white">{informacoesDoGrupo.nome}</h1>
            <p className="text-[#8b96a5]">Gerenciar participantes e permissões</p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Total Ativos</span>
            <Users className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Supervisor</span>
            <Crown className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.supervisores}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Coordenadores</span>
            <Shield className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.coordenadores}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Pesquisadores</span>
            <UserCheck className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.pesquisadores}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b96a5]" />
          <input
            type="text"
            placeholder="Buscar participantes..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#8b96a5] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Filtro */}
        <select
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="px-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todas as Funções</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Coordenador">Coordenador</option>
          <option value="Pesquisador">Pesquisador</option>
          <option value="Colaborador">Colaborador</option>
          <option value="Aluno">Aluno</option>
        </select>

        {/* Botão Adicionar Participante */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Adicionar Participante</span>
        </button>
      </div>

      {/* Lista de Participantes */}
      <div className="space-y-4">
        {participantesFiltrados.map((participante) => (
          <div
            key={participante.id}
            className={`bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 transition-all duration-300 ${ participante.status === "Inativo" ? "opacity-60" : "" }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Informações do Participante */}
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${obterCorFuncao(participante.funcao)} flex items-center justify-center font-bold text-lg`}>
                    {participante.funcao === "Supervisor" ? (
                      obterIconeFuncao(participante.funcao)
                    ) : (
                      participante.nome.charAt(0)
                    )}
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{participante.nome}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${obterCorFuncao(participante.funcao)}`}>
                        {obterIconeFuncao(participante.funcao)}
                        {participante.funcao}
                      </span>
                      {participante.status === "Inativo" && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#8b96a5]/20 text-[#8b96a5]">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#8b96a5] mb-3">{participante.email}</p>

                    {/* Permissões */}
                    <div className="flex flex-wrap gap-2">
                      {participante.permissoes.map((permissao, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#0a1929] rounded-lg text-xs text-[#8b96a5] border border-[#3d4f62]/30"
                        >
                          {permissao}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 lg:flex-col">
                <div className="text-xs text-[#8b96a5] mb-2">
                  Desde {new Date(participante.dataEntrada).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-[#0a1929] hover:bg-[#3d4f62]/20 transition-colors border border-[#3d4f62]/30">
                    <Edit className="w-4 h-4 text-[#4a9eff]" />
                  </button>
                  {participante.funcao !== "Supervisor" && (
                    <button className="p-2 rounded-lg bg-[#0a1929] hover:bg-[#3d4f62]/20 transition-colors border border-[#3d4f62]/30">
                      <Trash2 className="w-4 h-4 text-[#ef4444]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {participantesFiltrados.length === 0 && (
        <div className="text-center py-12 bg-[#0d1f30] rounded-2xl border border-[#3d4f62]/30">
          <UserCheck className="w-16 h-16 text-[#3d4f62] mx-auto mb-4" />
          <p className="text-[#8b96a5]">Nenhum participante encontrado</p>
        </div>
      )}

      {/* Legenda de Funções */}
      <div className="mt-8 bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30">
        <h3 className="text-white mb-4">Funções e Permissões</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-[#ff8c42]" />
              <span className="text-white text-sm font-medium">Supervisor</span>
            </div>
            <p className="text-xs text-[#8b96a5]">Controle total do grupo, orçamento e membros</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#7c3aed]" />
              <span className="text-white text-sm font-medium">Coordenador</span>
            </div>
            <p className="text-xs text-[#8b96a5]">Gerencia projetos e materiais, visualiza orçamento</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-[#4a9eff]" />
              <span className="text-white text-sm font-medium">Pesquisador</span>
            </div>
            <p className="text-xs text-[#8b96a5]">Cria projetos e edita materiais</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-[#10b981]" />
              <span className="text-white text-sm font-medium">Colaborador/Aluno</span>
            </div>
            <p className="text-xs text-[#8b96a5]">Visualiza e comenta em projetos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
