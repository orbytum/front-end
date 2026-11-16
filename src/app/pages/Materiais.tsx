import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Plus,
  Search,
  Package,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { AuthService } from "../services/auth/AuthService";
import { MaterialService } from "../services/materiais/MaterialService";
import {
  MaterialResponse,
  MaterialStatusLabels,
  MATERIAL_STATUS,
} from "../models/dto/materiais/Material";
import { nivelEhLider } from "../models/dto/NivelMembro";
import { HttpError } from "../utils/HttpError";
import { DateInput } from "../components/DateInput";

const inputClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm disabled:opacity-50";

const labelClass = "text-xs text-muted-foreground block mb-1.5";

const selectClass =
  "w-full py-2.5 px-4 bg-background rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/60 transition-colors text-sm";

const NA = "\u2014";

function obterCorStatus(status: string) {
  switch (status) {
    case "DISPONIVEL": return "bg-[#10b981]/20 text-[#10b981]";
    case "EM_USO": return "bg-[#ff8c42]/20 text-[#ff8c42]";
    case "MANUTENCAO": return "bg-[#f59e0b]/20 text-[#f59e0b]";
    default: return "bg-muted-foreground/20 text-muted-foreground";
  }
}

function formatarData(data: string | null | undefined): string {
  if (!data) return NA;
  return new Date(data).toLocaleDateString("pt-BR");
}

export function Materiais() {
  const { grupoAtual } = useGrupo();
  const materialService = useMemo(() => new MaterialService(), []);
  const authService = useMemo(() => new AuthService(), []);

  const podeGerenciar =
    authService.isAdmin() || nivelEhLider(grupoAtual?.nivel);

  const [materiais, setMateriais] = useState<MaterialResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<MaterialResponse | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formCategoria, setFormCategoria] = useState("");
  const [formIdentificador, setFormIdentificador] = useState("");
  const [formQuantidade, setFormQuantidade] = useState("");
  const [formLocalizacao, setFormLocalizacao] = useState("");
  const [formDthCompra, setFormDthCompra] = useState("");
  const [formStatus, setFormStatus] = useState("DISPONIVEL");
  const [formIsAtivo, setFormIsAtivo] = useState(true);

  const carregarMateriais = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const lista = await materialService.listar();
      setMateriais(lista);
    } catch (err) {
      setMateriais([]);
      if (err instanceof HttpError) {
        setErro(err.response?.mensagem || err.message);
      } else {
        setErro("Erro ao carregar materiais.");
      }
    } finally {
      setCarregando(false);
    }
  }, [materialService]);

  useEffect(() => {
    carregarMateriais();
  }, [carregarMateriais]);

  const materiaisFiltrados = materiais.filter((m) => {
    const termo = termoBusca.toLowerCase();
    const correspondeBusca =
      !termo ||
      m.nome.toLowerCase().includes(termo) ||
      (m.categoria && m.categoria.toLowerCase().includes(termo)) ||
      m.identificador.toLowerCase().includes(termo) ||
      m.localizacao.toLowerCase().includes(termo);

    const correspondeStatus = filtroStatus === "all" || m.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  const estatisticas = {
    total: materiais.length,
    disponiveis: materiais.filter((m) => m.status === "DISPONIVEL").length,
    emUso: materiais.filter((m) => m.status === "EM_USO").length,
    manutencao: materiais.filter((m) => m.status === "MANUTENCAO").length,
  };

  const resetForm = () => {
    setFormNome("");
    setFormDescricao("");
    setFormCategoria("");
    setFormIdentificador("");
    setFormQuantidade("");
    setFormLocalizacao("");
    setFormDthCompra("");
    setFormStatus("DISPONIVEL");
    setFormIsAtivo(true);
    setErroForm("");
  };

  const abrirModalCriar = () => {
    resetForm();
    setEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (material: MaterialResponse) => {
    setEditando(material);
    setFormNome(material.nome);
    setFormDescricao(material.descricao);
    setFormCategoria(material.categoria ?? "");
    setFormIdentificador(material.identificador);
    setFormQuantidade(String(material.quantidade));
    setFormLocalizacao(material.localizacao);
    setFormDthCompra(material.dthCompra ? material.dthCompra.slice(0, 16) : "");
    setFormStatus(material.status);
    setFormIsAtivo(material.isAtivo);
    setErroForm("");
    setModalAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formNome.trim() ||
      !formDescricao.trim() ||
      !formCategoria.trim() ||
      !formIdentificador.trim() ||
      !formQuantidade ||
      !formLocalizacao.trim() ||
      !formDthCompra
    ) {
      setErroForm("Preencha todos os campos obrigatórios.");
      return;
    }
    setSalvando(true);
    setErroForm("");
    try {
      if (editando) {
        const atualizado = await materialService.atualizar(editando.id, {
          nome: formNome.trim(),
          descricao: formDescricao.trim(),
          categoria: formCategoria.trim(),
          identificador: formIdentificador.trim(),
          quantidade: Number(formQuantidade),
          localizacao: formLocalizacao.trim(),
          dthCompra: formDthCompra,
          status: formStatus,
          isAtivo: formIsAtivo,
        });
        setMateriais((prev) => prev.map((m) => (m.id === atualizado.id ? atualizado : m)));
      } else {
        const criado = await materialService.criar({
          nome: formNome.trim(),
          descricao: formDescricao.trim(),
          categoria: formCategoria.trim(),
          identificador: formIdentificador.trim(),
          quantidade: Number(formQuantidade),
          localizacao: formLocalizacao.trim(),
          dthCompra: formDthCompra,
          status: formStatus,
        });
        setMateriais((prev) => [...prev, criado]);
      }
      setModalAberto(false);
      resetForm();
    } catch (err) {
      if (err instanceof HttpError) {
        setErroForm(err.response?.mensagem || err.message);
      } else {
        setErroForm("Erro ao salvar o material.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (material: MaterialResponse) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${material.nome}"?`)) return;
    try {
      await materialService.remover(material.id);
      setMateriais((prev) => prev.filter((m) => m.id !== material.id));
    } catch (err) {
      if (err instanceof HttpError) {
        setErro(err.response?.mensagem || err.message);
      } else {
        setErro("Erro ao excluir o material.");
      }
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground mb-2">Materiais e Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie o inventário de materiais dos grupos</p>
        </div>
        <button
          onClick={() => carregarMateriais()}
          className="p-3 bg-card rounded-xl border border-border/30 hover:bg-card/80 transition-colors"
          title="Recarregar"
        >
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {erro && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-xl mb-6 border border-destructive/30">
          <p className="font-medium">{erro}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total</span>
            <Package className="w-5 h-5 text-[#4a9eff]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.total}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Disponível</span>
            <Box className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.disponiveis}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Em Uso</span>
            <Box className="w-5 h-5 text-[#ff8c42]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.emUso}</div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Manutenção</span>
            <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="text-foreground text-2xl font-bold">{estatisticas.manutencao}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, categoria, identificador ou localização..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card rounded-xl border border-border/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#ff8c42]/50"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-3 bg-card rounded-xl border border-border/30 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
        >
          <option value="all">Todos os Status</option>
          {MATERIAL_STATUS.map((s) => (
            <option key={s} value={s}>
              {MaterialStatusLabels[s]}
            </option>
          ))}
        </select>

        {podeGerenciar && (
          <button
            onClick={abrirModalCriar}
            className="px-6 py-3 bg-[#ff8c42] text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Material</span>
          </button>
        )}
      </div>

      {carregando && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#ff8c42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando materiais...</p>
        </div>
      )}

      {!carregando && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {materiaisFiltrados.map((material) => {
            const disponivel = material.quantidadeDisponivel ?? material.quantidade;
            return (
              <div
                key={material.id}
                className="bg-card rounded-2xl p-6 border border-border/30 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ff8c42] flex items-center justify-center flex-shrink-0">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-semibold mb-1 truncate">{material.nome}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {material.categoria ?? NA}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Identificador</span>
                    <span className="text-sm text-foreground">{material.identificador}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade</span>
                    <span className="text-sm font-semibold text-[#ff8c42]">
                      {disponivel} / {material.quantidade} un.
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Localização</span>
                    <span className="text-sm text-foreground truncate ml-2">{material.localizacao}</span>
                  </div>
                  {material.usuarioEmUsoNome && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Em uso por</span>
                      <span className="text-sm text-foreground truncate ml-2">
                        {material.usuarioEmUsoNome}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">
                    Adq: {formatarData(material.dthCompra)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${obterCorStatus(material.status)}`}>
                    {MaterialStatusLabels[material.status] ?? material.status}
                  </span>
                </div>

                {podeGerenciar && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => abrirModalEditar(material)}
                      className="flex-1 py-2 bg-muted-foreground/20 text-muted-foreground rounded-lg hover:bg-muted-foreground/30 transition-colors text-xs font-medium"
                    >
                      <Pencil className="w-4 h-4 inline" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleRemover(material)}
                      className="flex-1 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!carregando && materiaisFiltrados.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border/30">
          <Box className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            {materiais.length === 0
              ? "Nenhum material cadastrado"
              : "Nenhum material corresponde aos filtros"}
          </p>
          {materiais.length === 0 && podeGerenciar && (
            <button
              onClick={abrirModalCriar}
              className="mt-4 px-6 py-3 bg-[#ff8c42]/20 text-[#ff8c42] rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5 inline" />
              Cadastrar primeiro material
            </button>
          )}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-8 border border-border/30 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-semibold">
                {editando ? "Editar Material" : "Novo Material"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 rounded-xl hover:bg-destructive/20 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {erroForm && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-xl mb-4">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className={labelClass}>Nome *</label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Projetor Epson"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Descrição *</label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className={`${inputClass} min-h-[70px]`}
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Categoria *</label>
                <input
                  type="text"
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Equipamento"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Identificador *</label>
                <input
                  type="text"
                  value={formIdentificador}
                  onChange={(e) => setFormIdentificador(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: PAT-001"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  value={formQuantidade}
                  onChange={(e) => setFormQuantidade(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: 3"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Localização *</label>
                <input
                  type="text"
                  value={formLocalizacao}
                  onChange={(e) => setFormLocalizacao(e.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Sala 2"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Data de aquisição *</label>
                <DateInput
                  type="datetime-local"
                  value={formDthCompra}
                  onChange={setFormDthCompra}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Status *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className={selectClass}
                  required
                >
                  {MATERIAL_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {MaterialStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 py-3 bg-background rounded-xl border border-border/30 text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-3 bg-[#ff8c42] text-white rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Cadastrar Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}