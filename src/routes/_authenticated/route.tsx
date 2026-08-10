import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapUser } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();

  // Garante perfil + as cinco grandes áreas no primeiro acesso (idempotente).
  useQuery({
    queryKey: ["bootstrap", user.id],
    queryFn: async () => {
      await bootstrapUser(
        (user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? null,
      );
      return true;
    },
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
