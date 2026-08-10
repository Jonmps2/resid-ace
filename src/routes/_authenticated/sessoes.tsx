import { createFileRoute } from "@tanstack/react-router";
import { Timer } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/hooks/use-mock-data";
import { sessoes } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/sessoes")({
  head: () => ({
    meta: [
      { title: "Sessões de estudo — Residência Planner" },
      {
        name: "description",
        content: "Registre e acompanhe suas sessões de estudo, com tempo dedicado e tipo de atividade.",
      },
      { property: "og:title", content: "Sessões de estudo — Residência Planner" },
      { property: "og:description", content: "Histórico de sessões com duração e tipo de atividade." },
    ],
  }),
  component: Sessoes,
});

function Sessoes() {
  const { data, loading, error, retry } = useMockData(sessoes, 700);

  return (
    <div>
      <PageHeader
        title="Sessões de estudo"
        description="Histórico de tempo dedicado a cada conteúdo."
        action={
          <Button className="rounded-xl" onClick={() => toast.success("Sessão registrada")}>
            Registrar sessão
          </Button>
        }
      />

      <SectionCard title="Últimas sessões" description="Ordenadas por data">
        {loading && <ListSkeleton rows={4} />}
        {error && <ErrorState onRetry={retry} />}
        {data && data.length === 0 && (
          <EmptyState
            icon={Timer}
            title="Nenhuma sessão registrada"
            description="Inicie um cronômetro ou registre manualmente o tempo estudado."
          />
        )}
        {data && data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((s) => (
              <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.conteudo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.data} · {s.tipo}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {s.duracaoMin} min
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
