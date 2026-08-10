import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPlannerEvent,
  deletePlannerEvent,
  listPlannerEvents,
  queryKeys,
  updatePlannerEvent,
} from "@/lib/api";
import { formatTime, startOfWeek } from "@/lib/format";
import type { Enums } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Planner — Residência Planner" },
      {
        name: "description",
        content: "Planeje sua semana de estudos em blocos e acompanhe o que já foi concluído.",
      },
      { property: "og:title", content: "Planner — Residência Planner" },
      { property: "og:description", content: "Agenda semanal de blocos de estudo e revisões." },
    ],
  }),
  component: Planner,
});

const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const typeLabels: Record<Enums<"event_type">, string> = {
  estudo: "Estudo",
  revisao: "Revisão",
  simulado: "Simulado",
  descanso: "Descanso",
  outro: "Outro",
};

function Planner() {
  const qc = useQueryClient();
  const events = useQuery({ queryKey: queryKeys.plannerEvents, queryFn: listPlannerEvents });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0, 16));
  const [type, setType] = useState<Enums<"event_type">>("estudo");

  const invalidate = () => void qc.invalidateQueries({ queryKey: queryKeys.plannerEvents });

  const create = useMutation({
    mutationFn: () =>
      createPlannerEvent({
        title,
        event_type: type,
        starts_at: new Date(when).toISOString(),
        status: "planejado",
      }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setTitle("");
      toast.success("Bloco adicionado ao planner");
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Enums<"event_status"> }) =>
      updatePlannerEvent(id, { status }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error("Erro ao atualizar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePlannerEvent(id),
    onSuccess: () => {
      invalidate();
      toast.success("Bloco removido");
    },
    onError: (e: Error) => toast.error("Erro ao remover", { description: e.message }),
  });

  const start = startOfWeek();
  const days = weekDays.map((label, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const list = (events.data ?? []).filter((e) => {
      const d = new Date(e.starts_at);
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      );
    });
    return { label, day, list };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planner"
        description="Sua semana organizada em blocos de estudo."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Bloco
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Novo bloco</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-title">Título</Label>
                  <Input
                    id="p-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Cardiologia — teoria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-when">Data e hora</Label>
                  <Input
                    id="p-when"
                    type="datetime-local"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v as Enums<"event_type">)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(typeLabels) as Array<Enums<"event_type">>).map((t) => (
                        <SelectItem key={t} value={t}>
                          {typeLabels[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="rounded-xl"
                  disabled={!title.trim() || create.isPending}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {events.isLoading && <ListSkeleton rows={5} />}
      {events.isError && <ErrorState onRetry={() => void events.refetch()} />}

      {events.data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map(({ label, day, list }) => (
            <SectionCard
              key={label}
              title={label}
              description={day.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            >
              {list.length === 0 ? (
                <EmptyState icon={CalendarDays} title="Dia livre" />
              ) : (
                <ul className="space-y-2">
                  {list.map((e) => (
                    <li
                      key={e.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted/60 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatTime(e.starts_at)} · {typeLabels[e.event_type]}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-xs"
                          onClick={() =>
                            toggle.mutate({
                              id: e.id,
                              status: e.status === "concluido" ? "planejado" : "concluido",
                            })
                          }
                        >
                          {e.status === "concluido" ? "Concluído" : "Concluir"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-xs text-muted-foreground"
                          onClick={() => remove.mutate(e.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
