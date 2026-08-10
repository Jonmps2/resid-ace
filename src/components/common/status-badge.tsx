import { cn } from "@/lib/utils";

export type StatusMeta = "concluido" | "pendente" | "atrasado";

const styles: Record<StatusMeta, string> = {
  concluido: "bg-success-soft text-success",
  pendente: "bg-warning-soft text-warning-foreground",
  atrasado: "bg-danger-soft text-destructive",
};

const labels: Record<StatusMeta, string> = {
  concluido: "Concluído",
  pendente: "Pendente",
  atrasado: "Atrasada",
};

export function StatusBadge({ status, className }: { status: StatusMeta; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
