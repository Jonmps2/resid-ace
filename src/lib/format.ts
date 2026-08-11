/** Utilitários de formatação usados nas telas. */

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isSameDay(value: string, day = new Date()): boolean {
  const d = new Date(value);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

export function startOfWeek(base = new Date()): Date {
  const d = new Date(base);
  const diff = (d.getDay() + 6) % 7; // segunda-feira
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

/* ---------- datas no fuso America/Sao_Paulo ---------- */

export const APP_TIMEZONE = "America/Sao_Paulo";

/** Data de hoje (YYYY-MM-DD) no fuso do app. */
export function todaySP(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Soma dias a uma data pura YYYY-MM-DD sem sofrer efeitos de fuso. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Diferença em dias entre duas datas puras (b - a). */
export function daysBetweenISO(a: string, b: string): number {
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  };
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

/** Dias de atraso de uma data agendada (0 quando não está atrasada). */
export function daysLate(scheduledFor: string): number {
  return Math.max(0, daysBetweenISO(scheduledFor, todaySP()));
}

/** Formata uma data pura YYYY-MM-DD sem deslocamento de fuso. */
export function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Início do dia (ISO completo) para uma data pura, no fuso do app. */
export function startOfDayISO(iso: string): string {
  return `${iso}T00:00:00-03:00`;
}

/** Fim do dia (ISO completo) para uma data pura, no fuso do app. */
export function endOfDayISO(iso: string): string {
  return `${iso}T23:59:59-03:00`;
}

/**
 * Aproveitamento = acertos / (total - anuladas) × 100.
 * Retorna null quando não há questões válidas (evita divisão por zero).
 */
export function accuracyOf(
  total: number,
  correct: number,
  voided = 0,
): number | null {
  const valid = total - voided;
  if (valid <= 0) return null;
  return Math.round((correct / valid) * 1000) / 10;
}

export function formatAccuracy(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1).replace(".", ",")}%`;
}

