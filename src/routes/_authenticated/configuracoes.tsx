import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { ErrorState, ListSkeleton } from "@/components/common/states";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, queryKeys, updateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Residência Planner" },
      {
        name: "description",
        content: "Ajuste seu perfil, data da prova, metas semanais e preferências de interface.",
      },
      { property: "og:title", content: "Configurações — Residência Planner" },
      { property: "og:description", content: "Preferências de conta e de estudo." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const profile = useQuery({ queryKey: queryKeys.profile, queryFn: getProfile });

  const [fullName, setFullName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState("20");
  const [questions, setQuestions] = useState("300");

  useEffect(() => {
    if (!profile.data) return;
    setFullName(profile.data.full_name ?? "");
    setExamDate(profile.data.exam_date ?? "");
    setHours(String(profile.data.weekly_hours_goal));
    setQuestions(String(profile.data.weekly_questions_goal));
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        full_name: fullName || null,
        exam_date: examDate || null,
        weekly_hours_goal: Number(hours) || 0,
        weekly_questions_goal: Number(questions) || 0,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Preferências salvas");
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Sua conta e preferências de estudo." />

      <SectionCard title="Perfil" description={user?.email ?? ""}>
        {profile.isLoading && <ListSkeleton rows={3} />}
        {profile.isError && <ErrorState onRetry={() => void profile.refetch()} />}
        {!profile.isLoading && !profile.isError && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Nome</Label>
              <Input id="p-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-exam">Data da prova</Label>
              <Input
                id="p-exam"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="p-hours">Meta de horas / semana</Label>
                <Input
                  id="p-hours"
                  type="number"
                  min={0}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-questions">Meta de questões / semana</Label>
                <Input
                  id="p-questions"
                  type="number"
                  min={0}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="rounded-xl"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Aparência" description="Tema da interface">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Modo escuro</p>
            <p className="text-xs text-muted-foreground">Ideal para estudar à noite.</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </SectionCard>

      <SectionCard title="Conta" description="Encerrar a sessão neste dispositivo">
        <Button variant="outline" className="rounded-xl" onClick={handleSignOut}>
          Sair da conta
        </Button>
      </SectionCard>
    </div>
  );
}
