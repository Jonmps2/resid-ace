/** Rótulos e listas compartilhadas do domínio de conteúdos. */

import type { Enums } from "@/integrations/supabase/types";

export type TopicStatus = Enums<"topic_status">;
export type TopicPriority = Enums<"topic_priority">;
export type TopicImportance = Enums<"topic_importance">;
export type StudyType = Enums<"study_type">;

export const topicStatusLabels: Record<TopicStatus, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  estudado: "Estudado",
  dominado: "Dominado",
  concluido: "Concluído",
  revisar: "Revisar",
};

/** Status oferecidos no formulário (os legados continuam sendo exibidos). */
export const topicStatusOptions: TopicStatus[] = [
  "nao_iniciado",
  "em_andamento",
  "estudado",
  "dominado",
];

export const priorityOptions: TopicPriority[] = ["P1", "P2", "P3", "P4"];

export const importanceLabels: Record<TopicImportance, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const importanceOptions: TopicImportance[] = ["alta", "media", "baixa"];

export const studyMethodLabels: Record<StudyType, string> = {
  videoaula: "Videoaula",
  leitura: "Leitura",
  resumo: "Resumo",
  flashcards: "Flashcards",
  questoes: "Questões",
  teoria: "Teoria",
  aula: "Aula",
  revisao: "Revisão",
  outro: "Outro",
};

/** Métodos oferecidos ao registrar estudo/revisão. */
export const studyMethodOptions: StudyType[] = [
  "videoaula",
  "leitura",
  "resumo",
  "flashcards",
  "questoes",
  "outro",
];

export const masteryLabels: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Razoável",
  4: "Bom",
  5: "Dominado",
};
