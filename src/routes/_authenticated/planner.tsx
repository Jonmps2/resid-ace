import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockData } from "@/hooks/use-mock-data";
import { planner } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Planner — Residência Planner" },
      {
        name: "description",
        content: "Monte sua semana de estudos com blocos de teoria, questões e revisões.",
      },
      { property: "og:title", content: "Planner — Residência Planner" },
      { property: "og:description", content: "Semana de estudos organizada em blocos por dia." },
    ],
  }),
  component: Planner,
});

function Planner() {
  const { data, loading, error, retry } = useMockData(planner, 700);

  return (
    <div>
      <PageHeader
        title="Planner"
        description="Sua semana de estudos organizada por blocos."
        action={
          <Button className="rounded-xl" onClick={() => toast.info("Em breve", { description: "Criação de blocos." })}>
            Novo bloco
          </Button>
        }
      />

      {loading && <ListSkeleton rows={4} />}
      {error && <ErrorState onRetry={retry} />}
      {data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((dia) => (
            <Card key={dia.dia} className="gap-0 rounded-2xl p-4 shadow-soft">
              <p className="font-display text-sm font-semibold">{dia.dia}</p>
              {dia.blocos.length === 0 ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  Dia livre
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {dia.blocos.map((b) => (
                    <li
                      key={b.hora + b.titulo}
                      className={`rounded-xl px-3 py-2 text-xs ${
                        b.tipo === "revisao"
                          ? "bg-warning-soft text-warning-foreground"
                          : "bg-primary-soft text-secondary-foreground"
                      }`}
                    >
                      <span className="block font-semibold">{b.hora}</span>
                      <span className="block truncate">{b.titulo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
