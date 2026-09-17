import { Hexagon, Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { DataTable, Column } from "../components/DataTable";

export interface Recurso {
  id: number;
  grupo: string;
  alocado: number;
  utilizado: number;
  saldo: number;
  categoria: string;
  data: string;
}

export function Recursos() {
  const recursos: Recurso[] = [
    {
      id: 1,
      grupo: "IA e Machine Learning",
      alocado: 45000,
      utilizado: 32500,
      saldo: 12500,
      categoria: "Equipamentos",
      data: "2024-01-15",
    },
    {
      id: 2,
      grupo: "Computação Quântica",
      alocado: 67000,
      utilizado: 28000,
      saldo: 39000,
      categoria: "Pesquisa",
      data: "2024-02-01",
    },
    {
      id: 3,
      grupo: "Segurança Cibernética",
      alocado: 38000,
      utilizado: 35200,
      saldo: 2800,
      categoria: "Software",
      data: "2023-11-20",
    },
    {
      id: 4,
      grupo: "Blockchain e Criptomoedas",
      alocado: 52000,
      utilizado: 8500,
      saldo: 43500,
      categoria: "Infraestrutura",
      data: "2024-03-10",
    },
    {
      id: 5,
      grupo: "Processamento de Linguagem Natural",
      alocado: 41000,
      utilizado: 39000,
      saldo: 2000,
      categoria: "Pesquisa",
      data: "2024-04-05",
    },
    {
      id: 6,
      grupo: "Robótica e Sistemas Autônomos",
      alocado: 75000,
      utilizado: 42000,
      saldo: 33000,
      categoria: "Equipamentos",
      data: "2024-04-18",
    },
    {
      id: 7,
      grupo: "Bioinformática e Saúde Digital",
      alocado: 30000,
      utilizado: 18500,
      saldo: 11500,
      categoria: "Software",
      data: "2024-05-02",
    },
  ];

  const totalAlocado = recursos.reduce((soma, r) => soma + r.alocado, 0);
  const totalUtilizado = recursos.reduce((soma, r) => soma + r.utilizado, 0);
  const saldoDisponivel = recursos.reduce((soma, r) => soma + r.saldo, 0);

  const columns: Column<Recurso>[] = [
    {
      key: "grupo",
      header: "Grupo",
      align: "left",
      render: (recurso) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center shrink-0">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="text-foreground font-medium">{recurso.grupo}</span>
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoria",
      align: "left",
      render: (recurso) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#4a9eff]/20 text-[#4a9eff]">
          {recurso.categoria}
        </span>
      ),
    },
    {
      key: "alocado",
      header: "Alocado",
      align: "right",
      render: (recurso) => (
        <span className="text-foreground">
          R$ {recurso.alocado.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      key: "utilizado",
      header: "Utilizado",
      align: "right",
      render: (recurso) => (
        <span className="text-[#ff8c42]">
          R$ {recurso.utilizado.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      render: (recurso) => (
        <span className="text-[#10b981]">
          R$ {recurso.saldo.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      key: "utilizacao",
      header: "Utilização",
      align: "center",
      render: (recurso) => {
        const percentualUtilizacao =
          recurso.alocado > 0
            ? (recurso.utilizado / recurso.alocado) * 100
            : 0;

        return (
          <div className="flex flex-col items-center gap-2">
            <div className="w-full max-w-[120px] h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${ percentualUtilizacao > 80 ? "bg-[#ff8c42]" : "bg-[#10b981]" }`}
                style={{ width: `${Math.min(percentualUtilizacao, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {percentualUtilizacao.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold mb-2">Recursos Financeiros</h1>
        <p className="text-muted-foreground">Acompanhe a alocação e utilização de recursos</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#4a9eff] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Alocado</p>
              <h3 className="text-foreground text-xl font-bold">
                R$ {(totalAlocado / 1000).toFixed(0)}k
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{recursos.length} grupos ativos</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Utilizado</p>
              <h3 className="text-foreground text-xl font-bold">
                R$ {(totalUtilizado / 1000).toFixed(0)}k
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#ff8c42]">
            <span>
              {totalAlocado > 0
                ? ((totalUtilizado / totalAlocado) * 100).toFixed(1)
                : "0"}
              % do orçamento
            </span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Saldo Disponível</p>
              <h3 className="text-foreground text-xl font-bold">
                R$ {(saldoDisponivel / 1000).toFixed(0)}k
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#10b981]">
            <span>
              {totalAlocado > 0
                ? ((saldoDisponivel / totalAlocado) * 100).toFixed(1)
                : "0"}
              % disponível
            </span>
          </div>
        </div>
      </div>

      {/* Tabela Reutilizável de Recursos com Paginação */}
      <DataTable
        title="Alocação por Grupo"
        actions={
          <button
            type="button"
            className="px-4 py-2 bg-[#ff8c42] text-white rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Alocação</span>
          </button>
        }
        data={recursos}
        columns={columns}
        pageSize={4}
        pageSizeOptions={[4, 8, 12]}
      />
    </div>
  );
}