import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import type { StudyArea, Topic } from "@/lib/api";
import {
  CSV_COLUMNS,
  CSV_COLUMN_LABELS,
  CSV_TEMPLATE,
  downloadCsv,
  guessMapping,
  parseCsv,
  type CsvColumn,
} from "@/lib/csv";
import {
  importanceOptions,
  priorityOptions,
  topicStatusOptions,
  type TopicImportance,
  type TopicPriority,
  type TopicStatus,
} from "@/lib/topic-meta";

export interface ImportRow {
  title: string;
  areaId: string | null;
  subareaName: string;
  description: string | null;
  priority: TopicPriority;
  importance: TopicImportance;
  status: TopicStatus;
  estimatedMinutes: number | null;
  plannedDate: string | null;
  tags: string[];
  source: string | null;
  notes: string | null;
}

interface RowResult {
  line: number;
  row: ImportRow | null;
  errors: string[];
  duplicated: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: StudyArea[];
  topics: Topic[];
  pending: boolean;
  onImport: (rows: ImportRow[]) => void;
}

const NONE = "__none__";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function CsvImportDialog({ open, onOpenChange, areas, topics, pending, onImport }: Props) {
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<CsvColumn, number>>(
    () => guessMapping([]),
  );

  function reset() {
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping(guessMapping([]));
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) {
      setHeaders([]);
      setRows([]);
      return;
    }
    const [head, ...body] = parsed;
    setFileName(file.name);
    setHeaders(head ?? []);
    setRows(body);
    setMapping(guessMapping(head ?? []));
  }

  const results = useMemo<RowResult[]>(() => {
    if (rows.length === 0) return [];
    const existing = new Set(
      topics.map((t) => `${normalize(t.title)}|${t.area_id ?? ""}`),
    );
    const seen = new Set<string>();

    return rows.map((cells, index) => {
      const get = (col: CsvColumn): string => {
        const idx = mapping[col];
        return idx >= 0 ? (cells[idx] ?? "").trim() : "";
      };
      const errors: string[] = [];

      const title = get("titulo");
      if (!title) errors.push("Título obrigatório");

      const areaText = get("area");
      const area =
        areas.find((a) => normalize(a.name) === normalize(areaText)) ??
        areas.find((a) => normalize(a.slug) === normalize(areaText)) ??
        null;
      if (areaText && !area) errors.push(`Grande área desconhecida: "${areaText}"`);

      const priorityText = get("prioridade").toUpperCase();
      const priority = (priorityOptions as string[]).includes(priorityText)
        ? (priorityText as TopicPriority)
        : "P2";
      if (priorityText && priority !== priorityText) errors.push("Prioridade inválida (use P1–P4)");

      const importanceText = normalize(get("importancia")).replace("média", "media");
      const importance = (importanceOptions as string[]).includes(importanceText)
        ? (importanceText as TopicImportance)
        : "media";
      if (importanceText && importance !== importanceText) {
        errors.push("Importância inválida (alta, media ou baixa)");
      }

      const statusText = normalize(get("status")).replace(/ /g, "_");
      const status = (topicStatusOptions as string[]).includes(statusText)
        ? (statusText as TopicStatus)
        : "nao_iniciado";
      if (statusText && status !== statusText) errors.push("Status inválido");

      const minutesText = get("carga_horaria_min");
      let estimatedMinutes: number | null = null;
      if (minutesText) {
        const parsedMinutes = Number(minutesText.replace(",", "."));
        if (!Number.isFinite(parsedMinutes) || parsedMinutes < 0) {
          errors.push("Carga horária deve ser um número de minutos");
        } else {
          estimatedMinutes = Math.round(parsedMinutes);
        }
      }

      const dateText = get("data_desejada");
      let plannedDate: string | null = null;
      if (dateText) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
          plannedDate = dateText;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateText)) {
          const [d, m, y] = dateText.split("/");
          plannedDate = `${y}-${m}-${d}`;
        } else {
          errors.push("Data desejada deve estar em AAAA-MM-DD");
        }
      }

      const key = `${normalize(title)}|${area?.id ?? ""}`;
      const duplicated = Boolean(title) && (existing.has(key) || seen.has(key));
      if (title) seen.add(key);

      const row: ImportRow = {
        title,
        areaId: area?.id ?? null,
        subareaName: get("subarea"),
        description: get("descricao") || null,
        priority,
        importance,
        status,
        estimatedMinutes,
        plannedDate,
        tags: get("tags")
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter(Boolean),
        source: get("fonte") || null,
        notes: get("observacoes") || null,
      };

      return { line: index + 2, row: errors.length === 0 ? row : null, errors, duplicated };
    });
  }, [rows, mapping, areas, topics]);

  const validRows = results.filter((r) => r.row && !r.duplicated).map((r) => r.row as ImportRow);
  const errorRows = results.filter((r) => r.errors.length > 0);
  const duplicatedRows = results.filter((r) => r.duplicated);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar conteúdos de CSV</DialogTitle>
          <DialogDescription>
            O arquivo deve ter uma linha de cabeçalho. Você pode mapear as colunas manualmente e
            conferir os erros antes de salvar — nada é gravado até a confirmação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="file"
              accept=".csv,text/csv"
              className="max-w-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => downloadCsv("modelo-conteudos.csv", CSV_TEMPLATE)}
            >
              Baixar modelo
            </Button>
            {fileName ? (
              <span className="text-sm text-muted-foreground">{fileName}</span>
            ) : null}
          </div>

          {headers.length > 0 ? (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium">Mapeamento de colunas</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CSV_COLUMNS.map((col) => (
                    <div key={col} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {CSV_COLUMN_LABELS[col]}
                      </Label>
                      <Select
                        value={mapping[col] >= 0 ? String(mapping[col]) : NONE}
                        onValueChange={(v) =>
                          setMapping((m) => ({ ...m, [col]: v === NONE ? -1 : Number(v) }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Não importar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>Não importar</SelectItem>
                          {headers.map((h, i) => (
                            <SelectItem key={`${h}-${i}`} value={String(i)}>
                              {h || `Coluna ${i + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-success/15 text-success">{validRows.length} válidos</Badge>
                <Badge className="bg-warning/15 text-warning">
                  {duplicatedRows.length} duplicados (serão ignorados)
                </Badge>
                <Badge className="bg-destructive/15 text-destructive">
                  {errorRows.length} com erro
                </Badge>
              </div>

              {errorRows.length > 0 ? (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  {errorRows.map((r) => (
                    <p key={r.line} className="text-destructive">
                      Linha {r.line}: {r.errors.join("; ")}
                    </p>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="rounded-xl"
            disabled={pending || validRows.length === 0}
            onClick={() => onImport(validRows)}
          >
            {pending ? "Importando..." : `Importar ${validRows.length} conteúdo(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
