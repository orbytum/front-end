import { createContext, useContext, useEffect } from "react";

/**
 * Permite que uma página substitua o título exibido no header (breadcrumb
 * "ORBYTUM / <grupo> / <página>"). Sem substituição, o Layout usa o nome da rota.
 */
interface CabecalhoContextData {
  definirTitulo: (titulo: string | null) => void;
}

export const CabecalhoContext = createContext<CabecalhoContextData>({
  definirTitulo: () => {},
});

/** Define o título da página no header enquanto a página estiver montada. */
export function useTituloPagina(titulo: string | null) {
  const { definirTitulo } = useContext(CabecalhoContext);
  useEffect(() => {
    definirTitulo(titulo);
    return () => definirTitulo(null);
  }, [titulo, definirTitulo]);
}
