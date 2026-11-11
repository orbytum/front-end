import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateInputProps {
  /** "date": yyyy-MM-dd | "datetime-local": yyyy-MM-ddTHH:mm (mesmo formato dos inputs nativos) */
  type?: "date" | "datetime-local";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/** ISO -> exibição (dd/MM/yyyy ou dd/MM/yyyy HH:mm) */
function paraExibicao(iso: string, comHora: boolean): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return "";
  const data = `${m[3]}/${m[2]}/${m[1]}`;
  return comHora && m[4] ? `${data} ${m[4]}:${m[5]}` : data;
}

/** Aplica a máscara a partir dos dígitos digitados. */
function mascarar(texto: string, comHora: boolean): string {
  const d = texto.replace(/\D/g, "").slice(0, comHora ? 12 : 8);
  let r = d.slice(0, 2);
  if (d.length > 2) r += "/" + d.slice(2, 4);
  if (d.length > 4) r += "/" + d.slice(4, 8);
  if (comHora && d.length > 8) r += " " + d.slice(8, 10);
  if (comHora && d.length > 10) r += ":" + d.slice(10, 12);
  return r;
}

/** Texto mascarado completo e válido -> ISO; caso contrário, "". */
function paraIso(texto: string, comHora: boolean): string {
  const m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}))?$/);
  if (!m || (comHora && !m[4])) return "";
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const hora = Number(m[4] ?? 0);
  const min = Number(m[5] ?? 0);
  const d = new Date(ano, mes - 1, dia);
  const valida =
    d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia &&
    hora < 24 && min < 60;
  if (!valida) return "";
  const data = `${m[3]}-${m[2]}-${m[1]}`;
  return comHora ? `${data}T${m[4]}:${m[5]}` : data;
}

export function DateInput({
  type = "date",
  value,
  onChange,
  disabled,
  required,
  className,
}: DateInputProps) {
  const comHora = type === "datetime-local";
  const [texto, setTexto] = useState(() => paraExibicao(value, comHora));

  // Sincroniza quando o valor muda por fora (ex.: abrir edição, limpar formulário)
  useEffect(() => {
    if (value !== paraIso(texto, comHora)) {
      setTexto(paraExibicao(value, comHora));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, comHora]);

  const [aberto, setAberto] = useState(false);

  const isoAtual = paraIso(texto, comHora);
  const dataSelecionada = isoAtual
    ? new Date(Number(isoAtual.slice(0, 4)), Number(isoAtual.slice(5, 7)) - 1, Number(isoAtual.slice(8, 10)))
    : undefined;
  const horaAtual = comHora && isoAtual ? isoAtual.slice(11, 16) : "09:00";

  const aplicar = (iso: string) => {
    setTexto(paraExibicao(iso, comHora));
    onChange(iso);
  };

  const selecionarDia = (dia?: Date) => {
    if (!dia) return;
    const pad = (n: number) => String(n).padStart(2, "0");
    const data = `${dia.getFullYear()}-${pad(dia.getMonth() + 1)}-${pad(dia.getDate())}`;
    aplicar(comHora ? `${data}T${horaAtual}` : data);
    if (!comHora) setAberto(false);
  };

  const alterarHora = (hora: string) => {
    if (!hora) return;
    const base = isoAtual ? isoAtual.slice(0, 10) : null;
    if (base) aplicar(`${base}T${hora}`);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        placeholder={comHora ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
        maxLength={comHora ? 16 : 10}
        value={texto}
        disabled={disabled}
        required={required}
        className={`${className ?? ""} pr-10`}
        onChange={(e) => {
          const mascarado = mascarar(e.target.value, comHora);
          setTexto(mascarado);
          onChange(paraIso(mascarado, comHora));
        }}
      />
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            title="Abrir calendário"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/30 disabled:opacity-50"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-auto p-0 z-[60]">
          <Calendar
            mode="single"
            locale={ptBR}
            fixedWeeks
            selected={dataSelecionada}
            defaultMonth={dataSelecionada}
            onSelect={selecionarDia}
            initialFocus
          />
          {comHora && (
            <div className="flex items-center gap-2 border-t border-border/40 px-4 py-3">
              <span className="text-xs text-muted-foreground">Horário</span>
              <input
                type="time"
                value={horaAtual}
                disabled={!isoAtual}
                onChange={(e) => alterarHora(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-background rounded-lg border border-border/40 text-foreground text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="px-3 py-1.5 rounded-lg bg-[#ff8c42] text-white text-xs font-medium"
              >
                OK
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
