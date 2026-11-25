import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Edit, Trash2, X, Loader2, UserCog } from "lucide-react";
import { DataTable, Column } from "../components/DataTable";
import { UsuarioService } from "../services/usuarios/UsuarioService";
import { UsuarioResponse, UsuarioPaginadoResponse } from "../models/dto/usuarios/Usuario";
import { HttpError } from "../utils/HttpError";
import { formatarTelefone } from "../utils/Telefone";
import { useConfirmacao } from "../contexts/ConfirmacaoContext";

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 transition-colors text-sm disabled:opacity-50";
const labelClass = "text-xs text-muted-foreground block mb-1.5";

const ROTULO_ACESSO: Record<string, string> = {
  ADMIN: "Administrador",
  INITIAL_ADMIN: "Administrador inicial",
  USER: "Usuário",
};

const VAZIO: UsuarioPaginadoResponse = { items: [], totalElements: 0, totalPages: 0, page: 1, size: 10 };

export function Usuarios() {
  const usuarioService = useMemo(() => new UsuarioService(), []);
  const confirmar = useConfirmacao();
  const [inativandoId, setInativandoId] = useState<number | null>(null);

  const [dados, setDados] = useState<UsuarioPaginadoResponse>(VAZIO);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");

  const [editando, setEditando] = useState<UsuarioResponse | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", titulo: "" });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  // Pesquisa quando o usuário para de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await usuarioService.listar(page, pageSize, buscaAplicada));
    } catch (err) {
      setDados(VAZIO);
      setErro(err instanceof HttpError ? err.response?.mensagem || err.message : "Erro ao carregar usuários.");
    } finally {
      setCarregando(false);
    }
  }, [usuarioService, page, pageSize, buscaAplicada]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirEdicao = (u: UsuarioResponse) => {
    setEditando(u);
    setForm({ nome: u.nome, email: u.email, telefone: (u.telefone ?? "").replace(/\D/g, ""), titulo: u.titulo ?? "" });
    setErroForm("");
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim() || !form.titulo.trim()) {
      setErroForm("Preencha todos os campos.");
      return;
    }
    if (form.telefone.length < 10) {
      setErroForm("Telefone inválido: informe DDD e número (10 ou 11 dígitos).");
      return;
    }
    setSalvando(true);
    setErroForm("");
    try {
      const atualizado = await usuarioService.atualizar(editando.id, form);
      setDados((atual) => ({
        ...atual,
        items: atual.items.map((u) => (u.id === atualizado.id ? atualizado : u)),
      }));
      setEditando(null);
    } catch (err) {
      setErroForm(err instanceof HttpError ? err.response?.mensagem || err.message : "Erro ao salvar usuário.");
    } finally {
      setSalvando(false);
    }
  };

  const inativar = async (u: UsuarioResponse) => {
    const confirmado = await confirmar({
      titulo: "Inativar usuário",
      mensagem: `Deseja realmente inativar o usuário "${u.nome}"? Ele perderá o acesso ao sistema.`,
      textoConfirmar: "Inativar",
      perigo: true,
    });
    if (!confirmado) return;

    setErro("");
    setInativandoId(u.id);
    try {
      await usuarioService.inativar(u.id);
      carregar();
    } catch (err) {
      setErro(err instanceof HttpError ? err.response?.mensagem || err.message : "Erro ao inativar usuário.");
    } finally {
      setInativandoId(null);
    }
  };

  const colunas: Column<UsuarioResponse>[] = [
    {
      key: "nome",
      header: "Nome",
      align: "left",
      render: (u) => (
        <div className="min-w-0 max-w-[240px]">
          <p className="text-foreground font-medium truncate">{u.nome}</p>
          <p className="text-xs text-muted-foreground truncate">{u.titulo}</p>
        </div>
      ),
    },
    { key: "email", header: "E-mail", align: "left", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "telefone", header: "Telefone", align: "left", render: (u) => <span className="text-muted-foreground">{u.telefone ? formatarTelefone(u.telefone) : "—"}</span> },
    {
      key: "acesso",
      header: "Acesso",
      align: "left",
      render: (u) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-border/30 text-muted-foreground">
          {(u.accessLevel && ROTULO_ACESSO[u.accessLevel]) || u.accessLevel || "—"}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => abrirEdicao(u)}
            className="p-2 rounded-lg bg-background hover:bg-primary/10 transition-colors border border-border/30 text-primary cursor-pointer"
            title="Editar usuário"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inativar(u)}
            disabled={inativandoId === u.id}
            className="p-2 rounded-lg bg-background hover:bg-[#ef4444]/10 transition-colors border border-border/30 text-[#ef4444] cursor-pointer disabled:opacity-40"
            title="Inativar usuário"
          >
            {inativandoId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-auto p-6 space-y-5">

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      {erro && (
        <div className="bg-destructive/20 text-destructive px-4 py-3 rounded-lg border border-destructive/30 text-sm">{erro}</div>
      )}

      <DataTable
        title={
          <div className="flex items-center gap-3">
            <h2 className="text-foreground font-semibold text-lg">Usuários cadastrados</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-border/40 text-muted-foreground font-normal">
              {dados.totalElements} {dados.totalElements === 1 ? "registro" : "registros"}
            </span>
          </div>
        }
        data={dados.items}
        columns={colunas}
        keyExtractor={(u) => u.id}
        page={page}
        pageSize={pageSize}
        totalElements={dados.totalElements}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={setPage}
        onPageSizeChange={(tamanho) => {
          setPageSize(tamanho);
          setPage(1);
        }}
        emptyMessage={carregando ? "Carregando..." : "Nenhum usuário encontrado."}
      />

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={salvar} className="w-full max-w-lg bg-card rounded-2xl border border-border/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserCog className="w-5 h-5" />
                </div>
                <h2 className="text-foreground font-semibold">Editar usuário</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="p-2 hover:bg-border/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div>
              <label className={labelClass}>Nome *</label>
              <input className={inputClass} value={form.nome} disabled={salvando}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>E-mail *</label>
              <input type="email" className={inputClass} value={form.email} disabled={salvando}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <p className="text-[11px] text-muted-foreground mt-1">O e-mail também é o login do usuário.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Telefone *</label>
                <input className={inputClass} value={form.telefone} disabled={salvando}
                  inputMode="numeric" maxLength={11} placeholder="41999990000"
                  onChange={(e) => setForm({ ...form, telefone: e.target.value.replace(/\D/g, "") })} />
              </div>
              <div>
                <label className={labelClass}>Título *</label>
                <input className={inputClass} value={form.titulo} disabled={salvando}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </div>
            </div>

            {erroForm && <p className="text-sm text-destructive">{erroForm}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditando(null)}
                disabled={salvando}
                className="flex-1 py-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
