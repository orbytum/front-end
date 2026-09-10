import { FolderKanban, Plus, Search, Clock, CheckCircle, AlertCircle, Circle } from "lucide-react";
import { useState } from "react";

export function Projetos() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const projetos = [
    {
      id: 1,
      titulo: "Desenvolvimento de Modelo de Deep Learning",
      grupo: "IA e Machine Learning",
      responsavel: "João Pedro Oliveira",
      status: "Em Andamento",
      prioridade: "Alta",
      dataInicio: "2024-03-01",
      dataFim: "2024-04-30",
      progresso: 65
    },
    {
      id: 2,
      titulo: "Análise de Algoritmos Quânticos",
      grupo: "Computação Quântica",
      responsavel: "Maria Eduarda Santos",
      status: "Planejada",
      prioridade: "Média",
      dataInicio: "2024-04-10",
      dataFim: "2024-06-15",
      progresso: 0
    },
    {
      id: 3,
      titulo: "Auditoria de Segurança em Redes",
      grupo: "Segurança Cibernética",
      responsavel: "Lucas Ferreira Costa",
      status: "Em Andamento",
      prioridade: "Alta",
      dataInicio: "2024-02-15",
      dataFim: "2024-04-15",
      progresso: 80
    },
    {
      id: 4,
      titulo: "Implementação de Smart Contracts",
      grupo: "Blockchain e Criptomoedas",
      responsavel: "Rafael Henrique Souza",
      status: "Concluída",
      prioridade: "Média",
      dataInicio: "2024-01-10",
      dataFim: "2024-03-10",
      progresso: 100
    },
    {
      id: 5,
      titulo: "Otimização de Modelos de Linguagem",
      grupo: "IA e Machine Learning",
      responsavel: "Ana Carolina Lima",
      status: "Em Andamento",
      prioridade: "Alta",
      dataInicio: "2024-03-15",
      dataFim: "2024-05-20",
      progresso: 45
    },
    {
      id: 6,
      titulo: "Testes de Penetração",
      grupo: "Segurança Cibernética",
      responsavel: "Beatriz Almeida Rocha",
      status: "Atrasada",
      prioridade: "Alta",
      dataInicio: "2024-02-01",
      dataFim: "2024-03-30",
      progresso: 55
    },
  ];

  const projetosFiltrados = projetos.filter(p => {
    const correspondeBusca = p.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         p.grupo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         p.responsavel.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeFiltro = filtroStatus === "all" || p.status === filtroStatus;
    return correspondeBusca && correspondeFiltro;
  });

  const estatisticas = {
    total: projetos.length,
    emAndamento: projetos.filter(p => p.status === "Em Andamento").length,
    concluidos: projetos.filter(p => p.status === "Concluída").length,
    atrasados: projetos.filter(p => p.status === "Atrasada").length,
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case "Concluída": return <CheckCircle className="w-5 h-5 text-[#10b981]" />;
      case "Em Andamento": return <Clock className="w-5 h-5 text-[#ff8c42]" />;
      case "Atrasada": return <AlertCircle className="w-5 h-5 text-[#ef4444]" />;
      default: return <Circle className="w-5 h-5 text-[#8b96a5]" />;
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "Concluída": return "bg-[#10b981]/20 text-[#10b981]";
      case "Em Andamento": return "bg-[#ff8c42]/20 text-[#ff8c42]";
      case "Atrasada": return "bg-[#ef4444]/20 text-[#ef4444]";
      default: return "bg-[#8b96a5]/20 text-[#8b96a5]";
    }
  };

  const obterCorPrioridade = (prioridade: string) => {
    switch (prioridade) {
      case "Alta": return "bg-[#ef4444]/20 text-[#ef4444]";
      case "Média": return "bg-[#f59e0b]/20 text-[#f59e0b]";
      default: return "bg-[#10b981]/20 text-[#10b981]";
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Projetos</h1>
        <p className="text-[#8b96a5]">Acompanhe o progresso dos projetos dos grupos</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Total</span>
            <FolderKanban className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Em Andamento</span>
            <Clock className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.emAndamento}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Concluídas</span>
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.concluidos}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Atrasadas</span>
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.atrasados}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b96a5]" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#8b96a5] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Filtro */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Status</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Planejada">Planejadas</option>
          <option value="Concluída">Concluídas</option>
          <option value="Atrasada">Atrasadas</option>
        </select>

        {/* Botão Novo Projeto */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Lista de Projetos */}
      <div className="space-y-4">
        {projetosFiltrados.map((projeto) => (
          <div
            key={projeto.id}
            className="bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Informações do Projeto */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  {obterIconeStatus(projeto.status)}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{projeto.titulo}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#8b96a5]">
                      <span>{projeto.grupo}</span>
                      <span>•</span>
                      <span>{projeto.responsavel}</span>
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#8b96a5]">Progresso</span>
                    <span className="text-xs text-[#ff8c42] font-semibold">{projeto.progresso}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0a1929] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff8c42] rounded-full transition-all duration-300"
                      style={{ width: `${projeto.progresso}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Metadados do Projeto */}
              <div className="flex flex-wrap lg:flex-col items-start gap-3 lg:items-end">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorStatus(projeto.status)}`}>
                    {projeto.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorPrioridade(projeto.prioridade)}`}>
                    {projeto.prioridade}
                  </span>
                </div>
                <div className="text-xs text-[#8b96a5]">
                  {new Date(projeto.dataInicio).toLocaleDateString('pt-BR')} - {new Date(projeto.dataFim).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {projetosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-[#0d1f30] rounded-2xl border border-[#3d4f62]/30">
          <FolderKanban className="w-16 h-16 text-[#3d4f62] mx-auto mb-4" />
          <p className="text-[#8b96a5]">Nenhum projeto encontrado</p>
        </div>
      )}
    </div>
  );
}