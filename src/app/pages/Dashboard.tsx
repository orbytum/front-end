import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { SolarSystem } from "../components/SolarSystem";
import { useGrupo } from "../contexts/GrupoContext";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { AuthService } from "../services/auth/AuthService";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";
import { nivelEhLider } from "../models/dto/NivelMembro";

export function Dashboard() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const projetoService = useMemo(() => new ProjetoService(), []);
  const authService = useMemo(() => new AuthService(), []);
  const navigate = useNavigate();

  const [favoritos, setFavoritos] = useState<ProjetoResponse[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);

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

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  const abrirProjeto = (projeto: ProjetoResponse) => {
    navigate(`/projetos?projetoId=${projeto.id}`);
  };

  return (
    <div className="h-full flex flex-col">
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
