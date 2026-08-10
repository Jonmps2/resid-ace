import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/hooks/use-mock-data";
import { questoes } from "@/lib/mock-data";

export const Route = createFileRoute("/questoes")({
  head: () => ({
    meta: [
      { title: "Questões — Residência Planner" },
      {
        name: "description",
        content: "Acompanhe blocos de questões por banca e área, com total resolvido e aproveitamento.",
      },
      { property: "og:title", content: "Questões — Residência Planner" },
      { property: "og:description", content: "Blocos de questões por banca e área com aproveitamento." },
    ],
  }),
  component: Questoes,
});

function Questoes() {
  const { data, loading, error, retry } = useMockData(questoes, 700);

  return (
    <div>
      <PageHeader
        title="Questões"
        description="Blocos resolvidos por banca e área."
        action={
          <Button className="rounded-xl" onClick={() => toast.success("Bloco de questões registrado")}>
            Registrar bloco
          </Button>
        }
      />

      <SectionCard title="Últimos blocos" description="Aproveitamento por registro">
        {loading && <ListSkeleton rows={4} />}
        {error && <ErrorState onRetry={retry} />}
        {data && data.length === 0 && (
          <EmptyState
            icon={ListChecks}
            title="Nenhum bloco registrado"
            description="Registre suas resoluções para acompanhar o aproveitamento por área."
          />
        )}
        {data && data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((q) => {
              const pct = Math.round((q.acertos / q.total) * 100);
              const tone =
                pct >= 75
                  ? "bg-success-soft text-success"
                  : pct >= 60
                    ? "bg-warning-soft text-warning-foreground"
                    : "bg-danger-soft text-destructive";
              return (
                <li key={q.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {q.banca} · {q.area}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {q.data} · {q.acertos}/{q.total} acertos
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
