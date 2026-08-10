import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Percent, Plus, Trash2 } from "lucide-react";
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
  createQuestionSession,
  deleteQuestionSession,
  listAreas,
  listQuestionSessions,
  queryKeys,
} from "@/lib/api";
import { formatDateTime, percent } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/questoes")({
  head: () => ({
    meta: [
      { title: "Questões — Residência Planner" },
      {
        name: "description",
        content: "Registre blocos de questões, acompanhe acertos e evolução do aproveitamento.",
      },
      { property: "og:title", content: "Questões — Residência Planner" },
      {
        property: "og:description",
        content: "Blocos de questões resolvidos com percentual de acertos por área.",
      },
    ],
  }),
  component: Questoes;
});

function Questoes() {
  const qc = useQueryClient();
  const areas = useQuery({ queryKey: queryKeys.areas, queryFn: listAreas });
  const list = useQuery({ queryKey: queryKeys.questionSessions, queryFn: listQuestionSessions });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState("");
  const [total, setTotal] = useState("30");
  const [correct, setCorrect] = useState("20");

  const create = useMutation({
    mutationFn: () => {
      const totalN = Number(total) || 0;
      const correctN = Number(correct) || 0;
      if (correctN > totalN) throw new Error("Acertos não podem superar o total de questões.");
      return createQuestionSession({
        title: title || null,
        area_id: areaId || null,
        total_questions: totalN,
        correct_count: correctN,
        wrong_count: totalN - correctN,
        performed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.questionSessions });
      setOpen(false);
      setTitle("");
      toast.success("Bloco registrado");
    },
    onError: (e: Error) => toast.error("Erro ao registrar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteQuestionSession(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.questionSessions });
      toast.success("Bloco removido");
    },
    onError: (e: Error) => toast.error("Erro ao remover", { description: e.message }),
  });

  const data = list.data ?? [];
  const totalQ = data.reduce((acc, q) => acc + q.total_questions, 0);
  const correctQ = data.reduce((acc, q) => acc + q.correct_count, 0);
  const areaName = (id: string | null) => areas.data?.find((a) => a.id === id)?.name ?? "Sem área";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questões"
        description="Acompanhe o volume e o aproveitamento por área."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Bloco
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Novo bloco de questões</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="q-title">Título</Label>
                  <Input
                    id="q-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Provas anteriores — Pediatria"
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
                    <Label htmlFor="q-total">Total</Label>
                    <Input
                      id="q-total"
                      type="number"
                      min={1}
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q-correct">Acertos</Label>
                    <Input
                      id="q-correct"
                      type="number"
                      min={0}
                      value={correct}
                      onChange={(e) => setCorrect(e.target.value)}
                    />
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
        <StatCard label="Questões" value={String(totalQ)} icon={ListChecks} />
        <StatCard
          label="Acertos"
          value={`${percent(correctQ, totalQ)}%`}
          hint={`${correctQ} corretas`}
          icon={Percent}
          tone="success"
        />
      </div>

      <SectionCard title="Blocos resolvidos" description="Registros mais recentes primeiro">
        {list.isLoading && <ListSkeleton rows={4} />}
        {list.isError && <ErrorState onRetry={() => void list.refetch()} />}
        {list.data && data.length === 0 && (
          <EmptyState
            icon={ListChecks}
            title="Nenhum bloco registrado"
            description="Registre blocos de questões para acompanhar seu aproveitamento."
          />
        )}
        {data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((q) => (
              <li
                key={q.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{q.title ?? "Bloco de questões"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {areaName(q.area_id)} · {q.correct_count}/{q.total_questions} ·{" "}
                    {formatDateTime(q.performed_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">
                    {percent(q.correct_count, q.total_questions)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover bloco"
                    className="h-8 w-8 rounded-lg text-muted-foreground"
                    onClick={() => remove.mutate(q.id)}
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
