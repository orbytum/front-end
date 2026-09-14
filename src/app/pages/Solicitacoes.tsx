import { FileText, Plus, Search, DollarSign, Laptop, Cpu, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export function Solicitacoes() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const solicitacoes = [
    {
      id: 1,
      titulo: "Verba para Participação em Conferência",
      tipo: "Financeiro",
      descricao: "Solicitação de recursos para inscrição e passagens para a NeurIPS 2024 em Vancouver",
      valor: "R$ 12.500,00",
      quantidade: null,
      solicitadoPor: "João Pedro Oliveira",
      grupo: "IA e Machine Learning",
      projeto: "Desenvolvimento de Modelo de Deep Learning",
      status: "Em Análise",
      dataSolicitacao: "2024-04-01",
      dataResposta: null,
      justificativa: "Apresentação de artigo aceito sobre arquiteturas de deep learning para classificação de imagens médicas"
    },
    {
      id: 2,
      titulo: "Estação de Trabalho GPU",
      tipo: "Equipamento",
      descricao: "Workstation com GPU NVIDIA RTX 4090 para treinamento de modelos",
      valor: "R$ 28.000,00",
      quantidade: "1 unidade",
      solicitadoPor: "Ana Carolina Lima",
      grupo: "IA e Machine Learning",
      projeto: "Otimização de Modelos de Linguagem",
      status: "Aprovada",
      dataSolicitacao: "2024-03-15",
      dataResposta: "2024-03-20",
      justificativa: "Necessário para acelerar treinamento de LLMs, reduzindo tempo de iteração de 48h para 6h"
    },
    {
      id: 3,
      titulo: "Componentes para Prototipagem",
      tipo: "Material",
      descricao: "Kit de componentes eletrônicos: microcontroladores, sensores e atuadores",
      valor: "R$ 3.200,00",
      quantidade: "1 kit completo",
      solicitadoPor: "Rafael Henrique Souza",
      grupo: "Blockchain e Criptomoedas",
      projeto: "Implementação de Smart Contracts",
      status: "Aprovada",
      dataSolicitacao: "2024-03-25",
      dataResposta: "2024-03-28",
      justificativa: "Desenvolvimento de hardware wallet para demonstração prática do projeto"
    },
    {
      id: 4,
      titulo: "Licença Anual Qiskit Premium",
      tipo: "Financeiro",
      descricao: "Licença de software para simulação quântica avançada",
      valor: "R$ 8.500,00",
      quantidade: "1 licença",
      solicitadoPor: "Maria Eduarda Santos",
      grupo: "Computação Quântica",
      projeto: "Análise de Algoritmos Quânticos",
      status: "Pendente",
      dataSolicitacao: "2024-04-05",
      dataResposta: null,
      justificativa: "Necessário para simulação de circuitos quânticos com mais de 30 qubits"
    },
    {
      id: 5,
      titulo: "Notebooks para Laboratório",
      tipo: "Equipamento",
      descricao: "3 notebooks Dell Precision 5570 para equipe de pesquisadores",
      valor: "R$ 45.000,00",
      quantidade: "3 unidades",
      solicitadoPor: "Lucas Ferreira Costa",
      grupo: "Segurança Cibernética",
      projeto: "Auditoria de Segurança em Redes",
      status: "Rejeitada",
      dataSolicitacao: "2024-03-10",
      dataResposta: "2024-03-18",
      justificativa: "Equipamentos atuais insuficientes para executar ferramentas de pentesting modernas"
    },
    {
      id: 6,
      titulo: "Servidor de Testes",
      tipo: "Equipamento",
      descricao: "Servidor Dell PowerEdge para ambiente de testes isolado",
      valor: "R$ 22.000,00",
      quantidade: "1 unidade",
      solicitadoPor: "Beatriz Almeida Rocha",
      grupo: "Segurança Cibernética",
      projeto: "Testes de Penetração",
      status: "Em Análise",
      dataSolicitacao: "2024-04-03",
      dataResposta: null,
      justificativa: "Necessário para realizar testes destrutivos sem comprometer infraestrutura de produção"
    },
    {
      id: 7,
      titulo: "Kits de Desenvolvimento FPGA",
      tipo: "Material",
      descricao: "Placas FPGA Xilinx Artix-7 para implementação de circuitos",
      valor: "R$ 6.800,00",
      quantidade: "2 unidades",
      solicitadoPor: "Maria Eduarda Santos",
      grupo: "Computação Quântica",
      projeto: "Análise de Algoritmos Quânticos",
      status: "Pendente",
      dataSolicitacao: "2024-04-06",
      dataResposta: null,
      justificativa: "Implementação de simuladores quânticos em hardware reconfigurável"
    },
    {
      id: 8,
      titulo: "Bolsas de Iniciação Científica",
      tipo: "Financeiro",
      descricao: "Recursos para 2 bolsas de IC por 12 meses",
      valor: "R$ 9.600,00",
      quantidade: "2 bolsas",
      solicitadoPor: "Dr. Carlos Silva",
      grupo: "IA e Machine Learning",
      projeto: null,
      status: "Aprovada",
      dataSolicitacao: "2024-02-20",
      dataResposta: "2024-03-01",
      justificativa: "Expansão da equipe para suportar 3 projetos simultâneos em andamento"
    },
  ];

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    const correspondeBusca = s.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         s.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         s.solicitadoPor.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         s.grupo.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeTipo = filtroTipo === "all" || s.tipo === filtroTipo;
    const correspondeStatus = filtroStatus === "all" || s.status === filtroStatus;
    return correspondeBusca && correspondeTipo && correspondeStatus;
  });

  const estatisticas = {
    total: solicitacoes.length,
    pendentes: solicitacoes.filter(s => s.status === "Pendente").length,
    emAnalise: solicitacoes.filter(s => s.status === "Em Análise").length,
    aprovadas: solicitacoes.filter(s => s.status === "Aprovada").length,
    rejeitadas: solicitacoes.filter(s => s.status === "Rejeitada").length,
    valorTotal: solicitacoes
      .filter(s => s.status === "Aprovada")
      .reduce((soma, s) => {
        const valor = parseFloat(s.valor.replace(/[^\d,]/g, '').replace(',', '.'));
        return soma + valor;
      }, 0)
  };

  const obterIconeTipo = (tipo: string) => {
    switch (tipo) {
      case "Financeiro": return <DollarSign className="w-5 h-5" />;
      case "Equipamento": return <Laptop className="w-5 h-5" />;
      case "Material": return <Cpu className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const obterCorTipo = (tipo: string) => {
    switch (tipo) {
      case "Financeiro": return "bg-[#10b981]/20 text-[#10b981]";
      case "Equipamento": return "bg-[#4a9eff]/20 text-[#4a9eff]";
      case "Material": return "bg-[#7c3aed]/20 text-[#7c3aed]";
      default: return "bg-[#9e9e9e]/20 text-[#9e9e9e]";
    }
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case "Aprovada": return <CheckCircle className="w-5 h-5 text-[#10b981]" />;
      case "Rejeitada": return <XCircle className="w-5 h-5 text-[#ef4444]" />;
      case "Em Análise": return <Clock className="w-5 h-5 text-[#ff8c42]" />;
      default: return <AlertCircle className="w-5 h-5 text-[#9e9e9e]" />;
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "Aprovada": return "bg-[#10b981]/20 text-[#10b981]";
      case "Rejeitada": return "bg-[#ef4444]/20 text-[#ef4444]";
      case "Em Análise": return "bg-[#ff8c42]/20 text-[#ff8c42]";
      default: return "bg-[#9e9e9e]/20 text-[#9e9e9e]";
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white font-bold mb-2">Solicitações de Recursos</h1>
        <p className="text-[#9e9e9e]">Gerencie solicitações de verbas, equipamentos e materiais</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Total</span>
            <FileText className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Pendentes</span>
            <AlertCircle className="w-5 h-5 text-[#9e9e9e]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.pendentes}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Em Análise</span>
            <Clock className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.emAnalise}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Aprovadas</span>
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.aprovadas}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Rejeitadas</span>
            <XCircle className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.rejeitadas}</div>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#9e9e9e] text-sm">Aprovado</span>
            <DollarSign className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-lg font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estatisticas.valorTotal)}
          </div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar solicitações..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Filtro por Tipo */}
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Tipos</option>
          <option value="Financeiro">Financeiro</option>
          <option value="Equipamento">Equipamento</option>
          <option value="Material">Material</option>
        </select>

        {/* Filtro por Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Status</option>
          <option value="Pendente">Pendentes</option>
          <option value="Em Análise">Em Análise</option>
          <option value="Aprovada">Aprovadas</option>
          <option value="Rejeitada">Rejeitadas</option>
        </select>

        {/* Botão Nova Solicitação */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {solicitacoesFiltradas.map((solicitacao) => (
          <div
            key={solicitacao.id}
            className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Informações da Solicitação */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-3 rounded-xl ${obterCorTipo(solicitacao.tipo)}`}>
                    {obterIconeTipo(solicitacao.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{solicitacao.titulo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorTipo(solicitacao.tipo)}`}>
                        {solicitacao.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-[#9e9e9e] mb-3">{solicitacao.descricao}</p>

                    {/* Grade de Detalhes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <span className="text-xs text-[#9e9e9e]">Solicitante</span>
                        <p className="text-sm text-white">{solicitacao.solicitadoPor}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[#9e9e9e]">Grupo</span>
                        <p className="text-sm text-white">{solicitacao.grupo}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[#9e9e9e]">Valor</span>
                        <p className="text-sm text-[#ff8c42] font-semibold">{solicitacao.valor}</p>
                      </div>
                      {solicitacao.quantidade && (
                        <div>
                          <span className="text-xs text-[#9e9e9e]">Quantidade</span>
                          <p className="text-sm text-white">{solicitacao.quantidade}</p>
                        </div>
                      )}
                    </div>

                    {/* Justificativa */}
                    <div className="bg-[#121212] rounded-lg p-3 border border-[#2e2e2e]/30">
                      <span className="text-xs text-[#9e9e9e] block mb-1">Justificativa</span>
                      <p className="text-sm text-white">{solicitacao.justificativa}</p>
                    </div>

                    {solicitacao.projeto && (
                      <div className="mt-2 text-xs text-[#9e9e9e]">
                        Projeto: <span className="text-[#4a9eff]">{solicitacao.projeto}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadados da Solicitação */}
              <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[180px]">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${obterCorStatus(solicitacao.status)}`}>
                  {obterIconeStatus(solicitacao.status)}
                  <span className="text-sm font-medium">{solicitacao.status}</span>
                </div>

                <div className="text-xs text-[#9e9e9e]">
                  Solicitado em:<br />
                  <span className="text-white font-medium">
                    {new Date(solicitacao.dataSolicitacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {solicitacao.dataResposta && (
                  <div className="text-xs text-[#9e9e9e]">
                    Respondido em:<br />
                    <span className="text-white font-medium">
                      {new Date(solicitacao.dataResposta).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {(solicitacao.status === "Pendente" || solicitacao.status === "Em Análise") && (
                  <div className="flex gap-2 mt-2">
                    <button className="px-4 py-2 bg-[#10b981]/20 text-[#10b981] rounded-lg hover:bg-[#10b981]/30 transition-colors text-xs font-medium">
                      Aprovar
                    </button>
                    <button className="px-4 py-2 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30 transition-colors text-xs font-medium">
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {solicitacoesFiltradas.length === 0 && (
        <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30">
          <FileText className="w-16 h-16 text-[#2e2e2e] mx-auto mb-4" />
          <p className="text-[#9e9e9e]">Nenhuma solicitação encontrada</p>
        </div>
      )}
    </div>
  );
}