import {
  LayoutDashboard,
  BookOpen,
  Timer,
  ListChecks,
  RotateCcw,
  CalendarDays,
  Target,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  short: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Visão geral", short: "Início", to: "/", icon: LayoutDashboard },
  { label: "Conteúdos", short: "Conteúdos", to: "/conteudos", icon: BookOpen },
  { label: "Sessões de estudo", short: "Sessões", to: "/sessoes", icon: Timer },
  { label: "Questões", short: "Questões", to: "/questoes", icon: ListChecks },
  { label: "Revisões", short: "Revisões", to: "/revisoes", icon: RotateCcw },
  { label: "Planner", short: "Planner", to: "/planner", icon: CalendarDays },
  { label: "Metas e desempenho", short: "Metas", to: "/metas", icon: Target },
  { label: "Configurações", short: "Ajustes", to: "/configuracoes", icon: Settings },
];

/** Itens exibidos na navegação inferior do celular (os demais ficam em "Mais"). */
export const mobilePrimary = navItems.slice(0, 4);
export const mobileSecondary = navItems.slice(4);
