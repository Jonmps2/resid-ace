import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { friendlyAuthError, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Residência Planner" },
      {
        name: "description",
        content:
          "Acesse sua conta do Residência Planner para acompanhar conteúdos, sessões, questões, revisões e metas.",
      },
      { property: "og:title", content: "Entrar — Residência Planner" },
      {
        property: "og:description",
        content: "Login e cadastro do Residência Planner, seu organizador de estudos para a residência médica.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  component: AuthPage,
});

function safePath(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"entrar" | "criar" | "recuperar">("entrar");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: safePath(redirect), replace: true });
    }
  }, [loading, user, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      } else if (mode === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("confirm");
          toast.success("Conta criada", { description: "Confirme seu e-mail para entrar." });
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
        toast.success("E-mail enviado", { description: "Verifique sua caixa de entrada." });
      }
    } catch (err) {
      toast.error("Não foi possível continuar", {
        description: friendlyAuthError(err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Falha no login com Google", { description: String(result.error) });
      return;
    }
    if (result.redirected) return;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold">Residência Planner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize seus estudos para a prova de residência.
          </p>
        </div>

        <Card className="rounded-2xl p-5 shadow-soft">
          <Tabs
            value={mode === "recuperar" ? "entrar" : mode}
            onValueChange={(v) => {
              setMode(v as "entrar" | "criar");
              setSent(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="criar">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="entrar" />
            <TabsContent value="criar" />
          </Tabs>

          {sent === "confirm" && (
            <p className="mt-4 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
              Enviamos um e-mail de confirmação para {email}.
            </p>
          )}
          {sent === "reset" && (
            <p className="mt-4 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
              Enviamos as instruções de recuperação para {email}.
            </p>
          )}

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {mode === "criar" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </div>
            {mode !== "recuperar" && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete={mode === "criar" ? "new-password" : "current-password"}
                />
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl" disabled={busy}>
              {busy
                ? "Aguarde..."
                : mode === "entrar"
                  ? "Entrar"
                  : mode === "criar"
                    ? "Criar conta"
                    : "Enviar link de recuperação"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleGoogle}
            disabled={busy}
          >
            Continuar com Google
          </Button>

          <div className="mt-4 text-center text-sm">
            {mode === "recuperar" ? (
              <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => setMode("entrar")}>
                Voltar para o login
              </button>
            ) : (
              <button
                type="button"
                className="text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => {
                  setMode("recuperar");
                  setSent(null);
                }}
              >
                Esqueci minha senha
              </button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
