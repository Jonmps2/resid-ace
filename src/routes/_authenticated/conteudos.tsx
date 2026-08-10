import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMockData } from "@/hooks/use-mock-data";
import { conteudos } from "@/lib/mock-data";

export const Route = createFileRoute("/conteudos")({
  head: () => ({
    meta: [
      { title: "Conteúdos — Residência Planner" },
      {
        name: "description",
        content: "Organize as grandes áreas e tópicos do edital e acompanhe o progresso de cada conteúdo.",
      },
      { property: "og:title", content: "Conteúdos — Residência Planner" },
      { property: "og:description", content: "Acompanhe o progresso por área e tópico do edital." },
    ],
  }),
  component: Conteudos,
});

function Conteudos() {
  const { data, loading, error, retry } = useMockData(conteudos, 700);

  return (
    <div>
      <PageHeader
        title="Conteúdos"
        description="Áreas e tópicos do edital com progresso individual."
        action={
          <Button className="rounded-xl" onClick={() => toast.info("Em breve", { description: "Cadastro de conteúdos." })}>
            Novo conteúdo
          </Button>
        }
      />

      {loading && <ListSkeleton rows={5} />}
      {error && <ErrorState onRetry={retry} />}
      {data && data.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Nenhum conteúdo cadastrado"
          description="Cadastre as áreas do edital para começar a acompanhar seu progresso."
        />
      )}
      {data && data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id} className="gap-0 rounded-2xl p-4 shadow-soft">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">{c.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.area}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {c.progresso}%
                </span>
              </div>
              <Progress value={c.progresso} className="mt-4 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {c.topicosConcluidos} de {c.topicos} tópicos concluídos
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
