import { useState } from "react";
import {
  Bell, Plus, Search, Calendar, Clock, MapPin, Link2, Users, X,
  FileText, Presentation, Coffee, Megaphone, CheckCircle, Filter,
  Repeat, Upload, UserCheck
} from "lucide-react";

type TipoLembrete = "Edital" | "Reunião" | "Apresentação" | "Workshop";
type StatusLembrete = "Em Andamento" | "Próximo" | "Encerrado";
type TipoRecorrencia = "Nenhuma" | "Diária" | "Semanal" | "Mensal" | "Anual";

interface Lembrete {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoLembrete;
  dataHora: string;
  local?: string;
  link?: string;
  organizador: string;
  participantes: string[];
  grupo: string;
  status: StatusLembrete;
  recorrencia: TipoRecorrencia;
  presencaConfirmada?: boolean;
  temAta?: boolean;
}

const CONFIG_TIPO: Record<TipoLembrete, { icone: React.ElementType; cor: string; fundo: string }> = {
  Edital: { icone: Megaphone, cor: "text-[#f59e0b]", fundo: "bg-[#f59e0b]/20" },
  Reunião: { icone: Coffee, cor: "text-[#4a9eff]", fundo: "bg-[#4a9eff]/20" },
  Apresentação: { icone: Presentation, cor: "text-[#10b981]", fundo: "bg-[#10b981]/20" },
  Workshop: { icone: FileText, cor: "text-[#a78bfa]", fundo: "bg-[#a78bfa]/20" },
};

const SECOES_DE_STATUS: { chave: StatusLembrete; rotulo: string; cor: string }[] = [
  { chave: "Em Andamento", rotulo: "Em Andamento", cor: "text-[#ff8c42]" },
  { chave: "Próximo", rotulo: "Próximos (3 dias)", cor: "text-[#4a9eff]" },
  { chave: "Encerrado", rotulo: "Encerrados", cor: "text-[#8b96a5]" },
];

const lembretesExemplo: Lembrete[] = [
  {
    id: 1,
    titulo: "Reunião Semanal de Acompanhamento",
    descricao: "Revisão do progresso semanal do grupo, impedimentos e próximos passos.",
    tipo: "Reunião",
    dataHora: "2026-08-19T14:00",
    local: "Sala 302 - Bloco A",
    link: "https://meet.google.com/abc-def",
    organizador: "Dr. Carlos Silva",
    participantes: ["João Pedro Oliveira", "Ana Carolina Lima", "Maria Eduarda Santos"],
    grupo: "IA e Machine Learning",
    status: "Em Andamento",
    recorrencia: "Semanal",
    presencaConfirmada: true,
    temAta: false,
  },
  {
    id: 2,
    titulo: "Edital CNPq - Pesquisa em IA 2026",
    descricao: "Prazo final para submissão de projetos ao edital de fomento à pesquisa em inteligência artificial.",
    tipo: "Edital",
    dataHora: "2026-08-22T23:59",
    link: "https://cnpq.br/editais/2026/ia",
    organizador: "Administrador",
    participantes: ["Todos os grupos"],
    grupo: "Todos",
    status: "Próximo",
    recorrencia: "Nenhuma",
  },
  {
    id: 3,
    titulo: "Workshop de Computação Quântica",
    descricao: "Apresentação introdutória sobre fundamentos de computação quântica para pesquisadores iniciantes.",
    tipo: "Workshop",
    dataHora: "2026-08-21T09:00",
    local: "Auditório Central",
    organizador: "Dra. Ana Paula Santos",
    participantes: ["Maria Eduarda Santos", "Rafael Henrique Souza"],
    grupo: "Computação Quântica",
    status: "Próximo",
    recorrencia: "Nenhuma",
  },
  {
    id: 4,
    titulo: "Apresentação de Resultados — Projeto Deep Learning",
    descricao: "Defesa dos resultados obtidos no projeto de detecção de anomalias com redes neurais.",
    tipo: "Apresentação",
    dataHora: "2026-08-10T10:00",
    local: "Sala de Defesas - Bloco C",
    organizador: "João Pedro Oliveira",
    participantes: ["Dr. Carlos Silva", "Banca Avaliadora"],
    grupo: "IA e Machine Learning",
    status: "Encerrado",
    recorrencia: "Nenhuma",
    temAta: true,
  },
  {
    id: 5,
    titulo: "Edital FAPESP — Auxílio à Pesquisa 2025",
    descricao: "Resultado do edital anterior. Grupo contemplado com R$ 45.000,00 para período 2025-2026.",
    tipo: "Edital",
    dataHora: "2025-12-01T00:00",
    link: "https://fapesp.br/resultado/2025",
    organizador: "Administrador",
    participantes: [],
    grupo: "Todos",
    status: "Encerrado",
    recorrencia: "Anual",
  },
];

export function Lembretes() {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"all" | TipoLembrete>("all");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [lembretes, setLembretes] = useState<Lembrete[]>(lembretesExemplo);
  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    tipo: "Reunião" as TipoLembrete,
    dataHora: "",
    local: "",
    link: "",
    recorrencia: "Nenhuma" as TipoRecorrencia,
  });

  const filtrados = lembretes.filter((l) => {
    const correspondeBusca =
      l.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      l.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      l.organizador.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeTipo = filtroTipo === "all" || l.tipo === filtroTipo;
    return correspondeBusca && correspondeTipo;
  });

  const adicionarLembrete = () => {
    if (!formulario.titulo || !formulario.dataHora) return;
    const agora = new Date();
    const dt = new Date(formulario.dataHora);
    let status: StatusLembrete = "Próximo";
    const diasDiferenca = (dt.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);
    if (diasDiferenca < 0) status = "Encerrado";
    else if (diasDiferenca <= 3) status = "Próximo";
    else status = "Em Andamento";

    const novoLembrete: Lembrete = {
      id: Date.now(),
      titulo: formulario.titulo,
      descricao: formulario.descricao,
      tipo: formulario.tipo,
      dataHora: formulario.dataHora,
      local: formulario.local || undefined,
      link: formulario.link || undefined,
      organizador: "Usuário Atual",
      participantes: [],
      grupo: "Grupo de Pesquisa",
      status,
      recorrencia: formulario.recorrencia,
    };
    setLembretes([novoLembrete, ...lembretes]);
    setFormulario({ titulo: "", descricao: "", tipo: "Reunião", dataHora: "", local: "", link: "", recorrencia: "Nenhuma" });
    setMostrarModal(false);
  };

  const agrupadosPorStatus = SECOES_DE_STATUS.map((secao) => ({
    ...secao,
    itens: filtrados.filter((l) => l.status === secao.chave),
  }));

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Lembretes</h1>
        <p className="text-[#8b96a5]">Editais, reuniões, apresentações e workshops do grupo</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["Edital", "Reunião", "Apresentação", "Workshop"] as TipoLembrete[]).map((tipo) => {
          const config = CONFIG_TIPO[tipo];
          const Icone = config.icone;
          return (
            <div key={tipo} className="bg-[#0d1f30] rounded-xl p-4 border border-[#3d4f62]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#8b96a5] text-sm">{tipo}s</span>
                <Icone className={`w-5 h-5 ${config.cor}`} />
              </div>
              <div className="text-white text-2xl font-bold">
                {lembretes.filter((l) => l.tipo === tipo).length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b96a5]" />
          <input
            type="text"
            placeholder="Buscar lembretes..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#8b96a5] focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1f30] rounded-xl border border-[#3d4f62]/30">
          <Filter className="w-4 h-4 text-[#8b96a5]" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as "all" | TipoLembrete)}
            className="bg-transparent text-white focus:outline-none text-sm"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Edital">Editais</option>
            <option value="Reunião">Reuniões</option>
            <option value="Apresentação">Apresentações</option>
            <option value="Workshop">Workshops</option>
          </select>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Novo Lembrete
        </button>
      </div>

      {/* Lista seccionada */}
      <div className="space-y-8">
        {agrupadosPorStatus.map(({ chave, rotulo, cor, itens }) => (
          itens.length > 0 && (
            <div key={chave}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className={`font-semibold ${cor}`}>{rotulo}</h2>
                <div className="flex-1 h-px bg-[#3d4f62]/30" />
                <span className="text-xs text-[#8b96a5] bg-[#0d1f30] px-2 py-0.5 rounded-full border border-[#3d4f62]/30">
                  {itens.length}
                </span>
              </div>

              <div className="space-y-4">
                {itens.map((lembrete) => {
                  const config = CONFIG_TIPO[lembrete.tipo];
                  const Icone = config.icone;
                  return (
                    <div
                      key={lembrete.id}
                      className={`bg-[#0d1f30] rounded-2xl p-6 border transition-all duration-300 ${ chave === "Encerrado" ? "border-[#3d4f62]/20 opacity-70" : "border-[#3d4f62]/30" }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Ícone do tipo */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.fundo}`}>
                          <Icone className={`w-5 h-5 ${config.cor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Cabeçalho */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-white font-semibold leading-snug">{lembrete.titulo}</h3>
                            <div className="flex items-center gap-2 shrink-0">
                              {lembrete.recorrencia !== "Nenhuma" && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#3d4f62]/30 text-[#8b96a5]">
                                  <Repeat className="w-3 h-3" />
                                  {lembrete.recorrencia}
                                </span>
                              )}
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.fundo} ${config.cor}`}>
                                {lembrete.tipo}
                              </span>
                            </div>
                          </div>

                          <p className="text-[#8b96a5] text-sm mb-3 line-clamp-2">{lembrete.descricao}</p>

                          {/* Metadados */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b96a5]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {new Date(lembrete.dataHora).toLocaleDateString("pt-BR", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </span>
                              <Clock className="w-3.5 h-3.5 ml-1" />
                              <span>
                                {new Date(lembrete.dataHora).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit", minute: "2-digit"
                                })}
                              </span>
                            </div>

                            {lembrete.local && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{lembrete.local}</span>
                              </div>
                            )}

                            {lembrete.participantes.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{lembrete.participantes.length} participante(s)</span>
                              </div>
                            )}
                          </div>

                          {/* Linha de ações */}
                          <div className="flex items-center gap-3 mt-4 flex-wrap">
                            {lembrete.link && (
                              <a
                                href={lembrete.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4a9eff]/10 text-[#4a9eff] hover:bg-[#4a9eff]/20 text-xs font-medium transition-colors"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                Acessar Link
                              </a>
                            )}

                            {lembrete.tipo === "Reunião" && chave !== "Encerrado" && (
                              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ lembrete.presencaConfirmada ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#3d4f62]/20 text-[#8b96a5] hover:bg-[#3d4f62]/30" }`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                {lembrete.presencaConfirmada ? "Presença Confirmada" : "Confirmar Presença"}
                              </button>
                            )}

                            {lembrete.tipo === "Reunião" && lembrete.temAta && (
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3d4f62]/20 text-[#8b96a5] hover:bg-[#3d4f62]/30 text-xs font-medium transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                                Ver Ata
                              </button>
                            )}

                            {lembrete.tipo === "Reunião" && chave === "Encerrado" && !lembrete.temAta && (
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3d4f62]/20 text-[#8b96a5] hover:bg-[#3d4f62]/30 text-xs font-medium transition-colors">
                                <Upload className="w-3.5 h-3.5" />
                                Inserir Ata
                              </button>
                            )}

                            <div className="flex items-center gap-1.5 ml-auto">
                              <UserCheck className="w-3.5 h-3.5 text-[#8b96a5]" />
                              <span className="text-xs text-[#8b96a5]">por {lembrete.organizador}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-12 bg-[#0d1f30] rounded-2xl border border-[#3d4f62]/30">
          <Bell className="w-16 h-16 text-[#3d4f62] mx-auto mb-4" />
          <p className="text-[#8b96a5]">Nenhum lembrete encontrado</p>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1f30] rounded-2xl border border-[#3d4f62]/30 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Novo Lembrete</h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="p-2 hover:bg-[#3d4f62]/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#8b96a5]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Título *</label>
                <input
                  type="text"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  placeholder="Título do lembrete"
                  className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#3d4f62] focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Descrição</label>
                <textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                  placeholder="Detalhes do lembrete"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#3d4f62] focus:outline-none focus:border-[#ff8c42]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Tipo</label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as TipoLembrete })}
                    className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
                  >
                    <option>Edital</option>
                    <option>Reunião</option>
                    <option>Apresentação</option>
                    <option>Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Recorrência</label>
                  <select
                    value={formulario.recorrencia}
                    onChange={(e) => setFormulario({ ...formulario, recorrencia: e.target.value as TipoRecorrencia })}
                    className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
                  >
                    <option>Nenhuma</option>
                    <option>Diária</option>
                    <option>Semanal</option>
                    <option>Mensal</option>
                    <option>Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Data e Horário *</label>
                <input
                  type="datetime-local"
                  value={formulario.dataHora}
                  onChange={(e) => setFormulario({ ...formulario, dataHora: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Localização</label>
                <input
                  type="text"
                  value={formulario.local}
                  onChange={(e) => setFormulario({ ...formulario, local: e.target.value })}
                  placeholder="Sala, auditório ou online"
                  className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#3d4f62] focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8b96a5] mb-1.5 font-normal">Link de acesso</label>
                <input
                  type="url"
                  value={formulario.link}
                  onChange={(e) => setFormulario({ ...formulario, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2.5 bg-[#0a1929] rounded-xl border border-[#3d4f62]/30 text-white placeholder-[#3d4f62] focus:outline-none focus:border-[#ff8c42]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#3d4f62]/30 text-[#8b96a5] hover:text-white hover:border-[#3d4f62]/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarLembrete}
                className="flex-1 py-2.5 bg-[#ff8c42] text-white rounded-xl font-medium transition-all"
              >
                Criar Lembrete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}