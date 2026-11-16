import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { SolarSystem } from "../components/SolarSystem";
import { useGrupo } from "../contexts/GrupoContext";
import { ProjetoService } from "../services/projetos/ProjetoService";
import { ProjetoResponse } from "../models/dto/projetos/Projeto";

export function Dashboard() {
  const { grupoAtual, carregandoGrupos } = useGrupo();
  const projetoService = useMemo(() => new ProjetoService(), []);
  const navigate = useNavigate();

  const [projetos, setProjetos] = useState<ProjetoResponse[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);

  const carregarProjetos = useCallback(async () => {
    if (!grupoAtual?.id) {
      setProjetos([]);
      return;
    }

    setCarregandoProjetos(true);
    try {
      const lista = await projetoService.listarProjetosPorGrupo(grupoAtual.id);
      setProjetos(lista);
    } catch {
      setProjetos([]);
    } finally {
      setCarregandoProjetos(false);
    }
  }, [grupoAtual?.id, projetoService]);

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]);

  const favoritos = useMemo(() => projetos.filter((p) => p.isFavorito), [projetos]);

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
