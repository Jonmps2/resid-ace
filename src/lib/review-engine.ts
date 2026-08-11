/**
 * Motor de revisão espaçada.
 *
 * Três modos:
 *  - `fixo`: usa a lista de intervalos (1, 7, 14, 30, 60 por padrão).
 *  - `desempenho`: usa faixas de aproveitamento (<60% → 4d, 60–79% → 7d, ≥80% → 14d).
 *  - `hibrida`: usa os intervalos fixos, mas antecipa quando o desempenho fica abaixo do esperado.
 *
 * Todas as datas são tratadas como datas puras (YYYY-MM-DD) no fuso America/Sao_Paulo.
 */

import type { ReviewRule } from "@/lib/api";

export const DEFAULT_INTERVALS = [1, 7, 14, 30, 60];

export interface PerformanceBand {
  /** Aplica-se quando o aproveitamento é menor que este valor (exclusivo). */
  upTo: number;
  /** Dias até a próxima revisão. */
  days: number;
}

export const DEFAULT_BANDS: PerformanceBand[] = [
  { upTo: 60, days: 4 },
  { upTo: 80, days: 7 },
  { upTo: 101, days: 14 },
];

export type ReviewMode = "fixo" | "desempenho" | "hibrida";

export interface RuleConfig {
  mode: ReviewMode;
  intervals: number[];
  bands: PerformanceBand[];
}

export function parseRule(rule: ReviewRule | null | undefined): RuleConfig {
  const intervals =
    rule?.intervals && rule.intervals.length > 0 ? rule.intervals.map(Number) : DEFAULT_INTERVALS;
  const raw = rule?.performance_bands;
  const bands = normalizeBands(raw);
  return {
    mode: (rule?.mode as ReviewMode | undefined) ?? "fixo",
    intervals,
    bands,
  };
}

export function normalizeBands(raw: unknown): PerformanceBand[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_BANDS;
  const parsed = raw
    .map((b) => {
      const o = b as Record<string, unknown>;
      const upTo = Number(o["upTo"]);
      const days = Number(o["days"]);
      return Number.isFinite(upTo) && Number.isFinite(days) ? { upTo, days } : null;
    })
    .filter((b): b is PerformanceBand => b !== null)
    .sort((a, b) => a.upTo - b.upTo);
  return parsed.length > 0 ? parsed : DEFAULT_BANDS;
}

/** Dias correspondentes ao aproveitamento informado. */
export function bandDays(bands: PerformanceBand[], accuracy: number): number {
  const sorted = [...bands].sort((a, b) => a.upTo - b.upTo);
  for (const band of sorted) {
    if (accuracy < band.upTo) return band.days;
  }
  return sorted[sorted.length - 1]?.days ?? 14;
}

/** Intervalo fixo para a próxima revisão (reviewNumber = revisão que acabou de ser feita). */
export function fixedDays(intervals: number[], reviewNumber: number): number {
  const list = intervals.length > 0 ? intervals : DEFAULT_INTERVALS;
  const idx = Math.min(Math.max(reviewNumber, 1) - 1, list.length - 1);
  return list[idx] ?? list[list.length - 1] ?? 7;
}

/**
 * Quantos dias até a próxima revisão.
 * @param reviewNumber número da revisão concluída (1 = primeira).
 * @param accuracy aproveitamento em % (0–100) ou null quando não houve questões.
 */
export function nextIntervalDays(
  rule: RuleConfig,
  reviewNumber: number,
  accuracy: number | null,
): number {
  const fixed = fixedDays(rule.intervals, reviewNumber);
  if (rule.mode === "fixo") return fixed;
  if (rule.mode === "desempenho") {
    return accuracy === null ? fixed : bandDays(rule.bands, accuracy);
  }
  // híbrida: antecipa quando o desempenho pede um intervalo menor
  if (accuracy === null) return fixed;
  return Math.min(fixed, bandDays(rule.bands, accuracy));
}
