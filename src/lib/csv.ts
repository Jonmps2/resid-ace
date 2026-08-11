/** Leitura e escrita de CSV para importação/exportação de conteúdos. */

export const CSV_COLUMNS = [
  "titulo",
  "area",
  "subarea",
  "descricao",
  "prioridade",
  "importancia",
  "status",
  "carga_horaria_min",
  "data_desejada",
  "tags",
  "fonte",
  "observacoes",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

export const CSV_COLUMN_LABELS: Record<CsvColumn, string> = {
  titulo: "Título",
  area: "Grande área",
  subarea: "Subárea",
  descricao: "Descrição",
  prioridade: "Prioridade (P1–P4)",
  importancia: "Importância (alta/media/baixa)",
  status: "Status",
  carga_horaria_min: "Carga horária (minutos)",
  data_desejada: "Data desejada (AAAA-MM-DD)",
  tags: "Tags (separadas por ;)",
  fonte: "Fonte/material",
  observacoes: "Observações",
};

export const CSV_TEMPLATE = [
  CSV_COLUMNS.join(","),
  [
    "Insuficiência cardíaca",
    "Clínica Médica",
    "Cardiologia",
    "Diagnóstico e tratamento",
    "P1",
    "alta",
    "nao_iniciado",
    "90",
    "2026-09-01",
    "cardio;alto rendimento",
    "Apostila + questões",
    "Focar em ICFEr",
  ].join(","),
].join("\n");

/** Divide o texto CSV em matriz, respeitando aspas duplas e quebras de linha. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i += 1) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === "," || char === ";") {
      row.push(field.trim());
      field = "";
    } else if (char === "\n") {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell !== ""));
}

function escapeCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((r) => r.map(escapeCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Tenta adivinhar a coluna do arquivo correspondente a cada campo esperado. */
export function guessMapping(headers: string[]): Record<CsvColumn, number> {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const aliases: Record<CsvColumn, string[]> = {
    titulo: ["titulo", "title", "conteudo", "tema", "nome"],
    area: ["area", "grandearea", "grande_area"],
    subarea: ["subarea", "disciplina", "subdisciplina"],
    descricao: ["descricao", "description"],
    prioridade: ["prioridade", "priority", "p"],
    importancia: ["importancia", "importance", "relevancia"],
    status: ["status", "situacao"],
    carga_horaria_min: ["cargahorariamin", "cargahoraria", "minutos", "duracao", "estimativa"],
    data_desejada: ["datadesejada", "data", "prazo", "plannedd"],
    tags: ["tags", "etiquetas"],
    fonte: ["fonte", "material", "source"],
    observacoes: ["observacoes", "notas", "notes", "obs"],
  };

  const normalized = headers.map(normalize);
  const mapping = {} as Record<CsvColumn, number>;
  for (const col of CSV_COLUMNS) {
    mapping[col] = normalized.findIndex((h) => aliases[col].includes(h));
  }
  return mapping;
}
