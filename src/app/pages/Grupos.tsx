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
  Clock,
  UserCheck,
  Pencil,
  UserPlus,
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoDetalhe | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editIsAtivo, setEditIsAtivo] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const [liderModalOpen, setLiderModalOpen] = useState(false);
  const [selectedGrupoLider, setSelectedGrupoLider] = useState<GrupoDetalhe | null>(null);
  const [liderNome, setLiderNome] = useState("");
  const [liderEmail, setLiderEmail] = useState("");
  const [liderTelefone, setLiderTelefone] = useState("");
  const [liderTitulo, setLiderTitulo] = useState("");
  const [liderSenha, setLiderSenha] = useState("");
  const [cadastrandoLider, setCadastrandoLider] = useState(false);
  const [liderError, setLiderError] = useState("");

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

  const handleOpenEdit = (grupo: GrupoDetalhe) => {
    setEditingGrupo(grupo);
    setEditNome(grupo.nome);
    setEditIsAtivo(grupo.isAtivo);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrupo) return;

    if (!editNome.trim()) {
      setEditError("O nome do grupo é obrigatório.");
      return;
    }

    setUpdating(true);
    setEditError("");
    try {
      await grupoService.atualizarGrupo(editingGrupo.id, {
        nome: editNome.trim(),
        isAtivo: editIsAtivo,
      });
      setEditModalOpen(false);
      setEditingGrupo(null);
      carregarGrupos();
    } catch (err) {
      if (err instanceof HttpError) {
        setEditError(err.response?.mensagem || err.message);
      } else {
        setEditError("Erro ao atualizar o grupo.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenCadastrarLider = (grupo: GrupoDetalhe) => {
    setSelectedGrupoLider(grupo);
    setLiderNome("");
    setLiderEmail("");
    setLiderTelefone("");
    setLiderTitulo("");
    setLiderSenha("");
    setLiderError("");
    setLiderModalOpen(true);
  };

  const handleCadastrarLider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrupoLider) return;

    setCadastrandoLider(true);
    setLiderError("");
    try {
      await grupoService.cadastrarLider(selectedGrupoLider.id, {
        nome: liderNome.trim(),
        email: liderEmail.trim(),
        telefone: liderTelefone.trim(),
        titulo: liderTitulo.trim(),
        senha: liderSenha,
      });
      setLiderModalOpen(false);
      setSelectedGrupoLider(null);
      carregarGrupos();
    } catch (err) {
      if (err instanceof HttpError) {
        setLiderError(err.response?.mensagem || err.message);
      } else {
        setLiderError("Erro ao cadastrar o líder. Tente novamente.");
      }
    } finally {
      setCadastrandoLider(false);
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
        <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-[#ef4444]/30 text-center">
          <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-[#ef4444]" />
          </div>
          <h2 className="text-foreground text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground text-sm mb-6">
            A gestão de grupos de pesquisa é restrita a <strong>Administradores</strong> e <strong>Administradores Iniciais</strong> da plataforma.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-background rounded-xl border border-border/40 text-foreground hover:border-[#ff8c42]/60 transition-colors text-sm font-medium cursor-pointer"
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
          <div className="w-9 h-9 rounded-xl bg-background border border-border/40 flex items-center justify-center text-[#ff8c42] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-foreground font-medium block">{g.nome}</span>
            <span className="text-xs text-muted-foreground">
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
          <div className="w-8 h-8 rounded-lg bg-border/20 flex items-center justify-center text-[#4a9eff] shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            {g.nomeLider ? (
              <>
                <span className="text-foreground text-sm font-medium block">{g.nomeLider}</span>
                <span className="text-xs text-[#10b981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Líder Vinculado
                </span>
              </>
            ) : (
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs text-muted-foreground">Nenhum líder vinculado</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCadastrarLider(g);
                  }}
                  disabled={!g.isAtivo}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20 border border-[#ff8c42]/30 text-[#ff8c42] text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Líder</span>
                </button>
              </div>
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/grupos/${g.id}/participantes`);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background hover:bg-[#ff8c42]/10 border border-border/30 hover:border-[#ff8c42]/40 text-xs text-foreground transition-all cursor-pointer"
          title="Ver participantes"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#4a9eff]" />
          <span className="font-semibold">{g.totalParticipantes ?? 0}</span>
          <span className="text-muted-foreground">membros</span>
        </button>
      ),
    },
    {
      key: "isAtivo",
      header: "Status",
      align: "center",
      render: (g) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${g.isAtivo
            ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
            : "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${g.isAtivo ? "bg-[#10b981]" : "bg-[#ef4444]"
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/grupos/${g.id}/participantes`);
            }}
            className="p-1.5 rounded-lg border border-[#4a9eff]/30 text-[#4a9eff] hover:bg-[#4a9eff]/10 transition-colors cursor-pointer"
            title="Ver participantes"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(g);
            }}
            disabled={!g.isAtivo}
            className="p-1.5 rounded-lg border border-[#ff8c42]/30 text-[#ff8c42] hover:bg-[#ff8c42]/10 transition-colors disabled:opacity-40 cursor-pointer"
            title="Editar grupo"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(g);
            }}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold mb-1">
            Gestão de Grupos de Pesquisa
          </h1>
          <p className="text-muted-foreground text-sm">
            Cadastre novos grupos, envie convites para líderes e acompanhe a equipe
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={carregarGrupos}
            disabled={loading}
            className="p-2.5 bg-card hover:bg-border/30 border border-border/40 rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Recarregar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setCreatedGrupo(null);
              setModalError("");
              setNome("");
              setEmailLider("");
            }}
            className="px-4 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Grupo</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4a9eff] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total de Grupos</p>
              <h3 className="text-foreground text-2xl font-bold">{paginatedData.totalElements}</h3>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Grupos cadastrados no sistema</span>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Grupos Ativos na Página</p>
              <h3 className="text-foreground text-2xl font-bold text-[#10b981]">
                {paginatedData.items.filter((g) => g.isAtivo).length}
              </h3>
            </div>
          </div>
          <span className="text-xs text-[#10b981]">Em atividade</span>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Participantes na Página</p>
              <h3 className="text-foreground text-2xl font-bold text-[#ff8c42]">
                {paginatedData.items.reduce((acc, g) => acc + (g.totalParticipantes || 0), 0)}
              </h3>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Membros vinculados exibidos</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-card rounded-2xl p-4 border border-border/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Busca por Nome do Grupo */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filtrar por nome do grupo..."
            value={nomeFilter}
            onChange={(e) => setNomeFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-[#ff8c42]/50 transition-colors"
          />
          {nomeFilter && (
            <button
              type="button"
              onClick={() => setNomeFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Limpar filtro de nome"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Busca por Usuário/Líder */}
        <div className="flex-1 relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filtrar por líder, membro ou criador..."
            value={usuarioFilter}
            onChange={(e) => setUsuarioFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-[#ff8c42]/50 transition-colors"
          />
          {usuarioFilter && (
            <button
              type="button"
              onClick={() => setUsuarioFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Limpar filtro de usuário"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(nomeFilter || usuarioFilter) && (
          <button
            type="button"
            onClick={() => {
              setNomeFilter("");
              setUsuarioFilter("");
            }}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground bg-background hover:bg-border/30 border border-border/30 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            title="Redefinir filtros"
          >
            Restaurar padrão
          </button>
        )}
      </div>

      {/* Alerta de erro de ação (ex: remoção com usuários vinculados) */}
      {actionError && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="p-1 rounded-lg hover:bg-[#ef4444]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Erro de carregamento */}
      {error && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-center justify-between text-sm text-[#ef4444]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={carregarGrupos}
            className="underline font-semibold hover:text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabela de Grupos */}
      <DataTable
        title={
          <div className="flex items-center gap-3">
            <h2 className="text-foreground font-semibold text-lg">
              Lista de Grupos de Pesquisa
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-border/40 text-muted-foreground font-normal">
              {paginatedData.totalElements}{" "}
              {paginatedData.totalElements === 1 ? "registro" : "registros"}
            </span>
          </div>
        }
        data={paginatedData.items}
        columns={columns}
        onRowClick={(g) => navigate(`/grupos/${g.id}/participantes`)}
        page={page}
        pageSize={pageSize}
        totalElements={paginatedData.totalElements}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        emptyMessage={
          debouncedNome || debouncedUsuario ? (
            <div className="space-y-2 py-2 text-center">
              <p className="text-sm">Nenhum grupo encontrado para os filtros aplicados.</p>
              <button
                type="button"
                onClick={() => {
                  setNomeFilter("");
                  setUsuarioFilter("");
                }}
                className="text-xs text-[#ff8c42] hover:underline cursor-pointer font-medium"
              >
                Limpar filtros e exibir todos os grupos
              </button>
            </div>
          ) : (
            "Nenhum grupo de pesquisa cadastrado até o momento."
          )
        }
      />

      {/* Modal / Diálogo para Cadastrar Novo Grupo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border/40 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">
                    Novo Grupo de Pesquisa
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Cadastre o grupo e envie um convite com perfil de Líder
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {createdGrupo ? (
                <div className="p-5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-[#10b981] font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Grupo criado e convite de Líder enviado com sucesso!</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O grupo <strong>{createdGrupo.nome}</strong> foi cadastrado. Um convite de Líder com validade de 7 dias foi emitido para o e-mail informado.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 bg-[#ff8c42] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                      Nome do Grupo <span className="text-[#ff8c42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Laboratório de Inteligência Artificial"
                      disabled={creating}
                      className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                      E-mail do Líder <span className="text-[#ff8c42]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={emailLider}
                        onChange={(e) => setEmailLider(e.target.value)}
                        placeholder="lider@universidade.edu.br"
                        disabled={creating}
                        className="w-full py-2.5 pl-10 pr-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-background rounded-xl border border-border/30 text-xs text-muted-foreground space-y-1">
                    <p className="text-foreground font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ff8c42]" />
                      Convite com perfil de Líder
                    </p>
                    <p>
                      O usuário indicado receberá um convite exclusivo com a função de Líder para gerenciar o grupo assim que aceitar.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      disabled={creating}
                      className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Criando grupo...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Criar Grupo e Convidar Líder</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {editModalOpen && editingGrupo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border/40 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">Editar Grupo de Pesquisa</h3>
                  <p className="text-muted-foreground text-xs">Atualize os dados e o status do grupo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Nome do Grupo <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    disabled={updating}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border/30">
                  <input
                    type="checkbox"
                    id="editIsAtivo"
                    checked={editIsAtivo}
                    onChange={(e) => setEditIsAtivo(e.target.checked)}
                    disabled={updating}
                    className="w-4 h-4 accent-[#ff8c42] rounded cursor-pointer"
                  />
                  <label htmlFor="editIsAtivo" className="text-sm text-foreground cursor-pointer select-none">
                    Grupo Ativo
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    disabled={updating}
                    className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar Alterações</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {liderModalOpen && selectedGrupoLider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-lg border border-border/40 overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff8c42] flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-lg">Cadastrar Líder</h3>
                  <p className="text-muted-foreground text-xs">Vincular líder ao grupo: {selectedGrupoLider.nome}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLiderModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {liderError && (
                <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#ef4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{liderError}</span>
                </div>
              )}

              <form onSubmit={handleCadastrarLider} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Nome Completo <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={liderNome}
                    onChange={(e) => setLiderNome(e.target.value)}
                    placeholder="Ex: Dr. Carlos Silva"
                    disabled={cadastrandoLider}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    E-mail <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={liderEmail}
                    onChange={(e) => setLiderEmail(e.target.value)}
                    placeholder="carlos.silva@universidade.edu.br"
                    disabled={cadastrandoLider}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                      Telefone <span className="text-[#ff8c42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={liderTelefone}
                      onChange={(e) => setLiderTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      disabled={cadastrandoLider}
                      className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                      Titulação <span className="text-[#ff8c42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={liderTitulo}
                      onChange={(e) => setLiderTitulo(e.target.value)}
                      placeholder="Ex: Doutor, Mestre"
                      disabled={cadastrandoLider}
                      className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5 font-normal">
                    Senha Provisória <span className="text-[#ff8c42]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={liderSenha}
                    onChange={(e) => setLiderSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={cadastrandoLider}
                    className="w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setLiderModalOpen(false)}
                    disabled={cadastrandoLider}
                    className="px-4 py-2.5 bg-background hover:bg-border/20 border border-border/40 text-muted-foreground hover:text-foreground rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={cadastrandoLider}
                    className="px-5 py-2.5 bg-[#ff8c42] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {cadastrandoLider ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cadastrando...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Cadastrar Líder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}