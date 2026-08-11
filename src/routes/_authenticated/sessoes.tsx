import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Plus, Timer, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createStudySession,
  deleteStudySession,
  listAreas,
  listStudySessions,
  queryKeys,
} from "@/lib/api";
import { formatDateTime, minutesToHours, startOfWeek } from "@/lib/format";
import type { Enums } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/sessoes")({
  head: () => ({
    meta: [
      { title: "Sessões de estudo — Residência Planner" },
      {
        name: "description",
        content: "Registre e acompanhe suas sessões de estudo, tempo líquido e tipo de atividade.",
      },
      { property: "og:title", content: "Sessões de estudo — Residência Planner" },
      {
        property: "og:description",
        content: "Histórico de sessões de estudo com tempo líquido por área.",
      },
    ],
  }),
  component: Sessoes,
});

const typeLabels: Record<Enums<"study_type">, string> = {
  teoria: "Teoria",
  questoes: "Questões",
  revisao: "Revisão",
  resumo: "Resumo",
  aula: "Aula",
  flashcards: "Flashcards",
  videoaula: "Videoaula",
  leitura: "Leitura",
  outro: "Outro",
};


function Sessoes() {
  const qc = useQueryClient();
  const areas = useQuery({ queryKey: queryKeys.areas, queryFn: listAreas });
  const sessions = useQuery({ queryKey: queryKeys.studySessions, queryFn: listStudySessions });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState("");
  const [minutes, setMinutes] = useState("60");
  const [type, setType] = useState<Enums<"study_type">>("teoria");

  const create = useMutation({
    mutationFn: () =>
      createStudySession({
        title: title || null,
        area_id: areaId || null,
        net_minutes: Number(minutes) || 0,
        study_type: type,
        status: "concluida",
        started_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.studySessions });
      setOpen(false);
      setTitle("");
      toast.success("Sessão registrada");
    },
    onError: (e: Error) => toast.error("Erro ao registrar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteStudySession(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.studySessions });
      toast.success("Sessão removida");
    },
    onError: (e: Error) => toast.error("Erro ao remover", { description: e.message }),
  });

  const data = sessions.data ?? [];
  const weekStart = startOfWeek();
  const weekMinutes = data
    .filter((s) => new Date(s.started_at) >= weekStart)
    .reduce((acc, s) => acc + s.net_minutes, 0);
  const totalMinutes = data.reduce((acc, s) => acc + s.net_minutes, 0);
  const areaName = (id: string | null) => areas.data?.find((a) => a.id === id)?.name ?? "Sem área";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessões de estudo"
        description="Registre o tempo líquido dedicado a cada área."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Nova sessão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="s-title">Título</Label>
                  <Input
                    id="s-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Arritmias — teoria"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área</Label>
                  <Select value={areaId} onValueChange={setAreaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      {(areas.data ?? []).map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="s-min">Minutos</Label>
                    <Input
                      id="s-min"
                      type="number"
                      min={1}
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={type} onValueChange={(v) => setType(v as Enums<"study_type">)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(typeLabels) as Array<Enums<"study_type">>).map((t) => (
                          <SelectItem key={t} value={t}>
                            {typeLabels[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
        <StatCard label="Semana" value={minutesToHours(weekMinutes)} icon={Clock} />
        <StatCard label="Total" value={minutesToHours(totalMinutes)} icon={Timer} tone="success" />
      </div>

      <SectionCard title="Histórico" description="Sessões mais recentes primeiro">
        {sessions.isLoading && <ListSkeleton rows={4} />}
        {sessions.isError && <ErrorState onRetry={() => void sessions.refetch()} />}
        {sessions.data && data.length === 0 && (
          <EmptyState
            icon={Timer}
            title="Nenhuma sessão registrada"
            description="Registre sua primeira sessão para acompanhar as horas estudadas."
          />
        )}
        {data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {s.title ?? typeLabels[s.study_type]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {areaName(s.area_id)} · {typeLabels[s.study_type]} ·{" "}
                    {formatDateTime(s.started_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">{minutesToHours(s.net_minutes)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover sessão"
                    className="h-8 w-8 rounded-lg text-muted-foreground"
                    onClick={() => remove.mutate(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
