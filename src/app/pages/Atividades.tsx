import { ListTodo, Plus, Search, Calendar, FolderKanban, CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export function Atividades() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroProjeto, setFiltroProjeto] = useState("all");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const projetos = [
    { id: 1, nome: "Desenvolvimento de Modelo de Deep Learning" },
    { id: 2, nome: "Análise de Algoritmos Quânticos" },
    { id: 3, nome: "Auditoria de Segurança em Redes" },
    { id: 4, nome: "Implementação de Smart Contracts" },
  ];

  const atividades = [
    {
      id: 1,
      nome: "Coleta de Dataset de Imagens",
      descricao: "Realizar a coleta e curadoria de 10.000 imagens para treinamento do modelo de classificação",
      dataEntrega: "2024-04-15",
      projetoId: 1,
      nomeProjeto: "Desenvolvimento de Modelo de Deep Learning",
      status: "Em Andamento",
      dataConclusao: null
    },
    {
      id: 2,
      nome: "Implementação da Arquitetura CNN",
      descricao: "Desenvolver a arquitetura da rede neural convolucional baseada em ResNet",
      dataEntrega: "2024-04-20",
      projetoId: 1,
      nomeProjeto: "Desenvolvimento de Modelo de Deep Learning",
      status: "Pendente",
      dataConclusao: null
    },
    {
      id: 3,
      nome: "Treinamento do Modelo",
      descricao: "Treinar o modelo com os hiperparâmetros definidos e validar accuracy mínima de 85%",
      dataEntrega: "2024-04-30",
      projetoId: 1,
      nomeProjeto: "Desenvolvimento de Modelo de Deep Learning",
      status: "Pendente",
      dataConclusao: null
    },
    {
      id: 4,
      nome: "Revisão Bibliográfica sobre Qubits",
      descricao: "Compilar e analisar papers recentes sobre implementações de qubits topológicos",
      dataEntrega: "2024-04-12",
      projetoId: 2,
      nomeProjeto: "Análise de Algoritmos Quânticos",
      status: "Concluída",
      dataConclusao: "2024-04-10"
    },
    {
      id: 5,
      nome: "Simulação de Algoritmo de Shor",
      descricao: "Implementar simulação do algoritmo de Shor para fatoração de números primos",
      dataEntrega: "2024-05-01",
      projetoId: 2,
      nomeProjeto: "Análise de Algoritmos Quânticos",
      status: "Em Andamento",
      dataConclusao: null
    },
    {
      id: 6,
      nome: "Análise de Complexidade",
      descricao: "Comparar complexidade temporal e espacial com algoritmos clássicos equivalentes",
      dataEntrega: "2024-05-15",
      projetoId: 2,
      nomeProjeto: "Análise de Algoritmos Quânticos",
      status: "Pendente",
      dataConclusao: null
    },
    {
      id: 7,
      nome: "Scan de Vulnerabilidades",
      descricao: "Executar scan automatizado em todos os servidores da infraestrutura de rede",
      dataEntrega: "2024-04-08",
      projetoId: 3,
      nomeProjeto: "Auditoria de Segurança em Redes",
      status: "Atrasada",
      dataConclusao: null
    },
    {
      id: 8,
      nome: "Análise de Logs de Segurança",
      descricao: "Revisar logs dos últimos 3 meses identificando padrões suspeitos",
      dataEntrega: "2024-04-18",
      projetoId: 3,
      nomeProjeto: "Auditoria de Segurança em Redes",
      status: "Em Andamento",
      dataConclusao: null
    },
    {
      id: 9,
      nome: "Relatório de Recomendações",
      descricao: "Elaborar relatório técnico com recomendações de melhorias de segurança",
      dataEntrega: "2024-04-25",
      projetoId: 3,
      nomeProjeto: "Auditoria de Segurança em Redes",
      status: "Pendente",
      dataConclusao: null
    },
    {
      id: 10,
      nome: "Deploy do Contrato ERC-721",
      descricao: "Realizar deploy e verificação do contrato de NFT na testnet Sepolia",
      dataEntrega: "2024-03-25",
      projetoId: 4,
      nomeProjeto: "Implementação de Smart Contracts",
      status: "Concluída",
      dataConclusao: "2024-03-24"
    },
    {
      id: 11,
      nome: "Testes de Integração",
      descricao: "Executar suite completa de testes incluindo edge cases e security tests",
      dataEntrega: "2024-03-28",
      projetoId: 4,
      nomeProjeto: "Implementação de Smart Contracts",
      status: "Concluída",
      dataConclusao: "2024-03-27"
    },
  ];

  const atividadesFiltradas = atividades.filter(a => {
    const correspondeBusca = a.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         a.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         a.nomeProjeto.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeProjeto = filtroProjeto === "all" || a.projetoId === parseInt(filtroProjeto);
    const correspondeStatus = filtroStatus === "all" || a.status === filtroStatus;
    return correspondeBusca && correspondeProjeto && correspondeStatus;
  });

  const estatisticas = {
    total: atividades.length,
    pendentes: atividades.filter(a => a.status === "Pendente").length,
    emAndamento: atividades.filter(a => a.status === "Em Andamento").length,
    concluidas: atividades.filter(a => a.status === "Concluída").length,
    atrasadas: atividades.filter(a => a.status === "Atrasada").length,
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case "Concluída": return <CheckCircle className="w-5 h-5 text-[#10b981]" />;
      case "Em Andamento": return <Clock className="w-5 h-5 text-[#ff8c42]" />;
      case "Atrasada": return <AlertCircle className="w-5 h-5 text-[#ef4444]" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "Concluída": return "bg-[#10b981]/20 text-[#10b981]";
      case "Em Andamento": return "bg-[#ff8c42]/20 text-[#ff8c42]";
      case "Atrasada": return "bg-[#ef4444]/20 text-[#ef4444]";
      default: return "bg-muted-foreground/20 text-muted-foreground";
    }
  };

  const estaAtrasada = (dataEntrega: string, status: string) => {
    if (status === "Concluída") return false;
    return new Date(dataEntrega) < new Date();
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Atividades</h1>
        <p className="text-muted-foreground">Gerencie as atividades dos projetos em andamento</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total</span>
            <ListTodo className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Pendentes</span>
            <Circle className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.pendentes}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Em Andamento</span>
            <Clock className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.emAndamento}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Concluídas</span>
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.concluidas}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Atrasadas</span>
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.atrasadas}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar atividades..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Filtro por Projeto */}
        <select
          value={filtroProjeto}
          onChange={(e) => setFiltroProjeto(e.target.value)}
          className="px-4 py-3 bg-card rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Projetos</option>
          {projetos.map(projeto => (
            <option key={projeto.id} value={projeto.id}>{projeto.nome}</option>
          ))}
        </select>

        {/* Filtro por Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-3 bg-card rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Status</option>
          <option value="Pendente">Pendentes</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Concluída">Concluídas</option>
          <option value="Atrasada">Atrasadas</option>
        </select>

        {/* Botão Nova Atividade */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {atividadesFiltradas.map((atividade) => (
          <div
            key={atividade.id}
            className="bg-card rounded-2xl p-6 border border-border/30 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Informações da Atividade */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  {obterIconeStatus(atividade.status)}
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold mb-1">{atividade.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{atividade.descricao}</p>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-[#4a9eff]" />
                      <span className="text-xs text-muted-foreground">{atividade.nomeProjeto}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadados da Atividade */}
              <div className="flex flex-col items-start lg:items-end gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorStatus(atividade.status)}`}>
                  {atividade.status}
                </span>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="text-xs">
                    <span className="text-muted-foreground">Entrega: </span>
                    <span className={`font-medium ${ estaAtrasada(atividade.dataEntrega, atividade.status) ? "text-[#ef4444]" : "text-foreground" }`}>
                      {new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {atividade.dataConclusao && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#10b981]" />
                    <div className="text-xs">
                      <span className="text-muted-foreground">Concluída em: </span>
                      <span className="text-[#10b981] font-medium">
                        {new Date(atividade.dataConclusao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {atividadesFiltradas.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/30">
          <ListTodo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
        </div>
      )}
    </div>
  );
}
