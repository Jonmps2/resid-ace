/**
 * Estrutura curricular sugerida por grande área, já classificada em P1–P4
 * de acordo com o rendimento histórico nas provas de residência.
 * P1 = temas de maior incidência; P4 = temas pontuais.
 */

import type { TopicImportance, TopicPriority } from "@/lib/topic-meta";

export interface CurriculumTopic {
  title: string;
  subject: string;
  priority: TopicPriority;
  importance: TopicImportance;
}

export const curriculum: Record<string, CurriculumTopic[]> = {
  "clinica-medica": [
    { title: "Insuficiência cardíaca", subject: "Cardiologia", priority: "P1", importance: "alta" },
    { title: "Síndromes coronarianas agudas", subject: "Cardiologia", priority: "P1", importance: "alta" },
    { title: "Hipertensão arterial sistêmica", subject: "Cardiologia", priority: "P1", importance: "alta" },
    { title: "Arritmias e fibrilação atrial", subject: "Cardiologia", priority: "P2", importance: "media" },
    { title: "Asma e DPOC", subject: "Pneumologia", priority: "P1", importance: "alta" },
    { title: "Pneumonia adquirida na comunidade", subject: "Pneumologia", priority: "P1", importance: "alta" },
    { title: "Tuberculose", subject: "Infectologia", priority: "P1", importance: "alta" },
    { title: "HIV e infecções oportunistas", subject: "Infectologia", priority: "P2", importance: "alta" },
    { title: "Sepse e choque séptico", subject: "Terapia intensiva", priority: "P1", importance: "alta" },
    { title: "Diabetes mellitus", subject: "Endocrinologia", priority: "P1", importance: "alta" },
    { title: "Tireoidopatias", subject: "Endocrinologia", priority: "P2", importance: "media" },
    { title: "Injúria renal aguda", subject: "Nefrologia", priority: "P1", importance: "alta" },
    { title: "Distúrbios hidroeletrolíticos", subject: "Nefrologia", priority: "P2", importance: "alta" },
    { title: "Hemorragia digestiva", subject: "Gastroenterologia", priority: "P2", importance: "media" },
    { title: "Cirrose e suas complicações", subject: "Gastroenterologia", priority: "P2", importance: "alta" },
    { title: "Anemias", subject: "Hematologia", priority: "P2", importance: "media" },
    { title: "Acidente vascular cerebral", subject: "Neurologia", priority: "P1", importance: "alta" },
    { title: "Cefaleias", subject: "Neurologia", priority: "P3", importance: "media" },
    { title: "Artrites e colagenoses", subject: "Reumatologia", priority: "P3", importance: "media" },
    { title: "Vasculites", subject: "Reumatologia", priority: "P4", importance: "baixa" },
  ],
  cirurgia: [
    { title: "Abdome agudo inflamatório", subject: "Cirurgia geral", priority: "P1", importance: "alta" },
    { title: "Apendicite aguda", subject: "Cirurgia geral", priority: "P1", importance: "alta" },
    { title: "Colecistite e colelitíase", subject: "Cirurgia geral", priority: "P1", importance: "alta" },
    { title: "Obstrução intestinal", subject: "Cirurgia geral", priority: "P1", importance: "alta" },
    { title: "Atendimento inicial ao politraumatizado", subject: "Trauma", priority: "P1", importance: "alta" },
    { title: "Trauma abdominal", subject: "Trauma", priority: "P1", importance: "alta" },
    { title: "Trauma torácico", subject: "Trauma", priority: "P2", importance: "alta" },
    { title: "Queimaduras", subject: "Trauma", priority: "P3", importance: "media" },
    { title: "Hérnias da parede abdominal", subject: "Cirurgia geral", priority: "P2", importance: "media" },
    { title: "Câncer gástrico e colorretal", subject: "Oncologia cirúrgica", priority: "P2", importance: "alta" },
    { title: "Pancreatite aguda", subject: "Cirurgia do aparelho digestivo", priority: "P1", importance: "alta" },
    { title: "Doença arterial obstrutiva periférica", subject: "Vascular", priority: "P3", importance: "media" },
    { title: "Resposta metabólica ao trauma", subject: "Pré e pós-operatório", priority: "P3", importance: "media" },
    { title: "Nódulo de tireoide e cirurgia cervical", subject: "Cabeça e pescoço", priority: "P4", importance: "baixa" },
  ],
  pediatria: [
    { title: "Aleitamento materno", subject: "Puericultura", priority: "P1", importance: "alta" },
    { title: "Crescimento e desenvolvimento", subject: "Puericultura", priority: "P1", importance: "alta" },
    { title: "Calendário vacinal", subject: "Puericultura", priority: "P1", importance: "alta" },
    { title: "Diarreia aguda e desidratação", subject: "Gastropediatria", priority: "P1", importance: "alta" },
    { title: "Infecções respiratórias agudas", subject: "Pneumopediatria", priority: "P1", importance: "alta" },
    { title: "Asma na infância", subject: "Pneumopediatria", priority: "P2", importance: "alta" },
    { title: "Reanimação neonatal", subject: "Neonatologia", priority: "P1", importance: "alta" },
    { title: "Icterícia neonatal", subject: "Neonatologia", priority: "P1", importance: "alta" },
    { title: "Doenças exantemáticas", subject: "Infectologia pediátrica", priority: "P2", importance: "media" },
    { title: "Desnutrição e obesidade infantil", subject: "Nutrologia", priority: "P3", importance: "media" },
    { title: "Infecção do trato urinário na criança", subject: "Nefropediatria", priority: "P3", importance: "media" },
    { title: "Maus-tratos e violência infantil", subject: "Pediatria social", priority: "P4", importance: "baixa" },
  ],
  "ginecologia-obstetricia": [
    { title: "Pré-natal de baixo risco", subject: "Obstetrícia", priority: "P1", importance: "alta" },
    { title: "Síndromes hipertensivas da gestação", subject: "Obstetrícia", priority: "P1", importance: "alta" },
    { title: "Trabalho de parto e assistência ao parto", subject: "Obstetrícia", priority: "P1", importance: "alta" },
    { title: "Hemorragias da primeira metade", subject: "Obstetrícia", priority: "P1", importance: "alta" },
    { title: "Hemorragia pós-parto", subject: "Obstetrícia", priority: "P1", importance: "alta" },
    { title: "Diabetes gestacional", subject: "Obstetrícia", priority: "P2", importance: "alta" },
    { title: "Rastreio do câncer de colo uterino", subject: "Ginecologia", priority: "P1", importance: "alta" },
    { title: "Câncer de mama e rastreamento", subject: "Mastologia", priority: "P1", importance: "alta" },
    { title: "Sangramento uterino anormal", subject: "Ginecologia", priority: "P2", importance: "media" },
    { title: "Contracepção", subject: "Ginecologia", priority: "P2", importance: "alta" },
    { title: "Infecções genitais e DIP", subject: "Ginecologia", priority: "P3", importance: "media" },
    { title: "Climatério", subject: "Ginecologia", priority: "P3", importance: "media" },
    { title: "Infertilidade conjugal", subject: "Reprodução humana", priority: "P4", importance: "baixa" },
  ],
  "preventiva-sus": [
    { title: "Princípios e diretrizes do SUS", subject: "Políticas de saúde", priority: "P1", importance: "alta" },
    { title: "Atenção primária e ESF", subject: "Políticas de saúde", priority: "P1", importance: "alta" },
    { title: "Indicadores de saúde", subject: "Epidemiologia", priority: "P1", importance: "alta" },
    { title: "Medidas de associação e risco", subject: "Epidemiologia", priority: "P1", importance: "alta" },
    { title: "Tipos de estudo epidemiológico", subject: "Epidemiologia", priority: "P1", importance: "alta" },
    { title: "Testes diagnósticos: sensibilidade e especificidade", subject: "Epidemiologia", priority: "P1", importance: "alta" },
    { title: "Vigilância epidemiológica e notificação", subject: "Vigilância", priority: "P2", importance: "alta" },
    { title: "Bioestatística aplicada", subject: "Bioestatística", priority: "P2", importance: "media" },
    { title: "Níveis de prevenção", subject: "Saúde coletiva", priority: "P2", importance: "media" },
    { title: "Saúde do trabalhador", subject: "Saúde coletiva", priority: "P3", importance: "media" },
    { title: "Ética médica e bioética", subject: "Medicina legal", priority: "P3", importance: "media" },
    { title: "Financiamento e gestão em saúde", subject: "Políticas de saúde", priority: "P4", importance: "baixa" },
  ],
};

export function curriculumFor(slug: string): CurriculumTopic[] {
  return curriculum[slug] ?? [];
}
