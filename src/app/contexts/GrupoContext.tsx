import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MeuGrupoResponse } from "../models/dto/grupos/MeuGrupo";
import { GrupoService } from "../services/grupos/GrupoService";
import { AuthService } from "../services/auth/AuthService";

interface GrupoContextData {
  grupoAtual: MeuGrupoResponse | null;
  meusGrupos: MeuGrupoResponse[];
  carregandoGrupos: boolean;
  semGrupos: boolean;
  selecionarGrupo: (grupo: MeuGrupoResponse) => void;
  recarregarGrupos: () => Promise<void>;
}

const GrupoContext = createContext<GrupoContextData>({} as GrupoContextData);

export function GrupoProvider({ children }: { children: React.ReactNode }) {
  const [grupoAtual, setGrupoAtual] = useState<MeuGrupoResponse | null>(() => {
    try {
      const salvo = localStorage.getItem("grupo_atual") || sessionStorage.getItem("grupo_atual");
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });
  const [meusGrupos, setMeusGrupos] = useState<MeuGrupoResponse[]>([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);
  const [semGrupos, setSemGrupos] = useState(false);

  const authService = new AuthService();
  const grupoService = new GrupoService();

  const sincronizarStorage = (grupo: MeuGrupoResponse | null) => {
    if (grupo) {
      const json = JSON.stringify(grupo);
      localStorage.setItem("grupo_atual", json);
      localStorage.setItem("grupo_id", String(grupo.id));
      sessionStorage.setItem("grupo_atual", json);
      sessionStorage.setItem("grupo_id", String(grupo.id));
    } else {
      localStorage.removeItem("grupo_atual");
      localStorage.removeItem("grupo_id");
      sessionStorage.removeItem("grupo_atual");
      sessionStorage.removeItem("grupo_id");
    }
  };

  const selecionarGrupo = useCallback((grupo: MeuGrupoResponse) => {
    setGrupoAtual(grupo);
    sincronizarStorage(grupo);
    window.dispatchEvent(new CustomEvent("grupoAlterado", { detail: grupo }));
  }, []);

  const carregarGrupos = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setCarregandoGrupos(false);
      return;
    }

    const isAdmin = authService.isAdminOrInitialAdmin();
    setCarregandoGrupos(true);
    try {
      const grupos = await grupoService.listarMeusGrupos();
      setMeusGrupos(grupos || []);

      if (!grupos || grupos.length === 0) {
        // Apenas bloqueia se não for administrador
        if (!isAdmin) {
          setSemGrupos(true);
        } else {
          setSemGrupos(false);
        }
        setGrupoAtual(null);
        sincronizarStorage(null);
      } else {
        setSemGrupos(false);
        // Verifica se há último grupo salvo no localStorage / sessionStorage
        let grupoParaSelecionar: MeuGrupoResponse | null = null;
        try {
          const salvoStr = localStorage.getItem("grupo_atual") || sessionStorage.getItem("grupo_atual");
          if (salvoStr) {
            const salvo = JSON.parse(salvoStr);
            const encontrado = grupos.find((g) => g.id === salvo.id);
            if (encontrado) {
              grupoParaSelecionar = encontrado;
            }
          }
        } catch {
          grupoParaSelecionar = null;
        }

        // Se não houver ou for inválido, seleciona o primeiro da lista
        if (!grupoParaSelecionar) {
          grupoParaSelecionar = grupos[0];
        }

        setGrupoAtual(grupoParaSelecionar);
        sincronizarStorage(grupoParaSelecionar);
      }
    } catch (err) {
      console.error("Erro ao carregar grupos do usuário:", err);
      if (!isAdmin) {
        setSemGrupos(true);
      }
    } finally {
      setCarregandoGrupos(false);
    }
  }, []);

  useEffect(() => {
    carregarGrupos();
  }, [carregarGrupos]);

  return (
    <GrupoContext.Provider
      value={{
        grupoAtual,
        meusGrupos,
        carregandoGrupos,
        semGrupos,
        selecionarGrupo,
        recarregarGrupos: carregarGrupos,
      }}
    >
      {children}
    </GrupoContext.Provider>
  );
}

export function useGrupo() {
  const context = useContext(GrupoContext);
  if (!context) {
    throw new Error("useGrupo deve ser utilizado dentro de um GrupoProvider");
  }
  return context;
}
