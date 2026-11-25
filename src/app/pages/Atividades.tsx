import { useState, useEffect, useCallback, useMemo } from "react";
import { ListTodo, Loader2, FolderKanban } from "lucide-react";
import { useGrupo } from "../contexts/GrupoContext";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { AuthService } from "../services/auth/AuthService";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";
import { ProjetoCombobox } from "../components/ProjetoCombobox";
import { AtividadesBoard } from "../components/AtividadesBoard";

export function Atividades() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const projetoService = useMemo(() => new ProjetoService(), []);
  const authService = useMemo(() => new AuthService(), []);

  const [projetos, setProjetos] = useState<ProjetoResponse[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoResponse | null>(null);

  const isAdmin = authService.isAdminOrInitialAdmin();

  const carregarProjetos = useCallback(async () => {
    if (!grupoAtual?.id) {
      setProjetos([]);
      setProjetoSelecionado(null);
      return;
    }

    setCarregandoProjetos(true);
    try {
      const lista = await projetoService.listarProjetosPorGrupo(grupoAtual.id);
      setProjetos(lista);
      setProjetoSelecionado((prev) => {
        if (prev) {
          const encontrado = lista.find((p) => p.id === prev.id);
          if (encontrado) return encontrado;
        }
        return lista[0] ?? null;
      });
    } catch {
      setProjetos([]);
      setProjetoSelecionado(null);
    } finally {
      setCarregandoProjetos(false);
    }
  }, [grupoAtual?.id, projetoService]);

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="bg-card rounded-lg p-5 border border-border/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#ff8c42]/15 flex items-center justify-center text-[#ff8c42] shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <ProjetoCombobox
            projetos={projetos}
            projetoSelecionado={projetoSelecionado}
            onSelecionarProjeto={setProjetoSelecionado}
            carregando={carregandoProjetos || carregandoGrupos}
          />
        </div>
        {grupoAtual && (
          <span className="text-xs text-muted-foreground">
            Grupo de Pesquisa: <strong className="text-foreground">{grupoAtual.nome}</strong>
          </span>
        )}
      </div>

      {carregandoGrupos || (carregandoProjetos && projetos.length === 0) ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
        </div>
      ) : projetoSelecionado ? (
        <AtividadesBoard
          projeto={projetoSelecionado}
          nivel={grupoAtual?.nivel ?? null}
          isAdmin={isAdmin}
          onRecarregar={carregarProjetos}
          onProjetoAtualizado={(atualizado) => {
            setProjetos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)));
            setProjetoSelecionado(atualizado);
          }}
        />
      ) : (
        <div className="text-center py-20 bg-card rounded-lg border border-border/30 space-y-3">
          <ListTodo className="w-16 h-16 text-muted-foreground/40 mx-auto" />
          <h3 className="text-foreground font-semibold text-lg">Nenhum projeto disponível</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {grupoAtual
              ? `O grupo "${grupoAtual.nome}" ainda não possui projetos. Crie um projeto no Painel de Projetos para começar a registrar atividades.`
              : "Selecione um grupo de pesquisa no cabeçalho para carregar as atividades."}
          </p>
        </div>
      )}
    </div>
  );
}
