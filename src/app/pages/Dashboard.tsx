import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { FolderKanban, ListTodo, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { SolarSystem } from "../components/SolarSystem";
import { useGrupo } from "../contexts/GrupoContext";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { AtividadeService } from "../services/atividades/AtividadeService";
import { LembreteService } from "../services/lembretes/LembreteService";
import { AuthService } from "../services/auth/AuthService";
import { ProjetoResponse, projetoEstaAberto } from "../models/dto/projetos/Projeto";
import { nivelEhLider } from "../models/dto/NivelMembro";
import { ocorrenciasNoIntervalo } from "../utils/Recorrencia";

/** Status de atividade que ainda dependem do responsável ("a fazer"). */
const STATUS_TAREFA_PENDENTE = new Set(["PENDENTE", "EM_ANDAMENTO"]);

interface Resumo {
  projetos: number;
  projetosAbertos: number;
  tarefasPendentes: number;
  tarefasAtrasadas: number;
  eventosHoje: number;
  proximoEvento: { titulo: string; data: Date } | null;
}

const RESUMO_VAZIO: Resumo = {
  projetos: 0,
  projetosAbertos: 0,
  tarefasPendentes: 0,
  tarefasAtrasadas: 0,
  eventosHoje: 0,
  proximoEvento: null,
};

function plural(n: number, singular: string, pluralTexto: string) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

const formatarHora = (data: Date) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(data);

export function Dashboard() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const projetoService = useMemo(() => new ProjetoService(), []);
  const atividadeService = useMemo(() => new AtividadeService(), []);
  const lembreteService = useMemo(() => new LembreteService(), []);
  const authService = useMemo(() => new AuthService(), []);
  const navigate = useNavigate();

  const [favoritos, setFavoritos] = useState<ProjetoResponse[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [resumo, setResumo] = useState<Resumo>(RESUMO_VAZIO);
  const [carregandoResumo, setCarregandoResumo] = useState(false);

  // REQ-071: o Líder do grupo vê todos os projetos em destaque do grupo;
  // os demais integrantes veem só os projetos em destaque dos quais participam.
  const veTodosOsDestaques =
    authService.isAdminOrInitialAdmin() || nivelEhLider(grupoAtual?.nivel);

  const carregarProjetos = useCallback(async () => {
    if (!grupoAtual?.id) {
      setFavoritos([]);
      return;
    }

    setCarregandoProjetos(true);
    try {
      const lista = await projetoService.listarProjetosPorGrupo(grupoAtual.id);
      const destaques = lista.filter((p) => p.isFavorito);
      if (veTodosOsDestaques) {
        setFavoritos(destaques);
        return;
      }

      const email = authService.getUserEmail()?.toLowerCase();
      const participacoes = await Promise.all(
        destaques.map(async (projeto) => {
          try {
            const participantes = await projetoService.listarParticipantes(projeto.id);
            return participantes.some((p) => p.isAtivo && p.email?.toLowerCase() === email);
          } catch {
            return false;
          }
        })
      );
      setFavoritos(destaques.filter((_, i) => participacoes[i]));
    } catch {
      setFavoritos([]);
    } finally {
      setCarregandoProjetos(false);
    }
  }, [grupoAtual?.id, projetoService, authService, veTodosOsDestaques]);

  // Resumo dos cards: cada fonte é independente, então a falha de uma não zera as outras.
  const carregarResumo = useCallback(async () => {
    if (!grupoAtual?.id) {
      setResumo(RESUMO_VAZIO);
      return;
    }

    setCarregandoResumo(true);
    const [projetos, atividades, lembretes] = await Promise.allSettled([
      projetoService.listarProjetosPorGrupo(grupoAtual.id),
      atividadeService.listarPorGrupo(grupoAtual.id),
      lembreteService.listarTodosPorGrupo(grupoAtual.id),
    ]);

    const novo: Resumo = { ...RESUMO_VAZIO };

    if (projetos.status === "fulfilled") {
      // A API já devolve só os projetos a que o usuário tem acesso (REQ-094).
      novo.projetos = projetos.value.length;
      novo.projetosAbertos = projetos.value.filter((p) => projetoEstaAberto(p.status)).length;
    }

    if (atividades.status === "fulfilled") {
      // Tarefas de todos os projetos do grupo a que o usuário tem acesso (a API já filtra), de qualquer responsável
      const pendentes = atividades.value.filter(
        (a) => a.isAtivo !== false && STATUS_TAREFA_PENDENTE.has(a.status.toUpperCase())
      );
      novo.tarefasPendentes = pendentes.length;
      novo.tarefasAtrasadas = pendentes.filter((a) => a.isAtrasada).length;
    }

    if (lembretes.status === "fulfilled") {
      const agora = new Date();
      const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      const fimDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);
      const hoje = lembretes.value
        .flatMap((l) =>
          ocorrenciasNoIntervalo(new Date(l.dataHora), l.recorrencia, inicioDia, fimDia).map((data) => ({
            titulo: l.titulo,
            data,
          }))
        )
        .sort((a, b) => a.data.getTime() - b.data.getTime());
      novo.eventosHoje = hoje.length;
      novo.proximoEvento = hoje.find((e) => e.data.getTime() >= agora.getTime()) ?? null;
    }

    setResumo(novo);
    setCarregandoResumo(false);
  }, [grupoAtual?.id, projetoService, atividadeService, lembreteService]);

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const abrirProjeto = (projeto: ProjetoResponse) => {
    navigate(`/projetos?projetoId=${projeto.id}`);
  };

  const carregandoCards = carregandoGrupos || carregandoResumo;

  const cards = [
    {
      titulo: "Projetos",
      valor: resumo.projetos,
      detalhe: plural(resumo.projetosAbertos, "em aberto", "em aberto"),
      icone: FolderKanban,
      cor: "text-[#4a9eff] bg-[#4a9eff]/10 border-[#4a9eff]/20",
      destino: "/projetos",
    },
    {
      titulo: "Tarefas pendentes",
      valor: resumo.tarefasPendentes,
      detalhe:
        resumo.tarefasAtrasadas > 0
          ? plural(resumo.tarefasAtrasadas, "atrasada", "atrasadas")
          : "Nenhuma atrasada",
      detalheAlerta: resumo.tarefasAtrasadas > 0,
      icone: ListTodo,
      cor: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
      destino: "/atividades",
    },
    {
      titulo: "Eventos hoje",
      valor: resumo.eventosHoje,
      detalhe: resumo.proximoEvento
        ? `Próximo: ${formatarHora(resumo.proximoEvento.data)} · ${resumo.proximoEvento.titulo}`
        : resumo.eventosHoje > 0
          ? "Nenhum outro evento hoje"
          : "Agenda livre hoje",
      icone: CalendarDays,
      cor: "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20",
      destino: "/calendario",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Boas-vindas e resumo do usuário no grupo atual */}
      <section className="px-6 pt-6 pb-2 space-y-5">
        <div>
          <h1 className="font-marca text-3xl font-bold text-foreground tracking-tight">
            Bem-vindo ao Orbytum
          </h1>
          {grupoAtual?.nome && (
            <p className="text-sm text-muted-foreground mt-1">
              Seu resumo em <span className="text-foreground font-medium">{grupoAtual.nome}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <button
              key={card.titulo}
              type="button"
              onClick={() => navigate(card.destino)}
              className="group text-left bg-card rounded-lg border border-border/30 p-5 flex items-start gap-4 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${card.cor}`}>
                <card.icone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{card.titulo}</p>
                {carregandoCards ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin my-1.5" />
                ) : (
                  <p className="text-3xl font-bold text-foreground leading-tight">{card.valor}</p>
                )}
                <p
                  className={`text-xs truncate ${
                    card.detalheAlerta ? "text-[#ef4444]" : "text-muted-foreground"
                  }`}
                  title={carregandoCards ? undefined : card.detalhe}
                >
                  {carregandoCards ? " " : card.detalhe}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Visualização em sistema solar dos projetos favoritos */}
      <div className="flex-1 min-h-0">
        <SolarSystem
          projetos={favoritos}
          carregando={carregandoGrupos || carregandoProjetos}
          nomeGrupo={grupoAtual?.nome ?? null}
          onProjetoClick={abrirProjeto}
        />
      </div>
    </div>
  );
}
