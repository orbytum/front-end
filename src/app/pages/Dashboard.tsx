import { SolarSystem } from "../components/SolarSystem";
import { Users, UserCheck, Hexagon, Box, FolderKanban, TrendingUp } from "lucide-react";

export function Dashboard() {
  const stats = [
    { label: "Grupos Ativos", value: "12", icon: Users, color: "bg-[#ff8c42]" },
    { label: "Participantes", value: "48", icon: UserCheck, color: "bg-[#4a9eff]" },
    { label: "Recursos Alocados", value: "R$ 284k", icon: Hexagon, color: "bg-[#7c3aed]" },
    { label: "Projetos Ativos", value: "23", icon: FolderKanban, color: "bg-[#10b981]" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Stats Grid
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#9e9e9e] text-sm mb-2">{stat.label}</p>
                <h3 className="text-white text-2xl font-bold">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-[#10b981]">
              <TrendingUp className="w-3 h-3" />
              <span>+12% este mês</span>
            </div>
          </div>
        ))}
      </div> */}

      {/* Solar System Visualization */}
      <div className="flex-1 min-h-0">
        <SolarSystem />
      </div>
    </div>
  );
}
