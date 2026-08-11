import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import type { StudyArea, Subject, Topic } from "@/lib/api";
import {
  importanceLabels,
  importanceOptions,
  priorityOptions,
  topicStatusLabels,
  topicStatusOptions,
  type TopicImportance,
  type TopicPriority,
  type TopicStatus,
} from "@/lib/topic-meta";

export interface TopicFormValues {
  title: string;
  areaId: string;
  subareaName: string;
  description: string;
  priority: TopicPriority;
  importance: TopicImportance;
  status: TopicStatus;
  estimatedMinutes: string;
  plannedDate: string;
  tags: string;
  source: string;
  notes: string;
}

export const emptyTopicForm: TopicFormValues = {
  title: "",
  areaId: "",
  subareaName: "",
  description: "",
  priority: "P2",
  importance: "media",
  status: "nao_iniciado",
  estimatedMinutes: "",
  plannedDate: "",
  tags: "",
  source: "",
  notes: "",
};

export function topicToForm(topic: Topic, subjects: Subject[]): TopicFormValues {
  return {
    title: topic.title,
    areaId: topic.area_id ?? "",
    subareaName: subjects.find((s) => s.id === topic.subject_id)?.name ?? "",
    description: topic.description ?? "",
    priority: topic.priority,
    importance: topic.importance,
    status: topic.status,
    estimatedMinutes: topic.estimated_minutes ? String(topic.estimated_minutes) : "",
    plannedDate: topic.planned_date ?? "",
    tags: (topic.tags ?? []).join(", "),
    source: topic.source ?? "",
    notes: topic.notes ?? "",
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: StudyArea[];
  subjects: Subject[];
  initial: TopicFormValues;
  editing: boolean;
  pending: boolean;
  onSubmit: (values: TopicFormValues) => void;
}

export function TopicFormDialog({
  open,
  onOpenChange,
  areas,
  subjects,
  initial,
  editing,
  pending,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<TopicFormValues>(initial);

  useEffect(() => {
    if (open) setValues(initial);
  }, [open, initial]);

  const set = <K extends keyof TopicFormValues>(key: K, value: TopicFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const areaSubjects = subjects.filter((s) => s.area_id === values.areaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar conteúdo" : "Novo conteúdo"}</DialogTitle>
          <DialogDescription>
            Descreva o conteúdo para acompanhar estudo, questões e revisões.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="t-title">Título</Label>
            <Input
              id="t-title"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex.: Insuficiência cardíaca"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Grande área</Label>
              <Select
                value={values.areaId}
                onValueChange={(v) => {
                  set("areaId", v);
                  set("subareaName", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-subarea">Subárea</Label>
              <Input
                id="t-subarea"
                list="subarea-options"
                value={values.subareaName}
                onChange={(e) => set("subareaName", e.target.value)}
                placeholder="Ex.: Cardiologia"
              />
              <datalist id="subarea-options">
                {areaSubjects.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-desc">Descrição</Label>
            <Textarea
              id="t-desc"
              rows={2}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="O que este conteúdo cobre"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={values.priority}
                onValueChange={(v) => set("priority", v as TopicPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Importância</Label>
              <Select
                value={values.importance}
                onValueChange={(v) => set("importance", v as TopicImportance)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {importanceOptions.map((i) => (
                    <SelectItem key={i} value={i}>
                      {importanceLabels[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as TopicStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topicStatusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {topicStatusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-min">Carga horária estimada (minutos)</Label>
              <Input
                id="t-min"
                type="number"
                min={0}
                value={values.estimatedMinutes}
                onChange={(e) => set("estimatedMinutes", e.target.value)}
                placeholder="90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-date">Data desejada</Label>
              <Input
                id="t-date"
                type="date"
                value={values.plannedDate}
                onChange={(e) => set("plannedDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-tags">Tags</Label>
              <Input
                id="t-tags"
                value={values.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="cardio, alto rendimento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-source">Fonte/material</Label>
              <Input
                id="t-source"
                value={values.source}
                onChange={(e) => set("source", e.target.value)}
                placeholder="Apostila, videoaula, livro..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="t-notes">Observações</Label>
            <Textarea
              id="t-notes"
              rows={2}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="rounded-xl"
            disabled={!values.title.trim() || pending}
            onClick={() => onSubmit(values)}
          >
            {pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar conteúdo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
