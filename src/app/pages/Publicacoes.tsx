import { useState } from "react";
import { BookOpen, Plus, Search, ExternalLink, Paperclip, Calendar, Tag, X, Filter } from "lucide-react";

type TipoPublicacao = "Artigo" | "Tese" | "Dissertação" | "Relatório" | "Capítulo" | "Conferência" | "Outro";

interface Publicacao {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoPublicacao;
  dataPublicacao: string;
  link?: string;
  temDocumento: boolean;
  grupo: string;
  autores: string[];
}

const TIPOS: TipoPublicacao[] = ["Artigo", "Tese", "Dissertação", "Relatório", "Capítulo", "Conferência", "Outro"];

const CORES_DOS_TIPOS: Record<TipoPublicacao, string> = {
  "Artigo": "bg-[#4a9eff]/20 text-[#4a9eff]",
  "Tese": "bg-[#7c3aed]/20 text-[#a78bfa]",
  "Dissertação": "bg-[#10b981]/20 text-[#10b981]",
  "Relatório": "bg-[#f59e0b]/20 text-[#f59e0b]",
  "Capítulo": "bg-[#ec4899]/20 text-[#ec4899]",
  "Conferência": "bg-[#ff8c42]/20 text-[#ff8c42]",
  "Outro": "bg-[#9e9e9e]/20 text-[#9e9e9e]",
};

const publicacoesExemplo: Publicacao[] = [
  {
    id: 1,
    titulo: "Deep Learning para Detecção de Anomalias em Redes IoT",
    descricao: "Este artigo propõe uma abordagem baseada em redes neurais convolucionais para detecção de intrusões em ambientes IoT, alcançando 97.3% de acurácia.",
    tipo: "Artigo",
    dataPublicacao: "2024-03-15",
    link: "https://doi.org/10.1145/example",
    temDocumento: true,
    grupo: "IA e Machine Learning",
    autores: ["João Pedro Oliveira", "Ana Carolina Lima"],
  },
  {
    id: 2,
    titulo: "Implementação de Algoritmos Quânticos em Hardware Supercondutores",
    descricao: "Dissertação que explora a implementação prática de algoritmos de Grover e Shor em processadores quânticos de estado sólido.",
    tipo: "Dissertação",
    dataPublicacao: "2024-02-28",
    link: "https://repositorio.usp.br/example",
    temDocumento: true,
    grupo: "Computação Quântica",
    autores: ["Maria Eduarda Santos"],
  },
  {
    id: 3,
    titulo: "Análise de Vulnerabilidades em Contratos Inteligentes Ethereum",
    descricao: "Relatório técnico sobre as principais classes de vulnerabilidades encontradas em contratos inteligentes, com análise de 500 contratos reais.",
    tipo: "Relatório",
    dataPublicacao: "2024-04-01",
    temDocumento: false,
    grupo: "Blockchain e Criptomoedas",
    autores: ["Rafael Henrique Souza", "Beatriz Almeida Rocha"],
  },
  {
    id: 4,
    titulo: "Zero-Trust Architecture em Ambientes Corporativos",
    descricao: "Trabalho apresentado no SBSEG 2024 propondo um framework de implementação de Zero-Trust para médias empresas.",
    tipo: "Conferência",
    dataPublicacao: "2024-03-22",
    link: "https://sbseg2024.example.com/paper/123",
    temDocumento: true,
    grupo: "Segurança Cibernética",
    autores: ["Lucas Ferreira Costa", "Dr. Roberto Mendes"],
  },
  {
    id: 5,
    titulo: "Redes Neurais Recorrentes para Previsão de Séries Temporais Financeiras",
    descricao: "Investigação do uso de LSTMs e Transformers para previsão de preços de ativos, com comparação frente a modelos ARIMA clássicos.",
    tipo: "Artigo",
    dataPublicacao: "2024-01-18",
    link: "https://arxiv.org/abs/example",
    temDocumento: false,
    grupo: "IA e Machine Learning",
    autores: ["Ana Carolina Lima", "Dr. Carlos Silva"],
  },
];

interface DadosDoFormularioDePublicacao {
  titulo: string;
  descricao: string;
  tipo: TipoPublicacao;
  dataPublicacao: string;
  link: string;
}

export function Publicacoes() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>(publicacoesExemplo);
  const [formulario, setFormulario] = useState<DadosDoFormularioDePublicacao>({
    titulo: "",
    descricao: "",
    tipo: "Artigo",
    dataPublicacao: "",
    link: "",
  });

  const filtradas = publicacoes.filter((p) => {
    const correspondeBusca =
      p.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.autores.some((a) => a.toLowerCase().includes(termoBusca.toLowerCase()));
    const correspondeTipo = filtroTipo === "all" || p.tipo === filtroTipo;
    return correspondeBusca && correspondeTipo;
  });

  const adicionarPublicacao = () => {
    if (!formulario.titulo || !formulario.dataPublicacao) return;
    const novaPublicacao: Publicacao = {
      id: Date.now(),
      titulo: formulario.titulo,
      descricao: formulario.descricao,
      tipo: formulario.tipo,
      dataPublicacao: formulario.dataPublicacao,
      link: formulario.link || undefined,
      temDocumento: false,
      grupo: "Grupo de Pesquisa",
      autores: ["Usuário Atual"],
    };
    setPublicacoes([novaPublicacao, ...publicacoes]);
    setFormulario({ titulo: "", descricao: "", tipo: "Artigo", dataPublicacao: "", link: "" });
    setMostrarModal(false);
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Publicações</h1>
        <p className="text-[#9e9e9e]">Repositório de produções científicas do grupo de pesquisa</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
          <div className="text-[#9e9e9e] text-sm mb-1">Total</div>
          <div className="text-white text-2xl font-bold">{publicacoes.length}</div>
        </div>
        {(["Artigo", "Dissertação", "Conferência"] as TipoPublicacao[]).map((tipo) => (
          <div key={tipo} className="bg-[#1e1e1e] rounded-xl p-4 border border-[#2e2e2e]/30">
            <div className="text-[#9e9e9e] text-sm mb-1">{tipo}s</div>
            <div className="text-white text-2xl font-bold">
              {publicacoes.filter((p) => p.tipo === tipo).length}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar por título, autor ou conteúdo..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30">
          <Filter className="w-4 h-4 text-[#9e9e9e]" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-transparent text-white focus:outline-none text-sm"
          >
            <option value="all">Todos os Tipos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Nova Publicação
        </button>
      </div>

      {/* Lista de Publicações */}
      <div className="space-y-4">
        {filtradas.map((publicacao) => (
          <div
            key={publicacao.id}
            className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Badge de tipo + título */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CORES_DOS_TIPOS[publicacao.tipo]}`}>
                    {publicacao.tipo}
                  </span>
                  {publicacao.temDocumento && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2e2e2e]/30 text-[#9e9e9e]">
                      <Paperclip className="w-3 h-3" />
                      PDF
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-2 leading-snug">{publicacao.titulo}</h3>
                <p className="text-[#9e9e9e] text-sm mb-3 line-clamp-2">{publicacao.descricao}</p>

                {/* Linha de metadados */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9e9e9e]">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{publicacao.grupo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(publicacao.dataPublicacao).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <span>por {publicacao.autores.join(", ")}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {publicacao.link && (
                  <a
                    href={publicacao.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4a9eff]/10 text-[#4a9eff] hover:bg-[#4a9eff]/20 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Acessar
                  </a>
                )}
                {publicacao.temDocumento && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e2e2e]/20 text-[#9e9e9e] hover:bg-[#2e2e2e]/30 text-xs font-medium transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />
                    Documento
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtradas.length === 0 && (
        <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30">
          <BookOpen className="w-16 h-16 text-[#2e2e2e] mx-auto mb-4" />
          <p className="text-[#9e9e9e]">Nenhuma publicação encontrada</p>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1e1e1e] rounded-2xl border border-[#2e2e2e]/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Nova Publicação</h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="p-2 hover:bg-[#2e2e2e]/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#9e9e9e]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">Título *</label>
                <input
                  type="text"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  placeholder="Título da publicação"
                  className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#2e2e2e] focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">Descrição</label>
                <textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                  placeholder="Resumo ou descrição"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#2e2e2e] focus:outline-none focus:border-[#ff8c42]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">Tipo</label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as TipoPublicacao })}
                    className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">Data da Publicação *</label>
                  <input
                    type="date"
                    value={formulario.dataPublicacao}
                    onChange={(e) => setFormulario({ ...formulario, dataPublicacao: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">Link (DOI, repositório...)</label>
                <input
                  type="url"
                  value={formulario.link}
                  onChange={(e) => setFormulario({ ...formulario, link: e.target.value })}
                  placeholder="https://doi.org/..."
                  className="w-full px-4 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#2e2e2e] focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9e9e9e] mb-1.5 font-normal">Documento PDF</label>
                <div className="w-full px-4 py-3 bg-[#121212] rounded-xl border border-dashed border-[#2e2e2e]/50 text-[#9e9e9e] text-sm flex items-center gap-2 cursor-pointer hover:border-[#ff8c42]/40 transition-colors">
                  <Paperclip className="w-4 h-4" />
                  Clique para anexar PDF
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#2e2e2e]/30 text-[#9e9e9e] hover:text-white hover:border-[#2e2e2e]/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarPublicacao}
                className="flex-1 py-2.5 bg-[#ff8c42] text-white rounded-xl font-medium transition-all"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}