import { Calendar as CalendarIcon, Plus, Search, MapPin, Clock, Users, CheckCircle } from "lucide-react";
import { useState } from "react";

export function Eventos() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const eventos = [
    {
      id: 1,
      nome: "Seminário de Inteligência Artificial 2024",
      descricao: "Apresentação dos avanços recentes em Deep Learning e suas aplicações práticas em visão computacional e processamento de linguagem natural.",
      local: "Auditório Principal - Bloco A",
      data: "2024-05-25",
      horario: "14:00",
      duracao: "3 horas",
      participantes: 120,
      organizador: "Grupo IA e Machine Learning",
      status: "Próximo"
    },
    {
      id: 2,
      nome: "Workshop de Computação Quântica",
      descricao: "Introdução prática aos conceitos de qubits, portas quânticas e algoritmos quânticos utilizando o framework Qiskit.",
      local: "Laboratório 203 - Bloco B",
      data: "2024-06-10",
      horario: "09:00",
      duracao: "6 horas",
      participantes: 30,
      organizador: "Grupo Computação Quântica",
      status: "Próximo"
    },
    {
      id: 3,
      nome: "Hackathon de Segurança Cibernética",
      descricao: "Competição prática de ethical hacking com desafios de penetration testing, análise de vulnerabilidades e forense digital.",
      local: "Campus Virtual (Online)",
      data: "2024-05-20",
      horario: "08:00",
      duracao: "24 horas",
      participantes: 80,
      organizador: "Grupo Segurança Cibernética",
      status: "Em Andamento"
    },
    {
      id: 4,
      nome: "Palestra: Blockchain e o Futuro das Finanças",
      descricao: "Discussão sobre DeFi, smart contracts e o impacto das tecnologias descentralizadas no sistema financeiro global.",
      local: "Sala de Conferências - Bloco C",
      data: "2024-04-15",
      horario: "16:00",
      duracao: "2 horas",
      participantes: 95,
      organizador: "Grupo Blockchain e Criptomoedas",
      status: "Encerrado"
    },
    {
      id: 5,
      nome: "Defesa de Dissertação - Otimização de LLMs",
      descricao: "Apresentação da pesquisa sobre técnicas de compressão e otimização de Large Language Models para deployment em dispositivos edge.",
      local: "Sala 401 - Bloco D",
      data: "2024-06-05",
      horario: "15:00",
      duracao: "2 horas",
      participantes: 25,
      organizador: "Grupo IA e Machine Learning",
      status: "Próximo"
    },
    {
      id: 6,
      nome: "Conferência Internacional de IA",
      descricao: "Participação na NeurIPS 2024 com apresentação de artigo sobre arquiteturas de deep learning para diagnóstico médico.",
      local: "Vancouver Convention Centre - Canadá",
      data: "2024-12-10",
      horario: "10:00",
      duracao: "5 dias",
      participantes: 8,
      organizador: "Grupo IA e Machine Learning",
      status: "Próximo"
    },
    {
      id: 7,
      nome: "Minicurso: Introdução ao Desenvolvimento Web3",
      descricao: "Curso prático sobre desenvolvimento de DApps usando Solidity, Hardhat e React, incluindo criação de smart contracts e interfaces.",
      local: "Laboratório 105 - Bloco E",
      data: "2024-07-15",
      horario: "13:00",
      duracao: "16 horas (4 dias)",
      participantes: 40,
      organizador: "Grupo Blockchain e Criptomoedas",
      status: "Próximo"
    },
    {
      id: 8,
      nome: "Reunião Mensal de Grupos de Pesquisa",
      descricao: "Encontro para alinhamento de atividades, apresentação de resultados parciais e discussão de recursos compartilhados.",
      local: "Sala de Reuniões - Bloco A",
      data: "2024-05-30",
      horario: "10:00",
      duracao: "2 horas",
      participantes: 45,
      organizador: "Coordenação Geral",
      status: "Próximo"
    },
    {
      id: 9,
      nome: "Demonstração de Projetos de IC",
      descricao: "Apresentação pública dos projetos desenvolvidos pelos bolsistas de iniciação científica durante o semestre.",
      local: "Hall Central - Bloco A",
      data: "2024-04-28",
      horario: "14:00",
      duracao: "4 horas",
      participantes: 150,
      organizador: "Coordenação Geral",
      status: "Encerrado"
    },
    {
      id: 10,
      nome: "Webinar: Tendências em Cibersegurança 2024",
      descricao: "Painel com especialistas discutindo ameaças emergentes, zero trust architecture e compliance com LGPD.",
      local: "Plataforma Zoom (Online)",
      data: "2024-06-20",
      horario: "19:00",
      duracao: "1,5 horas",
      participantes: 200,
      organizador: "Grupo Segurança Cibernética",
      status: "Próximo"
    },
  ];

  const eventosFiltrados = eventos.filter(e => {
    const correspondeBusca = e.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         e.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         e.local.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         e.organizador.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeStatus = filtroStatus === "all" || e.status === filtroStatus;
    return correspondeBusca && correspondeStatus;
  });

  const estatisticas = {
    total: eventos.length,
    proximos: eventos.filter(e => e.status === "Próximo").length,
    emAndamento: eventos.filter(e => e.status === "Em Andamento").length,
    encerrados: eventos.filter(e => e.status === "Encerrado").length,
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "Próximo": return "bg-[#4a9eff]/20 text-[#4a9eff]";
      case "Em Andamento": return "bg-[#ff8c42]/20 text-[#ff8c42]";
      case "Encerrado": return "bg-[#8b96a5]/20 text-[#8b96a5]";
      default: return "bg-[#8b96a5]/20 text-[#8b96a5]";
    }
  };

  const obterDiasAte = (data: string, status: string) => {
    if (status === "Encerrado") return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(data);
    dataEvento.setHours(0, 0, 0, 0);
    const diffTempo = dataEvento.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));
    return diffDias;
  };

  const formatarData = (data: string) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Eventos</h1>
        <p className="text-[#8b96a5]">Gerencie palestras, workshops e eventos científicos</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Total</span>
            <CalendarIcon className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Próximos</span>
            <Clock className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.proximos}</div>
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
            <span className="text-[#8b96a5] text-sm">Encerrados</span>
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.encerrados}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b96a5]" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#8b96a5] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Filtro por Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Status</option>
          <option value="Próximo">Próximos</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Encerrado">Encerrados</option>
        </select>

        {/* Botão Novo Evento */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-4">
        {eventosFiltrados.map((evento) => {
          const diasAte = obterDiasAte(evento.data, evento.status);

          return (
            <div
              key={evento.id}
              className={`bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 transition-all duration-300 ${ evento.status === "Encerrado" ? "opacity-70" : "" }`}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Informações do Evento */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#ff8c42] flex-shrink-0">
                      <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{evento.nome}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorStatus(evento.status)}`}>
                          {evento.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#8b96a5] mb-3">{evento.descricao}</p>

                      {/* Grade de Detalhes do Evento */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#4a9eff] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-[#8b96a5] block">Localização</span>
                            <span className="text-sm text-white">{evento.local}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-[#4a9eff] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-[#8b96a5] block">Horário e Duração</span>
                            <span className="text-sm text-white">{evento.horario} - {evento.duracao}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-[#4a9eff] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-[#8b96a5] block">Participantes</span>
                            <span className="text-sm text-white">{evento.participantes} pessoas</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-[#4a9eff] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-[#8b96a5] block">Organizador</span>
                            <span className="text-sm text-white">{evento.organizador}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadados do Evento */}
                <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[200px]">
                  <div className="bg-[#0a1929] rounded-lg px-4 py-3 border border-[#3d4f62]/30 text-center lg:min-w-[180px]">
                    <div className="text-3xl font-bold text-[#ff8c42] mb-1">
                      {new Date(evento.data).getDate()}
                    </div>
                    <div className="text-xs text-[#8b96a5] uppercase">
                      {new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                    <div className="text-sm text-white mt-1">
                      {new Date(evento.data).getFullYear()}
                    </div>
                  </div>

                  <div className="text-xs text-[#8b96a5] text-left lg:text-right">
                    {formatarData(evento.data)}
                  </div>

                  {diasAte !== null && diasAte >= 0 && (
                    <div className={`px-3 py-2 rounded-lg ${ diasAte === 0 ? "bg-[#ff8c42]/20 border border-[#ff8c42]/30" : diasAte <= 7 ? "bg-[#4a9eff]/20 border border-[#4a9eff]/30" : "bg-[#10b981]/20 border border-[#10b981]/30" }`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${ diasAte === 0 ? "text-[#ff8c42]" : diasAte <= 7 ? "text-[#4a9eff]" : "text-[#10b981]" }`} />
                        <span className={`text-sm font-semibold ${ diasAte === 0 ? "text-[#ff8c42]" : diasAte <= 7 ? "text-[#4a9eff]" : "text-[#10b981]" }`}>
                          {diasAte === 0
                            ? 'Hoje!'
                            : `em ${diasAte} ${diasAte === 1 ? 'dia' : 'dias'}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {evento.status === "Próximo" && (
                    <button className="mt-2 px-4 py-2 bg-[#4a9eff]/20 text-[#4a9eff] rounded-lg hover:bg-[#4a9eff]/30 transition-colors text-sm font-medium border border-[#4a9eff]/30">
                      Confirmar Presença
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado Vazio */}
      {eventosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-[#0d1f30] rounded-2xl border border-[#3d4f62]/30">
          <CalendarIcon className="w-16 h-16 text-[#3d4f62] mx-auto mb-4" />
          <p className="text-[#8b96a5]">Nenhum evento encontrado</p>
        </div>
      )}
    </div>
  );
}
