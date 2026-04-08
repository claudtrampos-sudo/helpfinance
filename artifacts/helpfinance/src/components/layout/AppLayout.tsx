import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  MessageSquare, 
  Trophy, 
  Target,
  Menu,
  Wallet,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/gamification", label: "Conquistas", icon: Trophy },
  { href: "/ai-chat", label: "Assistente IA", icon: MessageSquare },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Barra lateral (desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
        <div className="px-6 pt-6 pb-5 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary to-blue-500 p-2 rounded-xl shadow-md shadow-primary/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              HelpFinance
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug pl-1">
            Seu dinheiro sob controle,<br />de forma inteligente.
          </p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm shadow-primary/20">
              JS
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">João Silva</p>
              <p className="text-xs text-muted-foreground truncate">joao@email.com</p>
            </div>
            <User className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
          </div>
        </div>
      </aside>

      {/* Navegação mobile e conteúdo principal */}
      <div className="flex-1 flex flex-col max-h-[100dvh]">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-blue-500 p-1.5 rounded-lg shadow-sm shadow-primary/30">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              HelpFinance
            </span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6">
                <span className="font-display font-bold text-xl text-foreground">
                  HelpFinance
                </span>
              </div>
              <nav className="px-4 space-y-2">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
