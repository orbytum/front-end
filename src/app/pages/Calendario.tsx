import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

export function Calendario() {
  const [dataAtual, setDataAtual] = useState(new Date(2024, 3, 9)); // 9 de abril de 2024

  const eventos = [
    {
      id: 1,
      titulo: "Reunião de Supervisores",
      data: "2024-04-10",
      horario: "14:00",
      grupo: "Todos os Grupos",
      tipo: "Reunião"
    },
    {
      id: 2,
      titulo: "Apresentação de Resultados - IA",
      data: "2024-04-15",
      horario: "10:00",
      grupo: "IA e Machine Learning",
      tipo: "Apresentação"
    },
    {
      id: 3,
      titulo: "Workshop de Blockchain",
      data: "2024-04-12",
      horario: "15:30",
      grupo: "Blockchain e Criptomoedas",
      tipo: "Workshop"
    },
    {
      id: 4,
      titulo: "Defesa de Mestrado - Maria Santos",
      data: "2024-04-20",
      horario: "09:00",
      grupo: "Computação Quântica",
      tipo: "Defesa"
    },
    {
      id: 5,
      titulo: "Auditoria de Segurança",
      data: "2024-04-18",
      horario: "13:00",
      grupo: "Segurança Cibernética",
      tipo: "Atividade"
    },
  ];

  const diasNoMes = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth() + 1,
    0
  ).getDate();

  const primeiroDiaDoMes = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth(),
    1
  ).getDay();

  const nomesDosMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const mesAnterior = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1));
  };

  const proximoMes = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1));
  };

  const temEvento = (dia: number) => {
    const stringData = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return eventos.some(evento => evento.data === stringData);
  };

  const obterEventosDoDia = (dia: number) => {
    const stringData = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return eventos.filter(evento => evento.data === stringData);
  };

  const obterCorDoTipo = (tipo: string) => {
    switch (tipo) {
      case "Reunião": return "bg-[#4a9eff]/20 text-[#4a9eff] border-[#4a9eff]/30";
      case "Apresentação": return "bg-[#ff8c42]/20 text-[#ff8c42] border-[#ff8c42]/30";
      case "Workshop": return "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30";
      case "Defesa": return "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]/30";
      default: return "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30";
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Calendário</h1>
        <p className="text-muted-foreground">Visualize e gerencie os eventos dos grupos</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="xl:col-span-2">
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            {/* Cabeçalho do Calendário */}
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <h2 className="text-foreground">
                {nomesDosMeses[dataAtual.getMonth()]} {dataAtual.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={mesAnterior}
                  className="p-2 hover:bg-border/20 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={proximoMes}
                  className="p-2 hover:bg-border/20 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Grade do Calendário */}
            <div className="p-6">
              {/* Cabeçalhos dos Dias da Semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                  <div key={dia} className="text-center text-sm text-muted-foreground font-medium py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Dias do Calendário */}
              <div className="grid grid-cols-7 gap-2">
                {/* Células vazias para dias antes do início do mês */}
                {Array.from({ length: primeiroDiaDoMes }).map((_, i) => (
                  <div key={`vazio-${i}`} className="aspect-square" />
                ))}

                {/* Dias reais */}
                {Array.from({ length: diasNoMes }).map((_, i) => {
                  const dia = i + 1;
                  const ehHoje = dia === 9 && dataAtual.getMonth() === 3; // 9 de abril
                  const diaTemEvento = temEvento(dia);

                  return (
                    <div
                      key={dia}
                      className={`aspect-square p-2 rounded-xl transition-all duration-200 cursor-pointer ${ ehHoje ? "bg-[#ff8c42] text-white " : diaTemEvento ? "bg-background border border-[#ff8c42]/30 text-foreground hover:border-[#ff8c42]/50" : "bg-background border border-border/20 text-muted-foreground hover:border-border/40" }`}
                    >
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-medium ${ehHoje ? 'text-foreground' : ''}`}>
                          {dia}
                        </span>
                        {diaTemEvento && !ehHoje && (
                          <div className="flex-1 flex items-end">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff8c42]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="xl:col-span-1">
          <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <h2 className="text-foreground">Próximos Eventos</h2>
              <button className="p-2 bg-[#ff8c42] text-white rounded-lg transition-all duration-300">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {eventos
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .map((evento) => (
                  <div
                    key={evento.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${obterCorDoTipo(evento.tipo)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {new Date(evento.data).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 truncate">{evento.titulo}</h4>
                        <p className="text-xs opacity-80 mb-2">{evento.grupo}</p>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3 opacity-60" />
                          <span className="text-xs opacity-80">{evento.horario}</span>
                          <span className="px-2 py-0.5 rounded text-xs bg-background/50">
                            {evento.tipo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
