import { Users, Plus, Search, MoreVertical, Shield, Calendar, UserCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Grupos() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState("");

  const grupos = [
    {
      id: 1,
      nome: "Inteligência Artificial e Machine Learning",
      supervisor: "Dr. Carlos Silva",
      participantes: 8,
      orcamento: "R$ 45.000",
      status: "Ativo",
      projetos: 5,
      dataInicio: "2024-01-15"
    },
    {
      id: 2,
      nome: "Computação Quântica",
      supervisor: "Dra. Ana Paula Santos",
      participantes: 5,
      orcamento: "R$ 67.000",
      status: "Ativo",
      projetos: 3,
      dataInicio: "2024-02-01"
    },
    {
      id: 3,
      nome: "Segurança Cibernética",
      supervisor: "Dr. Roberto Mendes",
      participantes: 12,
      orcamento: "R$ 38.000",
      status: "Ativo",
      projetos: 8,
      dataInicio: "2023-11-20"
    },
    {
      id: 4,
      nome: "Blockchain e Criptomoedas",
      supervisor: "Dra. Juliana Costa",
      participantes: 6,
      orcamento: "R$ 52.000",
      status: "Em Planejamento",
      projetos: 2,
      dataInicio: "2024-03-10"
    },
  ];

  const gruposFiltrados = grupos.filter(grupo =>
    grupo.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    grupo.supervisor.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Grupos de Pesquisa</h1>
        <p className="text-[#9e9e9e]">Gerencie os grupos de pesquisa e suas configurações</p>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar grupos ou supervisores..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Botão Novo Grupo */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Grupo</span>
        </button>
      </div>

      {/* Grade de Grupos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gruposFiltrados.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300 group"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{grupo.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#9e9e9e]">
                    <Shield className="w-4 h-4" />
                    <span>{grupo.supervisor}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-[#2e2e2e]/20 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-[#9e9e9e]" />
              </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-[#ff8c42] font-semibold">{grupo.participantes}</div>
                <div className="text-xs text-[#9e9e9e]">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-[#ff8c42] font-semibold">{grupo.projetos}</div>
                <div className="text-xs text-[#9e9e9e]">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-[#ff8c42] font-semibold">{grupo.orcamento}</div>
                <div className="text-xs text-[#9e9e9e]">Orçamento</div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2e2e2e]/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-[#9e9e9e]">
                  <Calendar className="w-4 h-4" />
                  <span>Início: {new Date(grupo.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
                <button
                  onClick={() => navigate(`/grupos/${grupo.id}/participantes`)}
                  className="flex items-center gap-2 text-xs text-[#4a9eff] hover:text-[#ff8c42] transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Gerenciar Participantes</span>
                </button>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ grupo.status === "Ativo" ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#ff8c42]/20 text-[#ff8c42]" }`}>
                {grupo.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}