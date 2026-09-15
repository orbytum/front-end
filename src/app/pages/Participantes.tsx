import { UserCheck, Plus, Search, Mail, Phone, MoreVertical, BookOpen } from "lucide-react";
import { useState } from "react";

export function Participantes() {
  const [termoBusca, setTermoBusca] = useState("");

  const participantes = [
    {
      id: 1,
      nome: "João Pedro Oliveira",
      funcao: "Doutorando",
      grupo: "IA e Machine Learning",
      email: "joao.oliveira@universidade.br",
      telefone: "(11) 98765-4321",
      status: "Ativo",
      avatar: "JP"
    },
    {
      id: 2,
      nome: "Maria Eduarda Santos",
      funcao: "Mestranda",
      grupo: "Computação Quântica",
      email: "maria.santos@universidade.br",
      telefone: "(21) 97654-3210",
      status: "Ativo",
      avatar: "MS"
    },
    {
      id: 3,
      nome: "Lucas Ferreira Costa",
      funcao: "Doutorando",
      grupo: "Segurança Cibernética",
      email: "lucas.costa@universidade.br",
      telefone: "(31) 96543-2109",
      status: "Ativo",
      avatar: "LC"
    },
    {
      id: 4,
      nome: "Ana Carolina Lima",
      funcao: "Pós-Doutoranda",
      grupo: "IA e Machine Learning",
      email: "ana.lima@universidade.br",
      telefone: "(41) 95432-1098",
      status: "Ativo",
      avatar: "AL"
    },
    {
      id: 5,
      nome: "Rafael Henrique Souza",
      funcao: "Mestrando",
      grupo: "Blockchain e Criptomoedas",
      email: "rafael.souza@universidade.br",
      telefone: "(51) 94321-0987",
      status: "Em Licença",
      avatar: "RS"
    },
    {
      id: 6,
      nome: "Beatriz Almeida Rocha",
      funcao: "Doutoranda",
      grupo: "Segurança Cibernética",
      email: "beatriz.rocha@universidade.br",
      telefone: "(61) 93210-9876",
      status: "Ativo",
      avatar: "BR"
    },
  ];

  const participantesFiltrados = participantes.filter(p =>
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.grupo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.funcao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Participantes</h1>
        <p className="text-muted-foreground">Gerencie os participantes dos grupos de pesquisa</p>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, grupo ou função..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        {/* Botão Novo Participante */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Participante</span>
        </button>
      </div>

      {/* Tabela de Participantes */}
      <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Participante</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Função</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Grupo</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Contato</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {participantesFiltrados.map((participante, index) => (
                <tr 
                  key={participante.id}
                  className={`border-b border-border/30 hover:bg-background/50 transition-colors ${ index === participantesFiltrados.length - 1 ? 'border-b-0' : '' }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#ff8c42] flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">{participante.avatar}</span>
                      </div>
                      <div>
                        <div className="text-foreground font-medium">{participante.nome}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{participante.funcao}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground">{participante.grupo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span>{participante.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{participante.telefone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ participante.status === "Ativo" ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#ff8c42]/20 text-[#ff8c42]" }`}>
                      {participante.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-border/20 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado Vazio */}
      {participantesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum participante encontrado</p>
        </div>
      )}
    </div>
  );
}