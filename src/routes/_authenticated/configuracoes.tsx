import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Residência Planner" },
      {
        name: "description",
        content: "Ajuste perfil, metas padrão, aparência e preferências de estudo do Residência Planner.",
      },
      { property: "og:title", content: "Configurações — Residência Planner" },
      { property: "og:description", content: "Perfil, metas padrão e preferências de aparência." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-4">
      <PageHeader title="Configurações" description="Preferências da sua conta e do seu plano de estudos." />

      <SectionCard title="Perfil" description="Como você aparece no app">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" defaultValue="Estudante" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prova">Prova alvo</Label>
            <Input id="prova" defaultValue="ENARE 2027" className="rounded-xl" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Metas padrão" description="Usadas ao criar uma nova semana">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="horas">Horas por semana</Label>
            <Input id="horas" type="number" defaultValue={25} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="questoes">Questões por semana</Label>
            <Input id="questoes" type="number" defaultValue={600} className="rounded-xl" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Aparência" description="Tema da interface">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Modo escuro</p>
            <p className="text-xs text-muted-foreground">Ideal para estudar à noite.</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Modo escuro" />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button className="rounded-xl" onClick={() => toast.success("Preferências salvas")}>
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
