import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Residência Planner" },
      { name: "description", content: "Defina uma nova senha para sua conta do Residência Planner." },
      { property: "og:title", content: "Nova senha — Residência Planner" },
      { property: "og:description", content: "Redefinição de senha da conta do Residência Planner." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível alterar a senha", {
        description: friendlyAuthError(error.message),
      });
      return;
    }
    toast.success("Senha atualizada");
    void navigate({ to: "/", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md rounded-2xl p-5 shadow-soft">
        <h1 className="font-display text-xl font-bold">Definir nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha uma senha com pelo menos 6 caracteres.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={busy}>
            {busy ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
