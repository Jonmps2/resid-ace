/**
 * Dados simulados apenas para demonstrar o layout.
 * Substituir por chamadas ao backend (Lovable Cloud) nos próximos passos:
 * cada função abaixo deve virar um server function / query.
 */

export type StatusMeta = "concluido" | "pendente" | "atrasado";

export interface Conteudo {
  id: string;
  titulo: string;
  area: string;
  progresso: number;
  topicos: number;
  topicosConcluidos: number;
}

export interface Sessao {
  id: string;
  conteudo: string;
  data: string;
  duracaoMin: number;
  tipo: "Teoria" | "Questões" | "Revisão";
}

export interface Questao {
  id: string;
  banca: string;
  area: string;
  total: number;
  acertos: number;
  data: string;
}

export interface Revisao {
  id: string;
  conteudo: string;
  prevista: string;
  status: StatusMeta;
  intervalo: string;
}

export interface ItemHoje {
  id: string;
  titulo: string;
  detalhe: string;
  horario: string;
  tipo: "estudo" | "revisao";
  status: StatusMeta;
}

export interface Meta {
  id: string;
  titulo: string;
  atual: number;
  alvo: number;
  unidade: string;
}

export const resumoGeral = {
  horasEstudadas: 18.5,
  horasMeta: 25,
  questoesRealizadas: 412,
  percentualAcertos: 74,
  revisoesPendentes: 6,
  progressoMetas: 68,
};

export const itensHoje: ItemHoje[] = [
  {
    id: "1",
    titulo: "Cardiologia — Insuficiência cardíaca",
    detalhe: "Teoria + 20 questões",
    horario: "08:00",
    tipo: "estudo",
    status: "concluido",
  },
  {
    id: "2",
    titulo: "Pediatria — Aleitamento materno",
    detalhe: "Revisão D+7",
    horario: "12:30",
    tipo: "revisao",
    status: "pendente",
  },
  {
    id: "3",
    titulo: "Ginecologia — Sangramento uterino",
    detalhe: "Revisão D+30",
    horario: "16:00",
    tipo: "revisao",
    status: "atrasado",
  },
  {
    id: "4",
    titulo: "Preventiva — Epidemiologia",
    detalhe: "Teoria 45 min",
    horario: "19:00",
    tipo: "estudo",
    status: "pendente",
  },
];

export const conteudos: Conteudo[] = [
  { id: "1", titulo: "Cardiologia", area: "Clínica Médica", progresso: 72, topicos: 25, topicosConcluidos: 18 },
  { id: "2", titulo: "Pneumologia", area: "Clínica Médica", progresso: 40, topicos: 20, topicosConcluidos: 8 },
  { id: "3", titulo: "Neonatologia", area: "Pediatria", progresso: 55, topicos: 18, topicosConcluidos: 10 },
  { id: "4", titulo: "Obstetrícia", area: "GO", progresso: 30, topicos: 22, topicosConcluidos: 7 },
  { id: "5", titulo: "Trauma", area: "Cirurgia", progresso: 85, topicos: 14, topicosConcluidos: 12 },
  { id: "6", titulo: "Epidemiologia", area: "Preventiva", progresso: 20, topicos: 16, topicosConcluidos: 3 },
];

export const sessoes: Sessao[] = [
  { id: "1", conteudo: "Cardiologia — IC", data: "10/08", duracaoMin: 75, tipo: "Teoria" },
  { id: "2", conteudo: "Trauma — ATLS", data: "09/08", duracaoMin: 50, tipo: "Questões" },
  { id: "3", conteudo: "Neonatologia — Icterícia", data: "09/08", duracaoMin: 40, tipo: "Revisão" },
  { id: "4", conteudo: "Pneumologia — DPOC", data: "08/08", duracaoMin: 90, tipo: "Teoria" },
];

export const questoes: Questao[] = [
  { id: "1", banca: "USP-SP", area: "Clínica Médica", total: 40, acertos: 31, data: "10/08" },
  { id: "2", banca: "UNIFESP", area: "Cirurgia", total: 30, acertos: 19, data: "09/08" },
  { id: "3", banca: "ENARE", area: "Pediatria", total: 25, acertos: 20, data: "08/08" },
  { id: "4", banca: "SUS-SP", area: "GO", total: 35, acertos: 22, data: "07/08" },
];

export const revisoes: Revisao[] = [
  { id: "1", conteudo: "Pediatria — Aleitamento", prevista: "Hoje", status: "pendente", intervalo: "D+7" },
  { id: "2", conteudo: "GO — Sangramento uterino", prevista: "Ontem", status: "atrasado", intervalo: "D+30" },
  { id: "3", conteudo: "Cardiologia — Arritmias", prevista: "09/08", status: "concluido", intervalo: "D+1" },
  { id: "4", conteudo: "Preventiva — Vigilância", prevista: "12/08", status: "pendente", intervalo: "D+15" },
];

export const metas: Meta[] = [
  { id: "1", titulo: "Horas de estudo na semana", atual: 18.5, alvo: 25, unidade: "h" },
  { id: "2", titulo: "Questões na semana", atual: 412, alvo: 600, unidade: "questões" },
  { id: "3", titulo: "Revisões em dia", atual: 12, alvo: 18, unidade: "revisões" },
  { id: "4", titulo: "Aproveitamento alvo", atual: 74, alvo: 80, unidade: "%" },
];

export const desempenhoSemanal = [
  { dia: "Seg", horas: 3.5, acertos: 68 },
  { dia: "Ter", horas: 2, acertos: 71 },
  { dia: "Qua", horas: 4, acertos: 75 },
  { dia: "Qui", horas: 1.5, acertos: 70 },
  { dia: "Sex", horas: 3, acertos: 79 },
  { dia: "Sáb", horas: 4.5, acertos: 76 },
  { dia: "Dom", horas: 0, acertos: 0 },
];

export const planner = [
  {
    dia: "Segunda",
    blocos: [
      { hora: "07:00", titulo: "Cardiologia — Teoria", tipo: "estudo" as const },
      { hora: "19:00", titulo: "Revisão D+7", tipo: "revisao" as const },
    ],
  },
  {
    dia: "Terça",
    blocos: [{ hora: "08:00", titulo: "Pediatria — Questões", tipo: "estudo" as const }],
  },
  { dia: "Quarta", blocos: [{ hora: "07:30", titulo: "Cirurgia — Trauma", tipo: "estudo" as const }] },
  { dia: "Quinta", blocos: [] },
  {
    dia: "Sexta",
    blocos: [
      { hora: "09:00", titulo: "Preventiva — Teoria", tipo: "estudo" as const },
      { hora: "20:00", titulo: "Revisão D+30", tipo: "revisao" as const },
    ],
  },
  { dia: "Sábado", blocos: [{ hora: "10:00", titulo: "Simulado 60 questões", tipo: "estudo" as const }] },
  { dia: "Domingo", blocos: [] },
];

/** Simula latência de rede para demonstrar skeletons de carregamento. */
export function fetchMock<T>(data: T, delay = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}
