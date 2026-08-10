import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/hooks/use-mock-data";
import { revisoes } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/revisoes")({
  head: () => ({
    meta: [
      { title: "Revisões — Residência Planner" },
      {
        name: "description",
        content: "Visualize revisões previstas, pendentes e atrasadas para manter o conteúdo sempre fresco.",
      },
      { property: "og:title", content: "Revisões — Residência Planner" },
      { property: "og:description", content: "Revisões previstas, pendentes e atrasadas em um só lugar." },
    ],
  }),
  component: Revisoes,
});

function Revisoes() {
  const { data, loading, error, retry } = useMockData(revisoes, 700);

  return (
    <div>
      <PageHeader
        title="Revisões"
        description="Acompanhe o que precisa ser revisado e o que está atrasado."
      />

      <SectionCard
        title="Fila de revisões"
        description="Regras de espaçamento serão configuráveis em breve"
        action={
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => toast.success("Revisão marcada como concluída")}
          >
            Concluir próxima
          </Button>
        }
      >
        {loading && <ListSkeleton rows={4} />}
        {error && <ErrorState onRetry={retry} />}
        {data && data.length === 0 && (
          <EmptyState
            icon={RotateCcw}
            title="Sem revisões na fila"
            description="Assim que você registrar estudos, as revisões aparecerão aqui."
          />
        )}
        {data && data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((r) => (
              <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.conteudo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.intervalo} · prevista para {r.prevista}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
