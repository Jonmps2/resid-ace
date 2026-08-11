import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { todaySP } from "@/lib/format";
import { studyMethodLabels, studyMethodOptions, type StudyType } from "@/lib/topic-meta";

export interface StudyLogValues {
  date: string;
  minutes: string;
  method: StudyType;
  notes: string;
  createReview: boolean;
  markAs: "estudado" | "dominado";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicTitle: string;
  /** Data sugerida para a primeira revisão, se houver. */
  nextReviewHint: string | null;
  pending: boolean;
  onSubmit: (values: StudyLogValues) => void;
}

export function StudyLogDialog({
  open,
  onOpenChange,
  topicTitle,
  nextReviewHint,
  pending,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<StudyLogValues>({
    date: todaySP(),
    minutes: "60",
    method: "videoaula",
    notes: "",
    createReview: true,
    markAs: "estudado",
  });

  useEffect(() => {
    if (open) {
      setValues({
        date: todaySP(),
        minutes: "60",
        method: "videoaula",
        notes: "",
        createReview: true,
        markAs: "estudado",
      });
    }
  }, [open]);

  const set = <K extends keyof StudyLogValues>(key: K, value: StudyLogValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar estudo</DialogTitle>
          <DialogDescription>{topicTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-date">Data</Label>
              <Input
                id="s-date"
                type="date"
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-min">Duração líquida (minutos)</Label>
              <Input
                id="s-min"
                type="number"
                min={1}
                value={values.minutes}
                onChange={(e) => set("minutes", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Método utilizado</Label>
              <Select value={values.method} onValueChange={(v) => set("method", v as StudyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {studyMethodOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {studyMethodLabels[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marcar conteúdo como</Label>
              <Select
                value={values.markAs}
                onValueChange={(v) => set("markAs", v as StudyLogValues["markAs"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudado">Estudado</SelectItem>
                  <SelectItem value="dominado">Dominado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-notes">Observações</Label>
            <Textarea
              id="s-notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Pontos que ficaram frágeis, materiais usados..."
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <Checkbox
              checked={values.createReview}
              onCheckedChange={(c) => set("createReview", c === true)}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium">Gerar primeira revisão</span>
              <span className="block text-muted-foreground">
                {nextReviewHint
                  ? `Agendada para ${nextReviewHint} conforme sua regra de revisão.`
                  : "Agendada conforme sua regra de revisão."}
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="rounded-xl"
            disabled={pending || Number(values.minutes) <= 0}
            onClick={() => onSubmit(values)}
          >
            {pending ? "Salvando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
