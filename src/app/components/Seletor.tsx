import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown } from "lucide-react";

/**
 * Substituto do <select> nativo, no tema do sistema. Aceita as mesmas props usadas no projeto
 * (value, onChange, className, disabled, required, name, id) e os mesmos filhos <option>,
 * então a troca é só o nome da tag. O onChange recebe um evento com `target.value`, como o nativo.
 */
export interface SeletorProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value" | "multiple"> {
  value?: string | number;
  onChange?: (evento: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
}

interface Opcao {
  valor: string;
  rotulo: React.ReactNode;
  texto: string;
  desabilitada: boolean;
}

const CLASSE_PADRAO =
  "px-4 py-2.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none focus:border-primary/60";

// Classes de largura/posicionamento vão para o contêiner; o resto estiliza o botão.
const CLASSE_DE_LARGURA = /^(?:[a-z0-9]+:)*(?:w-|min-w-|max-w-|flex-1|flex-auto|flex-none|grow|shrink|basis-|self-|col-span-|order-)/;

function textoDe(no: React.ReactNode): string {
  if (no == null || typeof no === "boolean") return "";
  if (typeof no === "string" || typeof no === "number") return String(no);
  if (Array.isArray(no)) return no.map(textoDe).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(no)) return textoDe(no.props.children);
  return "";
}

function extrairOpcoes(filhos: React.ReactNode): Opcao[] {
  const opcoes: Opcao[] = [];
  React.Children.forEach(filhos, (filho) => {
    if (!React.isValidElement<{ children?: React.ReactNode; value?: unknown; disabled?: boolean }>(filho)) return;
    if (filho.type === React.Fragment) {
      opcoes.push(...extrairOpcoes(filho.props.children));
      return;
    }
    if (filho.type === "option") {
      const texto = textoDe(filho.props.children).replace(/\s+/g, " ").trim();
      opcoes.push({
        valor: filho.props.value !== undefined ? String(filho.props.value) : texto,
        rotulo: filho.props.children,
        texto,
        desabilitada: !!filho.props.disabled,
      });
    }
  });
  return opcoes;
}

function eventoDeTroca(valor: string): React.ChangeEvent<HTMLSelectElement> {
  const alvo = { value: valor } as HTMLSelectElement;
  return { target: alvo, currentTarget: alvo } as unknown as React.ChangeEvent<HTMLSelectElement>;
}

export function Seletor({
  value,
  onChange,
  children,
  className,
  disabled,
  required,
  name,
  id,
  title,
  ...resto
}: SeletorProps) {
  const opcoes = useMemo(() => extrairOpcoes(children), [children]);
  const valorAtual = value !== undefined && value !== null ? String(value) : opcoes[0]?.valor ?? "";
  const indiceSelecionado = Math.max(0, opcoes.findIndex((o) => o.valor === valorAtual));
  const selecionada = opcoes[indiceSelecionado];

  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(indiceSelecionado);
  const baseId = useId();
  const selectOcultoRef = useRef<HTMLSelectElement>(null);

  const classes = (className ?? CLASSE_PADRAO).split(/\s+/).filter(Boolean);
  const classesLargura = classes.filter((c) => CLASSE_DE_LARGURA.test(c));
  const classesBotao = classes.filter((c) => !CLASSE_DE_LARGURA.test(c));

  // Ao abrir, a lista começa no item selecionado
  useEffect(() => {
    if (aberto) setDestaque(indiceSelecionado);
  }, [aberto, indiceSelecionado]);

  useEffect(() => {
    if (!aberto) return;
    document.getElementById(`${baseId}-op-${destaque}`)?.scrollIntoView({ block: "nearest" });
  }, [aberto, destaque, baseId]);

  // Escolher um valor limpa a marcação de campo obrigatório inválido (utils/ValidacaoFormulario)
  useEffect(() => {
    const select = selectOcultoRef.current;
    if (!select) return;
    select.setCustomValidity("");
    if (select.validity.valid) select.removeAttribute("data-invalido");
  }, [valorAtual]);

  const escolher = (indice: number) => {
    const opcao = opcoes[indice];
    if (!opcao || opcao.desabilitada) return;
    if (opcao.valor !== valorAtual) onChange?.(eventoDeTroca(opcao.valor));
    setAberto(false);
  };

  const mover = (de: number, passo: number) => {
    if (opcoes.length === 0) return de;
    let i = de;
    for (let n = 0; n < opcoes.length; n++) {
      i = (i + passo + opcoes.length) % opcoes.length;
      if (!opcoes[i].desabilitada) return i;
    }
    return de;
  };

  const aoTeclarNaLista = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setDestaque((d) => mover(d, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setDestaque((d) => mover(d, -1));
        break;
      case "Home":
        e.preventDefault();
        setDestaque(mover(-1, 1));
        break;
      case "End":
        e.preventDefault();
        setDestaque(mover(opcoes.length, -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        escolher(destaque);
        break;
      case "Tab":
        setAberto(false);
        break;
      default:
        // Digitar uma letra pula para o próximo item que começa com ela
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const letra = e.key.toLocaleLowerCase("pt-BR");
          for (let n = 1; n <= opcoes.length; n++) {
            const i = (destaque + n) % opcoes.length;
            if (!opcoes[i].desabilitada && opcoes[i].texto.toLocaleLowerCase("pt-BR").startsWith(letra)) {
              setDestaque(i);
              break;
            }
          }
        }
    }
  };

  const aoTeclarNoBotao = (e: React.KeyboardEvent) => {
    if (!aberto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setAberto(true);
    }
  };

  return (
    <span data-seletor className={`relative inline-flex align-middle ${classesLargura.join(" ")}`}>
      {(required || name) && (
        // Mantém o campo no formulário e na validação nativa (mensagem em português)
        <select
          ref={selectOcultoRef}
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          required={required}
          disabled={disabled}
          value={valorAtual}
          onChange={() => {}}
          className="absolute inset-x-0 bottom-0 h-px opacity-0 pointer-events-none"
        >
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      )}
      <Popover.Root open={aberto} onOpenChange={(v) => !disabled && setAberto(v)}>
        <Popover.Trigger asChild>
          <button
            {...(resto as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            type="button"
            id={id}
            title={title ?? selecionada?.texto}
            disabled={disabled}
            role="combobox"
            aria-expanded={aberto}
            aria-haspopup="listbox"
            aria-controls={`${baseId}-lista`}
            onKeyDown={aoTeclarNoBotao}
            className={`${classesBotao.join(" ")} w-full flex items-center justify-between gap-2 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="truncate">{selecionada?.rotulo ?? " "}</span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`}
            />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            collisionPadding={8}
            onKeyDown={aoTeclarNaLista}
            tabIndex={-1}
            className="z-[70] min-w-[var(--radix-popover-trigger-width)] max-w-[min(28rem,calc(100vw-1rem))] max-h-64 overflow-y-auto rounded-lg border border-border/40 bg-card p-1 shadow-2xl outline-none animate-in fade-in zoom-in-95 duration-100"
          >
            <ul id={`${baseId}-lista`} role="listbox" aria-activedescendant={`${baseId}-op-${destaque}`}>
              {opcoes.map((o, i) => {
                const ehSelecionada = i === indiceSelecionado;
                return (
                  <li
                    key={`${o.valor}-${i}`}
                    id={`${baseId}-op-${i}`}
                    role="option"
                    aria-selected={ehSelecionada}
                    aria-disabled={o.desabilitada}
                    onMouseEnter={() => !o.desabilitada && setDestaque(i)}
                    onClick={() => escolher(i)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm select-none ${
                      o.desabilitada
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${i === destaque && !o.desabilitada ? "bg-primary/10" : ""} ${
                      ehSelecionada ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{o.rotulo}</span>
                    {ehSelecionada && <Check className="w-4 h-4 shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </span>
  );
}
