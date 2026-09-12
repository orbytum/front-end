import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Plus,
  Trash2,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Calendar,
  CheckCircle2,
  X,
  AlertTriangle,
  Send,
  Search,
  User,
  Shield,
  TriangleAlert,
  Clock,
  UserCheck,
} from "lucide-react";
import { DataTable, Column } from "../components/DataTable";
import { GrupoService } from "../services/grupos/GrupoService";
import { AuthService } from "../services/auth/AuthService";
import { HttpError } from "../utils/HttpError";
import { GrupoDetalhe } from "../models/dto/grupos/GrupoDetalhe";
import { GrupoPaginadoResponse } from "../models/dto/grupos/ListarGrupos";

export function Grupos() {
  const navigate = useNavigate();
  const grupoService = new GrupoService();
  const authService = new AuthService();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nomeFilter, setNomeFilter] = useState("");
  const [debouncedNome, setDebouncedNome] = useState("");
  const [usuarioFilter, setUsuarioFilter] = useState("");
  const [debouncedUsuario, setDebouncedUsuario] = useState("");

  const [paginatedData, setPaginatedData] = useState<GrupoPaginadoResponse>({
    items: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [emailLider, setEmailLider] = useState("");
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");
  const [createdGrupo, setCreatedGrupo] = useState<GrupoDetalhe | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNome(nomeFilter);
      setDebouncedUsuario(usuarioFilter);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [nomeFilter, usuarioFilter]);

  useEffect(() => {
    const hasAdminAccess = authService.isAdminOrInitialAdmin();
    setIsAdmin(hasAdminAccess);
  }, []);

  const carregarGrupos = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionError("");
    try {
      const data = await grupoService.listarGrupos({
        page,
        size: pageSize,
        nome: debouncedNome,
        usuario: debouncedUsuario,
      });
      setPaginatedData(data);
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.response?.mensagem || err.message);
      } else {
        setError("Não foi possível carregar a lista de grupos de pesquisa.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedNome, debouncedUsuario]);

  useEffect(() => {
    if (isAdmin) {
      carregarGrupos();
    }
  }, [isAdmin, carregarGrupos]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setCreatedGrupo(null);

    if (!nome.trim()) {
      setModalError("O nome do grupo é obrigatório.");
      return;
    }

    if (!emailLider.trim()) {
      setModalError("Informe o e-mail do líder que receberá o convite.");
      return;
    }

    setCreating(true);
    try {
      const res = await grupoService.criarGrupo({
        nome: nome.trim(),
        emailLider: emailLider.trim(),
      });

      setCreatedGrupo(res);
      setNome("");
      setEmailLider("");
      carregarGrupos();
    } catch (err) {
      if (err instanceof HttpError) {
        setModalError(err.response?.mensagem || err.message);
      } else {
        setModalError("Falha ao criar o grupo. Verifique as informações e tente novamente.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (grupo: GrupoDetalhe) => {
    setActionError("");
    if (!window.confirm(`Deseja realmente remover o grupo "${grupo.nome}"?`)) {
      return;
    }

    setDeletingId(grupo.id);
    try {
      await grupoService.removerGrupo(grupo.id);
      await carregarGrupos();
    } catch (err) {
      if (err instanceof HttpError) {
        setActionError(err.response?.mensagem || err.message);
      } else {
        setActionError("Erro ao remover o grupo.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="bg-[#1e1e1e] rounded-2xl p-8 max-w-md w-full border border-[#ef4444]/30 text-center">
          <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-[#ef4444]" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-[#9e9e9e] text-sm mb-6">
            A gestão de grupos de pesquisa é restrita exclusivamente a <strong>Administradores</strong> da plataforma.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/40 text-white hover:border-[#ff8c42]/60 transition-colors text-sm font-medium cursor-pointer"
          >
            Fazer login com outra conta
          </button>
        </div>
      </div>
    );
  }

  const columns: Column<GrupoDetalhe>[] = [
    {
      key: "nome",
      header: "Grupo de Pesquisa",
      align: "left",
      render: (g) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#2e2e2e]/40 flex items-center justify-center text-[#ff8c42] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-medium block">{g.nome}</span>
            <span className="text-xs text-[#9e9e9e]">
              ID #{g.id} • {g.isAtivo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "nomeLider",
      header: "Líder Responsável",
      align: "left",
      render: (g) => (
        <div className="flex items-center gap-2.5">
          <div>
            {g.nomeLider ? (
              <>
                <span className="text-white text-sm font-medium block">{g.nomeLider}</span>
                <span className="text-xs text-[#10b981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Líder Vinculado
                </span>
              </>
            ) : (
              <>
                <span className="text-[#ff8c42] text-sm font-medium block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Convite Enviado
                </span>
                <span className="text-xs text-[#9e9e9e]">Aguardando aceite</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "totalParticipantes",
      header: "Participantes",
      align: "center",
      render: (g) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121212] border border-[#2e2e2e]/30 text-xs text-white">
          <UserCheck className="w-3.5 h-3.5 text-[#4a9eff]" />
          <span className="font-semibold">{g.totalParticipantes ?? 0}</span>
          <span className="text-[#9e9e9e]">membros</span>
        </div>
      ),
    },
    {
      key: "isAtivo",
      header: "Status",
      align: "center",
      render: (g) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${
            g.isAtivo
              ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
              : "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              g.isAtivo ? "bg-[#10b981]" : "bg-[#ef4444]"
            }`}
          />
          {g.isAtivo ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      align: "right",
      render: (g) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleDelete(g)}
            disabled={deletingId === g.id || !g.isAtivo}
            className="p-1.5 rounded-lg border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors disabled:opacity-40 cursor-pointer"
            title={g.isAtivo ? "Remover grupo" : "Grupo já inativo"}
          >
            {deletingId === g.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white mb-2">Grupos de Pesquisa</h1>
        <p className="text-[#9e9e9e]">Gerencie os grupos de pesquisa e suas configurações</p>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2e2e2e]/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Busca por Nome do Grupo */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Filtrar por nome do grupo..."
            value={nomeFilter}
            onChange={(e) => setNomeFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-[#121212] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] text-sm focus:outline-none focus:border-[#ff8c42]/50 transition-colors"
          />
          {nomeFilter && (
            <button
              type="button"
              onClick={() => setNomeFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9e9e9e] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Limpar filtro de nome"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Busca por Usuário/Líder */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9e9e9e]" />
          <input
            type="text"
            placeholder="Buscar grupos ou supervisores..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] rounded-xl border border-[#2e2e2e]/30 text-white placeholder-[#9e9e9e] focus:outline-none focus:border-[#ff8c42]/50"
          />
          {usuarioFilter && (
            <button
              type="button"
              onClick={() => setUsuarioFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9e9e9e] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Limpar filtro de usuário"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botão Novo Grupo */}
        <button className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          <span>Novo Grupo</span>
        </button>
      </div>

      {/* Grade de Grupos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gruposFiltrados.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-[#1e1e1e] rounded-2xl p-6 border border-[#2e2e2e]/30 transition-all duration-300 group"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{grupo.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#9e9e9e]">
                    <Shield className="w-4 h-4" />
                    <span>{grupo.supervisor}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-[#2e2e2e]/20 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-[#9e9e9e]" />
              </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-[#ff8c42] font-semibold">{grupo.participantes}</div>
                <div className="text-xs text-[#9e9e9e]">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-[#ff8c42] font-semibold">{grupo.projetos}</div>
                <div className="text-xs text-[#9e9e9e]">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-[#ff8c42] font-semibold">{grupo.orcamento}</div>
                <div className="text-xs text-[#9e9e9e]">Orçamento</div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2e2e2e]/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-[#9e9e9e]">
                  <Calendar className="w-4 h-4" />
                  <span>Início: {new Date(grupo.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
                <button
                  onClick={() => navigate(`/grupos/${grupo.id}/participantes`)}
                  className="flex items-center gap-2 text-xs text-[#4a9eff] hover:text-[#ff8c42] transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Gerenciar Participantes</span>
                </button>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ grupo.status === "Ativo" ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#ff8c42]/20 text-[#ff8c42]" }`}>
                {grupo.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}