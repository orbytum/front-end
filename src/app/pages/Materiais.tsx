import { Box, Plus, Search, Package, AlertCircle } from "lucide-react";
import { useState } from "react";

export function Materiais() {
  const [termoBusca, setTermoBusca] = useState("");

  const materiais = [
    {
      id: 1,
      nome: "Servidor GPU NVIDIA A100",
      grupo: "IA e Machine Learning",
      quantidade: 2,
      status: "Disponível",
      local: "Laboratório 3A",
      categoria: "Computação",
      dataAquisicao: "2024-01-20"
    },
    {
      id: 2,
      nome: "Computador Quântico IBM",
      grupo: "Computação Quântica",
      quantidade: 1,
      status: "Em Uso",
      local: "Laboratório Especial",
      categoria: "Equipamento Especializado",
      dataAquisicao: "2024-02-05"
    },
    {
      id: 3,
      nome: "Kit Desenvolvimento Arduino",
      grupo: "Segurança Cibernética",
      quantidade: 15,
      status: "Disponível",
      local: "Almoxarifado B",
      categoria: "Eletrônica",
      dataAquisicao: "2023-12-10"
    },
    {
      id: 4,
      nome: "Raspberry Pi 5",
      grupo: "Blockchain e Criptomoedas",
      quantidade: 10,
      status: "Em Uso",
      local: "Laboratório 2B",
      categoria: "Computação",
      dataAquisicao: "2024-03-15"
    },
    {
      id: 5,
      nome: "Osciloscópio Digital",
      grupo: "Segurança Cibernética",
      quantidade: 3,
      status: "Manutenção",
      local: "Manutenção",
      categoria: "Equipamento de Teste",
      dataAquisicao: "2023-11-25"
    },
    {
      id: 6,
      nome: "Licenças MATLAB",
      grupo: "IA e Machine Learning",
      quantidade: 20,
      status: "Disponível",
      local: "Software Virtual",
      categoria: "Software",
      dataAquisicao: "2024-01-10"
    },
  ];

  const materiaisFiltrados = materiais.filter(m =>
    m.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    m.grupo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    m.categoria.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const estatisticas = {
    total: materiais.length,
    disponiveis: materiais.filter(m => m.status === "Disponível").length,
    emUso: materiais.filter(m => m.status === "Em Uso").length,
    manutencao: materiais.filter(m => m.status === "Manutenção").length,
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Materiais e Equipamentos</h1>
        <p className="text-[#9e9e9e]">Gerencie o inventário de materiais dos grupos</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Total</span>
            <Package className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Disponível</span>
            <Box className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.disponiveis}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Em Uso</span>
            <Box className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.emUso}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Manutenção</span>
            <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.manutencao}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar materiais, grupos ou categorias..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Botão Novo Material */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Material</span>
        </button>
      </div>

      {/* Grade de Materiais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {materiaisFiltrados.map((material) => (
          <div
            key={material.id}
            className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300"
          >
            {/* Cabeçalho */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center flex-shrink-0">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold mb-1 truncate">{material.nome}</h3>
                <p className="text-sm text-[#9e9e9e] truncate">{material.grupo}</p>
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9e9e9e]">Categoria</span>
                <span className="text-sm text-white">{material.categoria}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9e9e9e]">Quantidade</span>
                <span className="text-sm font-semibold text-[#ff8c42]">{material.quantidade} un.</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9e9e9e]">Localização</span>
                <span className="text-sm text-white truncate ml-2">{material.local}</span>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2e2e2e]/30">
              <span className="text-xs text-[#9e9e9e]">
                Adq: {new Date(material.dataAquisicao).toLocaleDateString('pt-BR')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ material.status === "Disponível" ? "bg-[#10b981]/20 text-[#10b981]" : material.status === "Em Uso" ? "bg-[#ff8c42]/20 text-[#ff8c42]" : "bg-[#f59e0b]/20 text-[#f59e0b]" }`}>
                {material.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {materiaisFiltrados.length === 0 && (
        <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30">
          <Box className="w-16 h-16 text-[#2e2e2e] mx-auto mb-4" />
          <p className="text-[#9e9e9e]">Nenhum material encontrado</p>
        </div>
      )}
    </div>
  );
}