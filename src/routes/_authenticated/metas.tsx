import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { CardsSkeleton, ErrorState } from "@/components/common/states";
import { Progress } from "@/components/ui/progress";
import { useMockData } from "@/hooks/use-mock-data";
import { desempenhoSemanal, metas } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas e desempenho — Residência Planner" },
      {
        name: "description",
        content: "Defina metas semanais de horas e questões e acompanhe a evolução do seu desempenho.",
      },
      { property: "og:title", content: "Metas e desempenho — Residência Planner" },
      { property: "og:description", content: "Metas semanais e evolução de horas e aproveitamento." },
    ],
  }),
  component: Metas,
});

function Metas() {
  const { data, loading, error, retry } = useMockData(metas, 600);
  const maxHoras = Math.max(...desempenhoSemanal.map((d) => d.horas), 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Metas e desempenho" description="Acompanhe seus objetivos da semana." />

      {loading && <CardsSkeleton count={4} />}
      {error && <ErrorState onRetry={retry} />}
      {data && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((meta) => {
            const pct = Math.min(100, Math.round((meta.atual / meta.alvo) * 100));
            return (
              <SectionCard key={meta.id} title={meta.titulo} description={`Alvo: ${meta.alvo} ${meta.unidade}`}>
                <div className="flex items-end justify-between gap-3">
                  <p className="font-display text-2xl font-bold">
                    {meta.atual}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">{meta.unidade}</span>
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      pct >= 100 ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <Progress value={pct} className="mt-3 h-2" />
              </SectionCard>
            );
          })}
        </div>
      )}

      <SectionCard title="Horas por dia" description="Últimos 7 dias">
        <div className="flex h-40 items-end gap-2">
          {desempenhoSemanal.map((d) => (
            <div key={d.dia} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-primary/80"
                style={{ height: `${Math.max(4, (d.horas / maxHoras) * 100)}%` }}
                aria-label={`${d.dia}: ${d.horas} horas`}
              />
              <span className="text-[11px] text-muted-foreground">{d.dia}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
