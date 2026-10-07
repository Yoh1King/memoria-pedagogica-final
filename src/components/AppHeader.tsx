import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/turmas", label: "Turmas" },
  { to: "/registros", label: "Registros" },
] as const;

export function AppHeader() {
  const { session } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The recovery flow stays visually isolated, like login and signup, even when
  // the recovery link itself opens a temporary session.
  if (pathname === "/redefinir-senha") return null;
  if (!session) return null;

  return (
    <header className="border-b border-border bg-card/80">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link to="/" className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">
          Memória Pedagógica
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/registros/novo">
              <Plus className="size-4" />
              Novo Registro
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Configurações">
            <Link to="/configuracoes">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
