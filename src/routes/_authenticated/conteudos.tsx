import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Plus, Trash2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTopic, deleteTopic, listAreas, listTopics, queryKeys, updateTopic } from "@/lib/api";
import { percent } from "@/lib/format";
import type { Enums } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/conteudos")({
  head: () => ({
    meta: [
      { title: "Conteúdos — Residência Planner" },
      {
        name: "description",
        content: "Organize o edital por grandes áreas e acompanhe o progresso de cada tópico.",
      },
      { property: "og:title", content: "Conteúdos — Residência Planner" },
      {
        property: "og:description",
        content: "Mapa do edital por áreas e tópicos com progresso de estudo.",
      },
    ],
  }),
  component: Conteudos,
});

const statusLabels: Record<Enums<"topic_status">, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  revisar: "Revisar",
};

function Conteudos() {
  const qc = useQueryClient();
  const areas = useQuery({ queryKey: queryKeys.areas, queryFn: listAreas });
  const topics = useQuery({ queryKey: queryKeys.topics, queryFn: listTopics });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<string>("");
  const [priority, setPriority] = useState<Enums<"topic_priority">>("P2");

  const invalidate = () => void qc.invalidateQueries({ queryKey: queryKeys.topics });

  const create = useMutation({
    mutationFn: () =>
      createTopic({ title, area_id: areaId || null, priority, status: "nao_iniciado" }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setTitle("");
      toast.success("Tópico adicionado");
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Enums<"topic_status"> }) =>
      updateTopic(id, {
        status,
        completed_at: status === "concluido" ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Tópico atualizado");
    },
    onError: (e: Error) => toast.error("Erro ao atualizar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTopic(id),
    onSuccess: () => {
      invalidate();
      toast.success("Tópico removido");
    },
    onError: (e: Error) => toast.error("Erro ao remover", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conteúdos"
        description="Seu edital dividido pelas cinco grandes áreas."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4" /> Tópico
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Novo tópico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic-title">Título</Label>
                  <Input
                    id="topic-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: Insuficiência cardíaca"
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
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as Enums<"topic_priority">)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["P1", "P2", "P3", "P4"] as const).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
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

      {(areas.isLoading || topics.isLoading) && <ListSkeleton rows={5} />}
      {(areas.isError || topics.isError) && (
        <ErrorState
          onRetry={() => {
            void areas.refetch();
            void topics.refetch();
          }}
        />
      )}

      {areas.data && topics.data && (
        <div className="grid gap-4 lg:grid-cols-2">
          {areas.data.map((area) => {
            const list = topics.data.filter((t) => t.area_id === area.id);
            const done = list.filter((t) => t.status === "concluido").length;
            return (
              <SectionCard
                key={area.id}
                title={area.name}
                description={`${done}/${list.length} tópicos concluídos`}
              >
                <Progress value={percent(done, list.length)} className="mb-4 h-2" />
                {list.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="Sem tópicos nesta área"
                    description="Adicione tópicos do edital para acompanhar o progresso."
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {list.map((topic) => (
                      <li
                        key={topic.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{topic.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {topic.priority} · {statusLabels[topic.status]}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Select
                            value={topic.status}
                            onValueChange={(v) =>
                              setStatus.mutate({
                                id: topic.id,
                                status: v as Enums<"topic_status">,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-[9.5rem] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(
                                Object.keys(statusLabels) as Array<Enums<"topic_status">>
                              ).map((s) => (
                                <SelectItem key={s} value={s}>
                                  {statusLabels[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remover tópico"
                            className="h-8 w-8 rounded-lg text-muted-foreground"
                            onClick={() => remove.mutate(topic.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
