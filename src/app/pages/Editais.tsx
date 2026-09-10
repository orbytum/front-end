import { Megaphone, Plus, Search, Calendar, Building2, Tag, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export function Editais() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const editais = [
    {
      id: 1,
      titulo: "Edital Universal CNPq 2024",
      tema: "Pesquisa Científica e Tecnológica",
      descricao: "Apoio a projetos de pesquisa científica, tecnológica e de inovação, nas diversas áreas do conhecimento, que representem contribuição significativa para o desenvolvimento científico e tecnológico do País.",
      organizacao: "CNPq - Conselho Nacional de Desenvolvimento Científico e Tecnológico",
      data: "2024-05-30",
      status: "Aberto",
      prazoSubmissao: "2024-05-30",
      valor: "R$ 150.000.000,00"
    },
    {
      id: 2,
      titulo: "FAPESP - Jovem Pesquisador",
      tema: "Formação de Recursos Humanos",
      descricao: "Apoio a jovens pesquisadores para desenvolvimento de projetos de pesquisa em instituições de ensino superior e pesquisa no Estado de São Paulo.",
      organizacao: "FAPESP - Fundação de Amparo à Pesquisa do Estado de São Paulo",
      data: "2024-06-15",
      status: "Aberto",
      prazoSubmissao: "2024-06-15",
      valor: "R$ 80.000.000,00"
    },
    {
      id: 3,
      titulo: "Edital de Inovação Tecnológica FINEP",
      tema: "Inovação e Desenvolvimento Tecnológico",
      descricao: "Financiamento a projetos de pesquisa, desenvolvimento e inovação tecnológica em empresas brasileiras, com foco em tecnologias emergentes e soluções inovadoras.",
      organizacao: "FINEP - Financiadora de Estudos e Projetos",
      data: "2024-04-20",
      status: "Encerrado",
      prazoSubmissao: "2024-04-20",
      valor: "R$ 200.000.000,00"
    },
    {
      id: 4,
      titulo: "Edital CAPES - Computação Quântica",
      tema: "Computação Quântica",
      descricao: "Programa de apoio à pesquisa em computação quântica, incluindo desenvolvimento de algoritmos, hardware quântico e aplicações práticas da tecnologia quântica.",
      organizacao: "CAPES - Coordenação de Aperfeiçoamento de Pessoal de Nível Superior",
      data: "2024-07-01",
      status: "Em Breve",
      prazoSubmissao: "2024-07-01",
      valor: "R$ 50.000.000,00"
    },
    {
      id: 5,
      titulo: "Programa de IA e Machine Learning",
      tema: "Inteligência Artificial",
      descricao: "Apoio a projetos de pesquisa em inteligência artificial, aprendizado de máquina, visão computacional e processamento de linguagem natural com aplicações práticas.",
      organizacao: "MCTI - Ministério da Ciência, Tecnologia e Inovações",
      data: "2024-05-15",
      status: "Aberto",
      prazoSubmissao: "2024-05-15",
      valor: "R$ 120.000.000,00"
    },
    {
      id: 6,
      titulo: "Edital de Segurança Cibernética",
      tema: "Segurança da Informação",
      descricao: "Fomento a pesquisas em segurança cibernética, criptografia, proteção de dados e infraestrutura crítica, visando fortalecer a segurança digital nacional.",
      organizacao: "BNDES - Banco Nacional de Desenvolvimento Econômico e Social",
      data: "2024-06-30",
      status: "Aberto",
      prazoSubmissao: "2024-06-30",
      valor: "R$ 75.000.000,00"
    },
    {
      id: 7,
      titulo: "Edital Blockchain e Web3",
      tema: "Tecnologias Descentralizadas",
      descricao: "Apoio a projetos de pesquisa e desenvolvimento em blockchain, contratos inteligentes, NFTs e aplicações descentralizadas (dApps).",
      organizacao: "Fundação Araucária",
      data: "2024-03-31",
      status: "Encerrado",
      prazoSubmissao: "2024-03-31",
      valor: "R$ 30.000.000,00"
    },
    {
      id: 8,
      titulo: "Programa de Infraestrutura de Pesquisa",
      tema: "Infraestrutura Científica",
      descricao: "Aquisição e modernização de equipamentos científicos de grande porte para laboratórios multiusuários em instituições de pesquisa.",
      organizacao: "CNPq - Conselho Nacional de Desenvolvimento Científico e Tecnológico",
      data: "2024-08-15",
      status: "Em Breve",
      prazoSubmissao: "2024-08-15",
      valor: "R$ 180.000.000,00"
    },
    {
      id: 9,
      titulo: "Edital de Cooperação Internacional",
      tema: "Pesquisa Colaborativa Internacional",
      descricao: "Apoio a projetos de pesquisa em colaboração com instituições estrangeiras, incluindo mobilidade de pesquisadores e organização de eventos científicos.",
      organizacao: "CAPES - Coordenação de Aperfeiçoamento de Pessoal de Nível Superior",
      data: "2024-05-20",
      status: "Aberto",
      prazoSubmissao: "2024-05-20",
      valor: "R$ 95.000.000,00"
    },
  ];

  const editaisFiltrados = editais.filter(e => {
    const correspondeBusca = e.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         e.tema.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         e.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                         e.organizacao.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeStatus = filtroStatus === "all" || e.status === filtroStatus;
    return correspondeBusca && correspondeStatus;
  });

  const estatisticas = {
    total: editais.length,
    abertos: editais.filter(e => e.status === "Aberto").length,
    encerrados: editais.filter(e => e.status === "Encerrado").length,
    emBreve: editais.filter(e => e.status === "Em Breve").length,
  };

  const obterIconeStatus = (status: string) => {
    switch (status) {
      case "Aberto": return <CheckCircle className="w-5 h-5 text-[#10b981]" />;
      case "Encerrado": return <XCircle className="w-5 h-5 text-[#8b96a5]" />;
      default: return <Clock className="w-5 h-5 text-[#ff8c42]" />;
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case "Aberto": return "bg-[#10b981]/20 text-[#10b981]";
      case "Encerrado": return "bg-[#8b96a5]/20 text-[#8b96a5]";
      default: return "bg-[#ff8c42]/20 text-[#ff8c42]";
    }
  };

  const obterDiasRestantes = (data: string, status: string) => {
    if (status === "Encerrado") return null;
    const hoje = new Date();
    const prazo = new Date(data);
    const diffTempo = prazo.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));
    return diffDias;
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Editais</h1>
        <p className="text-[#8b96a5]">Acompanhe editais de fomento e oportunidades de financiamento</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Total</span>
            <Megaphone className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Abertos</span>
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.abertos}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Em Breve</span>
            <Clock className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-white text-2xl font-bold">{estatisticas.emBreve}</div>
        </div>

        <div className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8b96a5] text-sm">Encerrados</span>
            <XCircle className="w-5 h-5 text-[#8b96a5]" />
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
            placeholder="Buscar editais..."
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
          <option value="Aberto">Abertos</option>
          <option value="Em Breve">Em Breve</option>
          <option value="Encerrado">Encerrados</option>
        </select>

        {/* Botão Novo Edital */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Edital</span>
        </button>
      </div>

      {/* Lista de Editais */}
      <div className="space-y-4">
        {editaisFiltrados.map((edital) => {
          const diasRestantes = obterDiasRestantes(edital.data, edital.status);

          return (
            <div
              key={edital.id}
              className={`bg-[#0d1f30] rounded-2xl p-6 border border-[#3d4f62]/30 transition-all duration-300 ${ edital.status === "Encerrado" ? "opacity-70" : "" }`}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Informações do Edital */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#ff8c42]">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{edital.titulo}</h3>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#4a9eff]" />
                          <span className="text-sm text-[#4a9eff]">{edital.tema}</span>
                        </div>
                        <span className="text-[#3d4f62]">•</span>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#8b96a5]" />
                          <span className="text-sm text-[#8b96a5]">{edital.organizacao}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#8b96a5] mb-3">{edital.descricao}</p>

                      {/* Informações Adicionais */}
                      <div className="flex flex-wrap gap-4">
                        <div className="px-3 py-2 bg-[#0a1929] rounded-lg border border-[#3d4f62]/30">
                          <span className="text-xs text-[#8b96a5]">Valor Total</span>
                          <p className="text-sm text-[#10b981] font-semibold">{edital.valor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadados do Edital */}
                <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[200px]">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${obterCorStatus(edital.status)}`}>
                    {obterIconeStatus(edital.status)}
                    <span className="text-sm font-medium">{edital.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#8b96a5]" />
                    <div className="text-xs">
                      <span className="text-[#8b96a5]">Prazo: </span>
                      <span className="text-white font-medium">
                        {new Date(edital.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {diasRestantes !== null && (
                    <div className={`px-3 py-2 rounded-lg ${ diasRestantes <= 7 ? "bg-[#ef4444]/20 border border-[#ef4444]/30" : diasRestantes <= 30 ? "bg-[#ff8c42]/20 border border-[#ff8c42]/30" : "bg-[#10b981]/20 border border-[#10b981]/30" }`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${ diasRestantes <= 7 ? "text-[#ef4444]" : diasRestantes <= 30 ? "text-[#ff8c42]" : "text-[#10b981]" }`} />
                        <span className={`text-sm font-semibold ${ diasRestantes <= 7 ? "text-[#ef4444]" : diasRestantes <= 30 ? "text-[#ff8c42]" : "text-[#10b981]" }`}>
                          {diasRestantes > 0
                            ? `${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`
                            : 'Último dia'}
                        </span>
                      </div>
                    </div>
                  )}

                  {edital.status === "Aberto" && (
                    <button className="mt-2 px-4 py-2 bg-[#4a9eff]/20 text-[#4a9eff] rounded-lg hover:bg-[#4a9eff]/30 transition-colors text-sm font-medium border border-[#4a9eff]/30">
                      Submeter Proposta
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado Vazio */}
      {editaisFiltrados.length === 0 && (
        <div className="text-center py-12 bg-[#0d1f30] rounded-2xl border border-[#3d4f62]/30">
          <Megaphone className="w-16 h-16 text-[#3d4f62] mx-auto mb-4" />
          <p className="text-[#8b96a5]">Nenhum edital encontrado</p>
        </div>
      )}
    </div>
  );
}
