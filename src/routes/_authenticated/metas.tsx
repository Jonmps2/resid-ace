import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createGoal,
  deleteGoal,
  listGoals,
  listQuestionSessions,
  listStudySessions,
  queryKeys,
} from "@/lib/api";
import { minutesToHours, percent, startOfWeek, todayISO } from "@/lib/format";
import type { Enums } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas e desempenho — Residência Planner" },
      {
        name: "description",
        content: "Defina metas de horas, questões e revisões e acompanhe seu desempenho semanal.",
      },
      { property: "og:title", content: "Metas e desempenho — Residência Planner" },
      { property: "og:description", content: "Metas de estudo e indicadores de desempenho." },
    ],
  }),
  component: Metas,
});

const metricLabels: Record<Enums<"goal_metric">, string> = {
  horas: "Horas",
  questoes: "Questões",
  topicos: "Tópicos",
  revisoes: "Revisões",
  acertos: "Acertos",
};

const periodLabels: Record<Enums<"goal_period">, string> = {
  diario: "Diária",
  semanal: "Semanal",
  mensal: "Mensal",
};

function Metas() {
  const qc = useQueryClient();
  const goals = useQuery({ queryKey: queryKeys.goals, queryFn: listGoals });
  const sessions = useQuery({ queryKey: queryKeys.studySessions, queryFn: listStudySessions });
  const questions = useQuery({
    queryKey: queryKeys.questionSessions,
    queryFn: listQuestionSessions,
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState<Enums<"goal_metric">>("horas");
  const [period, setPeriod] = useState<Enums<"goal_period">>("semanal");
  const [target, setTarget] = useState("20");

  const create = useMutation({
    mutationFn: () =>
      createGoal({
        title: title || null,
        metric,
        period,
        target_value: Number(target) || 0,
        starts_on: todayISO(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals });
      setOpen(false);
      setTitle("");
      toast.success("Meta criada");
    },
    onError: (e: Error) => toast.error("Erro ao criar meta", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals });
      toast.success("Meta removida");
    },
    onError: (e: Error) => toast.error("Erro ao remover", { description: e.message }),
  });

  const weekStart = startOfWeek();
  const weekMinutes = (sessions.data ?? [])
    .filter((s) => new Date(s.started_at) >= weekStart)
    .reduce((acc, s) => acc + s.net_minutes, 0);
  const weekQuestions = (questions.data ?? []).filter(
    (q) => new Date(q.performed_at) >= weekStart,
  );
  const totalQ = weekQuestions.reduce((acc, q) => acc + q.total_questions, 0);
  const correctQ = weekQuestions.reduce((acc, q) => acc + q.correct_count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas e desempenho"
        description="Acompanhe o que você planejou e o que já entregou."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Nova meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="g-title">Título</Label>
                  <Input
                    id="g-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: 20h de estudo por semana"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Métrica</Label>
                    <Select
                      value={metric}
                      onValueChange={(v) => setMetric(v as Enums<"goal_metric">)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(metricLabels) as Array<Enums<"goal_metric">>).map((m) => (
                          <SelectItem key={m} value={m}>
                            {metricLabels[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select
                      value={period}
                      onValueChange={(v) => setPeriod(v as Enums<"goal_period">)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(periodLabels) as Array<Enums<"goal_period">>).map((p) => (
                          <SelectItem key={p} value={p}>
                            {periodLabels[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g-target">Alvo</Label>
                  <Input
                    id="g-target"
                    type="number"
                    min={1}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="rounded-xl"
                  disabled={create.isPending}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Horas na semana" value={minutesToHours(weekMinutes)} icon={Target} />
        <StatCard label="Questões na semana" value={String(totalQ)} icon={Target} />
        <StatCard
          label="Acertos"
          value={`${percent(correctQ, totalQ)}%`}
          icon={Target}
          tone="success"
        />
      </div>

      <SectionCard title="Suas metas" description="Progresso registrado em cada meta">
        {goals.isLoading && <ListSkeleton rows={3} />}
        {goals.isError && <ErrorState onRetry={() => void goals.refetch()} />}
        {goals.data && goals.data.length === 0 && (
          <EmptyState
            icon={Target}
            title="Nenhuma meta criada"
            description="Defina metas semanais para manter a constância."
          />
        )}
        {goals.data && goals.data.length > 0 && (
          <ul className="space-y-4">
            {goals.data.map((g) => (
              <li key={g.id}>
                <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {g.title ?? `Meta de ${metricLabels[g.metric]}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {periodLabels[g.period]} · {Number(g.current_value)}/
                      {Number(g.target_value)} {metricLabels[g.metric].toLowerCase()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover meta"
                    className="h-8 w-8 rounded-lg text-muted-foreground"
                    onClick={() => remove.mutate(g.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Progress
                  value={percent(Number(g.current_value), Number(g.target_value))}
                  className="h-2"
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
