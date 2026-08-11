import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type StudyArea = Tables<"study_areas">;
export type Subject = Tables<"subjects">;
export type Topic = Tables<"topics">;
export type StudySession = Tables<"study_sessions">;
export type QuestionSession = Tables<"question_sessions">;
export type ReviewRule = Tables<"review_rules">;
export type Review = Tables<"reviews">;
export type PlannerEvent = Tables<"planner_events">;
export type Goal = Tables<"goals">;

/** Converte erros do backend em mensagens compreensíveis. */
export function friendlyDbError(error: { message: string; code?: string } | null): string {
  if (!error) return "Erro desconhecido.";
  const m = error.message.toLowerCase();
  if (m.includes("row-level security")) return "Você não tem permissão para acessar estes dados.";
  if (m.includes("duplicate key")) return "Já existe um registro com estes dados.";
  if (m.includes("violates check constraint")) return "Alguns valores informados são inválidos.";
  if (m.includes("foreign key")) return "Registro relacionado não encontrado.";
  if (m.includes("failed to fetch")) return "Sem conexão com o servidor. Tente novamente.";
  return error.message;
}

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(friendlyDbError(error));
  return data as T;
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export const queryKeys = {
  profile: ["profile"] as const,
  areas: ["study_areas"] as const,
  subjects: ["subjects"] as const,
  topics: ["topics"] as const,
  studySessions: ["study_sessions"] as const,
  questionSessions: ["question_sessions"] as const,
  reviews: ["reviews"] as const,
  reviewRules: ["review_rules"] as const,
  plannerEvents: ["planner_events"] as const,
  goals: ["goals"] as const,
};

/* ---------- bootstrap ---------- */

export async function bootstrapUser(fullName?: string | null) {
  const { error } = await supabase.rpc("bootstrap_current_user", {
    ...(fullName ? { p_full_name: fullName } : {}),
  });
  if (error) throw new Error(friendlyDbError(error));
}

/* ---------- profile ---------- */

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
  if (error) throw new Error(friendlyDbError(error));
  return data;
}

export async function updateProfile(patch: TablesUpdate<"profiles">): Promise<Profile> {
  const id = await requireUserId();
  return unwrap(await supabase.from("profiles").update(patch).eq("id", id).select().single());
}

/* ---------- áreas e disciplinas ---------- */

export async function listAreas(): Promise<StudyArea[]> {
  return unwrap(await supabase.from("study_areas").select("*").order("position"));
}

export async function listSubjects(): Promise<Subject[]> {
  return unwrap(await supabase.from("subjects").select("*").order("name"));
}

export async function createSubject(input: Omit<TablesInsert<"subjects">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(await supabase.from("subjects").insert({ ...input, user_id }).select().single());
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}

/* ---------- tópicos ---------- */

export async function listTopics(): Promise<Topic[]> {
  return unwrap(
    await supabase.from("topics").select("*").order("created_at", { ascending: false }),
  );
}

export async function createTopic(input: Omit<TablesInsert<"topics">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(await supabase.from("topics").insert({ ...input, user_id }).select().single());
}

export async function updateTopic(id: string, patch: TablesUpdate<"topics">) {
  return unwrap(await supabase.from("topics").update(patch).eq("id", id).select().single());
}

export async function deleteTopic(id: string) {
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}

/* ---------- sessões de estudo ---------- */

export async function listStudySessions(): Promise<StudySession[]> {
  return unwrap(
    await supabase.from("study_sessions").select("*").order("started_at", { ascending: false }),
  );
}

export async function createStudySession(input: Omit<TablesInsert<"study_sessions">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(
    await supabase.from("study_sessions").insert({ ...input, user_id }).select().single(),
  );
}

export async function deleteStudySession(id: string) {
  const { error } = await supabase.from("study_sessions").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}

/* ---------- questões ---------- */

export async function listQuestionSessions(): Promise<QuestionSession[]> {
  return unwrap(
    await supabase
      .from("question_sessions")
      .select("*")
      .order("performed_at", { ascending: false }),
  );
}

export async function createQuestionSession(
  input: Omit<TablesInsert<"question_sessions">, "user_id">,
) {
  const user_id = await requireUserId();
  return unwrap(
    await supabase.from("question_sessions").insert({ ...input, user_id }).select().single(),
  );
}

export async function updateQuestionSession(id: string, patch: TablesUpdate<"question_sessions">) {
  return unwrap(
    await supabase.from("question_sessions").update(patch).eq("id", id).select().single(),
  );
}

export async function deleteQuestionSession(id: string) {
  const { error } = await supabase.from("question_sessions").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}


/* ---------- revisões ---------- */

export async function listReviews(): Promise<Review[]> {
  return unwrap(await supabase.from("reviews").select("*").order("scheduled_for"));
}

export async function createReview(input: Omit<TablesInsert<"reviews">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(await supabase.from("reviews").insert({ ...input, user_id }).select().single());
}

export async function updateReview(id: string, patch: TablesUpdate<"reviews">) {
  return unwrap(await supabase.from("reviews").update(patch).eq("id", id).select().single());
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}

export async function listReviewRules(): Promise<ReviewRule[]> {
  return unwrap(await supabase.from("review_rules").select("*").order("created_at"));
}

export async function updateReviewRule(id: string, patch: TablesUpdate<"review_rules">) {
  return unwrap(await supabase.from("review_rules").update(patch).eq("id", id).select().single());
}

export async function createReviewRule(input: Omit<TablesInsert<"review_rules">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(
    await supabase.from("review_rules").insert({ ...input, user_id }).select().single(),
  );
}

/** Revisão pendente/atrasada de um conteúdo, se existir. */
export async function findOpenReview(topicId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("topic_id", topicId)
    .in("status", ["pendente", "atrasada"])
    .order("scheduled_for")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(friendlyDbError(error));
  return data;
}

/** Cria uma revisão apenas quando não existe outra em aberto para o conteúdo. */
export async function ensureReview(
  topicId: string,
  input: Omit<TablesInsert<"reviews">, "user_id" | "topic_id">,
): Promise<Review> {
  const existing = await findOpenReview(topicId);
  if (existing) return existing;
  return createReview({ ...input, topic_id: topicId });
}

/* ---------- criação em lote (importação CSV / currículo) ---------- */

export async function createTopicsBulk(
  rows: Array<Omit<TablesInsert<"topics">, "user_id">>,
): Promise<Topic[]> {
  if (rows.length === 0) return [];
  const user_id = await requireUserId();
  return unwrap(
    await supabase
      .from("topics")
      .insert(rows.map((r) => ({ ...r, user_id })))
      .select(),
  );
}


/* ---------- planner ---------- */

export async function listPlannerEvents(): Promise<PlannerEvent[]> {
  return unwrap(await supabase.from("planner_events").select("*").order("starts_at"));
}

export async function createPlannerEvent(input: Omit<TablesInsert<"planner_events">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(
    await supabase.from("planner_events").insert({ ...input, user_id }).select().single(),
  );
}

export async function updatePlannerEvent(id: string, patch: TablesUpdate<"planner_events">) {
  return unwrap(await supabase.from("planner_events").update(patch).eq("id", id).select().single());
}

export async function deletePlannerEvent(id: string) {
  const { error } = await supabase.from("planner_events").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}

/* ---------- metas ---------- */

export async function listGoals(): Promise<Goal[]> {
  return unwrap(await supabase.from("goals").select("*").order("created_at", { ascending: false }));
}

export async function createGoal(input: Omit<TablesInsert<"goals">, "user_id">) {
  const user_id = await requireUserId();
  return unwrap(await supabase.from("goals").insert({ ...input, user_id }).select().single());
}

export async function updateGoal(id: string, patch: TablesUpdate<"goals">) {
  return unwrap(await supabase.from("goals").update(patch).eq("id", id).select().single());
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
}
