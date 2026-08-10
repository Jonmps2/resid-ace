import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge, type StatusMeta } from "@/components/common/status-badge";
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
import { createReview, deleteReview, listReviews, queryKeys, updateReview } from "@/lib/api";
import { formatDate, todayISO } from "@/lib/format";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/revisoes")({
  head: () => ({
    meta: [
      { title: "Revisões — Residência Planner" },
      {
        name: "description",
        content: "Fila de revisões agendadas, pendentes e atrasadas da sua preparação.",
      },
      { property: "og:title", content: "Revisões — Residência Planner" },
      { property: "og:description", content: "Controle das revisões programadas por tópico." },
    ],
  }),
  component: Revisoes,
});

function statusOf(r: Tables<"reviews">): StatusMeta {
  if (r.status === "concluida") return "concluido";
  if (r.status === "atrasada" || r.scheduled_for < todayISO()) return "atrasado";
  return "pendente";
}

function Revisoes() {
  const qc = useQueryClient();
  const reviews = useQuery({ queryKey: queryKeys.reviews, queryFn: listReviews });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());

  const invalidate = () => void qc.invalidateQueries({ queryKey: queryKeys.reviews });

  const create = useMutation({
    mutationFn: () =>
      createReview({ title: title || null, scheduled_for: date, status: "pendente" }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setTitle("");
      toast.success("Revisão agendada");
    },
    onError: (e: Error) => toast.error("Erro ao agendar", { description: e.message }),
  });

  const complete = useMutation({
    mutationFn: (id: string) =>
      updateReview(id, { status: "concluida", completed_at: new Date().toISOString() }),
    onSuccess: () => {
      invalidate();
      toast.success("Revisão concluída");
    },
    onError: (e: Error) => toast.error("Erro ao concluir", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      invalidate();
      toast.success("Revisão removida");
    },
    onError: (e: Error) => toast.error("Erro ao remover", { description: e.message }),
  });

  const data = reviews.data ?? [];
  const pending = data.filter((r) => r.status === "pendente" || r.status === "atrasada");
  const late = pending.filter((r) => statusOf(r) === "atrasado");
  const done = data.filter((r) => r.status === "concluida");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revisões"
        description="Mantenha o conteúdo fresco revisando no tempo certo."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Revisão
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Agendar revisão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="r-title">Título</Label>
                  <Input
                    id="r-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Choque séptico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-date">Data</Label>
                  <Input
                    id="r-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="rounded-xl"
                  disabled={create.isPending}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? "Salvando..." : "Agendar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pendentes"
          value={String(pending.length)}
          icon={RotateCcw}
          tone="warning"
        />
        <StatCard label="Atrasadas" value={String(late.length)} icon={RotateCcw} tone="danger" />
        <StatCard
          label="Concluídas"
          value={String(done.length)}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <SectionCard title="Fila de revisões" description="Ordenadas pela data agendada">
        {reviews.isLoading && <ListSkeleton rows={4} />}
        {reviews.isError && <ErrorState onRetry={() => void reviews.refetch()} />}
        {reviews.data && data.length === 0 && (
          <EmptyState
            icon={RotateCcw}
            title="Nenhuma revisão agendada"
            description="Agende revisões dos tópicos estudados para fixar o conteúdo."
          />
        )}
        {data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title ?? "Revisão"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(r.scheduled_for)} · revisão {r.review_number}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={statusOf(r)} />
                  {r.status !== "concluida" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => complete.mutate(r.id)}
                    >
                      Concluir
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-muted-foreground"
                    onClick={() => remove.mutate(r.id)}
                  >
                    Remover
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
