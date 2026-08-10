import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, ListChecks, Percent, RotateCcw, Target } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge, type StatusMeta } from "@/components/common/status-badge";
import { CardsSkeleton, EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  listGoals,
  listPlannerEvents,
  listQuestionSessions,
  listReviews,
  listStudySessions,
  getProfile,
  queryKeys,
} from "@/lib/api";
import { formatTime, isSameDay, minutesToHours, percent, startOfWeek, todayISO } from "@/lib/format";

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
        content:
          "Painel de estudos para provas de residência médica: horas, questões, revisões e metas.",
      },
    ],
  }),
  component: VisaoGeral,
});

function VisaoGeral() {
  const profile = useQuery({ queryKey: queryKeys.profile, queryFn: getProfile });
  const sessions = useQuery({ queryKey: queryKeys.studySessions, queryFn: listStudySessions });
  const questions = useQuery({
    queryKey: queryKeys.questionSessions,
    queryFn: listQuestionSessions,
  });
  const reviews = useQuery({ queryKey: queryKeys.reviews, queryFn: listReviews });
  const events = useQuery({ queryKey: queryKeys.plannerEvents, queryFn: listPlannerEvents });
  const goals = useQuery({ queryKey: queryKeys.goals, queryFn: listGoals });

  const loading =
    sessions.isLoading || questions.isLoading || reviews.isLoading || goals.isLoading;
  const failed = sessions.isError || questions.isError || reviews.isError || goals.isError;

  const weekStart = startOfWeek();
  const weekSessions = (sessions.data ?? []).filter((s) => new Date(s.started_at) >= weekStart);
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.net_minutes, 0);
  const weekQuestions = (questions.data ?? []).filter(
    (q) => new Date(q.performed_at) >= weekStart,
  );
  const totalQuestions = weekQuestions.reduce((acc, q) => acc + q.total_questions, 0);
  const totalCorrect = weekQuestions.reduce((acc, q) => acc + q.correct_count, 0);
  const today = todayISO();
  const pending = (reviews.data ?? []).filter((r) => r.status === "pendente");
  const late = pending.filter((r) => r.scheduled_for < today);
  const goalsProgress = goals.data?.length
    ? Math.round(
        goals.data.reduce(
          (acc, g) => acc + percent(Number(g.current_value), Number(g.target_value)),
          0,
        ) / goals.data.length,
      )
    : 0;

  const hoursGoal = profile.data?.weekly_hours_goal ?? 0;

  const todayEvents = (events.data ?? []).filter((e) => isSameDay(e.starts_at));
  const todayReviews = (reviews.data ?? []).filter(
    (r) => r.scheduled_for === today && r.status !== "cancelada",
  );

  type Item = { id: string; time: string; title: string; detail: string; status: StatusMeta };
  const todayItems: Item[] = [
    ...todayEvents.map((e) => ({
      id: e.id,
      time: formatTime(e.starts_at),
      title: e.title,
      detail: e.event_type === "revisao" ? "Revisão" : "Estudo",
      status: (e.status === "concluido" ? "concluido" : "pendente") as StatusMeta,
    })),
    ...todayReviews.map((r) => ({
      id: r.id,
      time: "—",
      title: r.title ?? "Revisão",
      detail: "Revisão agendada",
      status: (r.status === "concluida"
        ? "concluido"
        : r.status === "atrasada"
          ? "atrasado"
          : "pendente") as StatusMeta,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description="Seu panorama de estudos de hoje e da semana."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/sessoes">Registrar sessão</Link>
          </Button>
        }
      />

      {loading && <CardsSkeleton count={5} />}
      {!loading && failed && (
        <ErrorState
          onRetry={() => {
            void sessions.refetch();
            void questions.refetch();
            void reviews.refetch();
            void goals.refetch();
          }}
        />
      )}
      {!loading && !failed && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label="Horas estudadas"
            value={minutesToHours(weekMinutes)}
            hint={hoursGoal ? `Meta semanal: ${hoursGoal}h` : "Nesta semana"}
            icon={Clock}
          />
          <StatCard
            label="Questões"
            value={String(totalQuestions)}
            hint="Nesta semana"
            icon={ListChecks}
          />
          <StatCard
            label="Acertos"
            value={`${percent(totalCorrect, totalQuestions)}%`}
            hint="Aproveitamento da semana"
            icon={Percent}
            tone="success"
          />
          <StatCard
            label="Revisões pendentes"
            value={String(pending.length)}
            hint={late.length ? `${late.length} atrasada(s)` : "Em dia"}
            icon={RotateCcw}
            tone={late.length ? "danger" : "warning"}
          />
          <StatCard
            label="Progresso das metas"
            value={`${goalsProgress}%`}
            hint={goals.data?.length ? "Média das metas ativas" : "Sem metas ainda"}
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
          {(events.isLoading || reviews.isLoading) && <ListSkeleton rows={3} />}
          {(events.isError || reviews.isError) && (
            <ErrorState
              onRetry={() => {
                void events.refetch();
                void reviews.refetch();
              }}
            />
          )}
          {!events.isLoading && !events.isError && todayItems.length === 0 && (
            <EmptyState
              icon={CalendarCheck}
              title="Nada planejado para hoje"
              description="Adicione blocos de estudo no Planner para organizar o seu dia."
              action={
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link to="/planner">Abrir Planner</Link>
                </Button>
              }
            />
          )}
          {todayItems.length > 0 && (
            <ul className="divide-y divide-border">
              {todayItems.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-[11px] font-semibold text-muted-foreground">
                      {item.time}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Metas" description="Progresso acumulado">
          {goals.isLoading && <ListSkeleton rows={3} />}
          {goals.isError && <ErrorState onRetry={() => void goals.refetch()} />}
          {goals.data && goals.data.length === 0 && (
            <EmptyState
              icon={Target}
              title="Nenhuma meta definida"
              description="Crie metas semanais de horas e questões."
              action={
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link to="/metas">Criar meta</Link>
                </Button>
              }
            />
          )}
          {goals.data && goals.data.length > 0 && (
            <div className="space-y-4">
              {goals.data.slice(0, 4).map((goal) => (
                <div key={goal.id}>
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate font-medium">
                      {goal.title ?? `Meta de ${goal.metric}`}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {Number(goal.current_value)}/{Number(goal.target_value)}
                    </span>
                  </div>
                  <Progress
                    value={percent(Number(goal.current_value), Number(goal.target_value))}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
