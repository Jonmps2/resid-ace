import { createFileRoute } from "@tanstack/react-router";
import { Clock, ListChecks, Percent, RotateCcw, Target, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { CardsSkeleton, EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMockData } from "@/hooks/use-mock-data";
import { itensHoje, metas, resumoGeral } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Visão geral — Residência Planner" },
      {
        name: "description",
        content:
          "Acompanhe horas estudadas, questões, acertos, revisões pendentes e metas da sua preparação para a residência médica.",
      },
      { property: "og:title", content: "Visão geral — Residência Planner" },
      {
        property: "og:description",
        content: "Painel de estudos para provas de residência médica: horas, questões, revisões e metas.",
      },
    ],
  }),
  component: VisaoGeral,
});

function VisaoGeral() {
  const resumo = useMockData(resumoGeral, 500);
  const hoje = useMockData(itensHoje, 800);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description="Seu panorama de estudos de hoje e da semana."
        action={
          <Button className="rounded-xl" onClick={() => toast.success("Sessão iniciada", { description: "Bom estudo!" })}>
            Iniciar sessão
          </Button>
        }
      />

      {resumo.loading && <CardsSkeleton count={5} />}
      {resumo.error && <ErrorState onRetry={resumo.retry} />}
      {resumo.data && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label="Horas estudadas"
            value={`${resumo.data.horasEstudadas}h`}
            hint={`Meta semanal: ${resumo.data.horasMeta}h`}
            icon={Clock}
          />
          <StatCard
            label="Questões"
            value={String(resumo.data.questoesRealizadas)}
            hint="Nos últimos 7 dias"
            icon={ListChecks}
            tone="primary"
          />
          <StatCard
            label="Acertos"
            value={`${resumo.data.percentualAcertos}%`}
            hint="Aproveitamento geral"
            icon={Percent}
            tone="success"
          />
          <StatCard
            label="Revisões pendentes"
            value={String(resumo.data.revisoesPendentes)}
            hint="2 atrasadas"
            icon={RotateCcw}
            tone="warning"
          />
          <StatCard
            label="Progresso das metas"
            value={`${resumo.data.progressoMetas}%`}
            hint="Semana atual"
            icon={Target}
            tone="success"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Hoje"
          description="Estudos e revisões planejados"
          className="lg:col-span-2"
        >
          {hoje.loading && <ListSkeleton rows={3} />}
          {hoje.error && <ErrorState onRetry={hoje.retry} />}
          {hoje.data && hoje.data.length === 0 && (
            <EmptyState
              icon={CalendarCheck}
              title="Nada planejado para hoje"
              description="Adicione blocos de estudo no Planner para organizar o seu dia."
            />
          )}
          {hoje.data && hoje.data.length > 0 && (
            <ul className="divide-y divide-border">
              {hoje.data.map((item) => (
                <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                      {item.horario.slice(0, 2)}h
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.titulo}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.tipo === "revisao" ? "Revisão" : "Estudo"} · {item.detalhe}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Metas da semana" description="Progresso acumulado">
          <div className="space-y-4">
            {metas.slice(0, 3).map((meta) => {
              const pct = Math.min(100, Math.round((meta.atual / meta.alvo) * 100));
              return (
                <div key={meta.id}>
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate font-medium">{meta.titulo}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {meta.atual}/{meta.alvo}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
