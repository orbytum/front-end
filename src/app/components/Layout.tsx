import { Outlet, NavLink, Navigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Hexagon,
  FileText,
  Box,
  FolderKanban,
  ListTodo,
  Megaphone,
  CalendarDays,
  Calendar,
  Menu,
  X,
  MailPlus,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { AuthService } from "../services/auth/AuthService";
import { useGrupo } from "../contexts/GrupoContext";
import { GrupoCombobox } from "./GrupoCombobox";
import { SemGrupoView } from "./SemGrupoView";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const authService = new AuthService();

  if (!authService.isAuthenticated()) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  const isAdmin = authService.isAdminOrInitialAdmin();
  const isUser = authService.isUser();
  const { grupoAtual, semGrupos, carregandoGrupos } = useGrupo();

  // Se for usuário comum e não pertencer a nenhum grupo, renderiza tela explicativa
  if (!isAdmin && semGrupos) {
    return <SemGrupoView />;
  }

  // Se estiver buscando os grupos do usuário comum, exibe tela de carregamento
  if (!isAdmin && carregandoGrupos) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#ff8c42] animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">Carregando grupos de pesquisa...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/grupos", label: "Grupos de Pesquisa", icon: Users },
    ...(isAdmin
      ? [{ path: "/gestao-convites", label: "Convites de Cadastro", icon: MailPlus }]
      : []),
    ...(isUser
      ? [{ path: "/publicacoes", label: "Publicações", icon: BookOpen }]
      : []),
    { path: "/recursos", label: "Recursos Financeiros", icon: Hexagon },
    { path: "/solicitacoes", label: "Solicitações", icon: FileText },
    { path: "/materiais", label: "Materiais", icon: Box },
    { path: "/projetos", label: "Projetos", icon: FolderKanban },
    { path: "/atividades", label: "Atividades", icon: ListTodo },
    { path: "/editais", label: "Editais", icon: Megaphone },
    { path: "/eventos", label: "Eventos", icon: CalendarDays },
    { path: "/calendario", label: "Calendário", icon: Calendar },
  ];

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${ sidebarOpen ? "w-64" : "w-20" } bg-card border-r border-border/30 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ff8c42]" />
              <span className="text-foreground font-semibold">SGA</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-border/20 transition-colors cursor-pointer"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-background text-[#ff8c42]"
                    : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${ isActive ? "text-[#ff8c42]" : "text-muted-foreground group-hover:text-foreground" }`}
                  />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/30">
          {sidebarOpen ? (
            <div className="text-xs text-muted-foreground text-center">
              ORBYTUM
              <div className="text-muted-foreground mt-1">v1.0.0</div>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#ff8c42] mx-auto" />
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground font-bold tracking-wide">ORBYTUM</h2>
            <span className="text-muted-foreground/50 font-light select-none">/</span>
            <GrupoCombobox />
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="px-4 py-2 rounded-lg bg-background border border-border/40">
              <span className="text-sm text-muted-foreground">
                {isAdmin ? "Administrador" : (grupoAtual?.role || "Pesquisador")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ff8c42] flex items-center justify-center shadow-md shadow-[#ff8c42]/10">
              <span className="text-white text-sm font-semibold">
                {isAdmin ? "A" : (grupoAtual?.isLider ? "L" : "U")}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
