import { useId } from "react";

interface LogoOrbytumProps {
  /** Lado do símbolo em pixels. */
  tamanho?: number;
  /** Exibe o nome "orbytum" ao lado (ou abaixo, se `vertical`). */
  comNome?: boolean;
  /** Símbolo acima do nome (telas de login e convite). */
  vertical?: boolean;
  /** Classes do nome (tamanho da fonte etc.). A cor segue o tema (text-foreground). */
  classeNome?: string;
  className?: string;
}

/**
 * Marca do Orbytum: anel (o "O" e a órbita) com um satélite e um vão no anel.
 * O símbolo é desenhado em SVG inline para usar a cor de marca e o nome é texto com a fonte
 * da marca (Space Grotesk), acompanhando o tema. Arquivos da marca: public/brand/.
 */
export function LogoOrbytum({
  tamanho = 32,
  comNome = false,
  vertical = false,
  classeNome = "text-lg",
  className = "",
}: LogoOrbytumProps) {
  // id único por instância: a máscara do vão não pode colidir com outra logo na mesma página
  const mascaraId = `orbytum-vao-${useId().replace(/:/g, "")}`;

  const simbolo = (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 64 64"
      aria-hidden={comNome ? true : undefined}
      role={comNome ? undefined : "img"}
      aria-label={comNome ? undefined : "Orbytum"}
      className="shrink-0"
    >
      <defs>
        <mask id={mascaraId}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="46.14" cy="17.86" r="10" fill="#000" />
        </mask>
      </defs>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#ff8c42" strokeWidth="7.5" mask={`url(#${mascaraId})`} />
      <circle cx="46.14" cy="17.86" r="5.5" fill="#ff8c42" />
    </svg>
  );

  if (!comNome) {
    return <span className={`inline-flex ${className}`}>{simbolo}</span>;
  }

  return (
    <span
      className={`inline-flex items-center ${vertical ? "flex-col gap-3" : "gap-2"} ${className}`}
      aria-label="Orbytum"
      role="img"
    >
      {simbolo}
      <span className={`font-marca font-semibold tracking-tight leading-none text-foreground ${classeNome}`}>
        orbytum
      </span>
    </span>
  );
}
