import { Outlet, NavLink, Navigate, useLocation } from "react-router";
import {
  UserCog,
  LayoutDashboard,
  Users,
  Hexagon,
  FileText,
  Box,
  FolderKanban,
  ListTodo,
  Newspaper,
  Calendar,
  Menu,
  X,
  MailPlus,
  Loader2,
  BookOpen,
  Bell,
  Telescope,
} from "lucide-react";
import { useState } from "react";
import { AuthService } from "../services/auth/AuthService";
import { useGrupo } from "../contexts/GrupoContext";
import { GrupoCombobox } from "./GrupoCombobox";
import { SemGrupoView } from "./SemGrupoView";
import { ThemeToggle } from "./ThemeToggle";
import { PerfilMenu } from "./PerfilMenu";
import { CabecalhoContext } from "../contexts/CabecalhoContext";
import { LogoOrbytum } from "./LogoOrbytum";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Título definido pela própria página (ex.: nome do grupo); sem ele, vale o nome da rota
  const [tituloPagina, setTituloPagina] = useState<string | null>(null);
  const location = useLocation();
  const authService = new AuthService();

  if (!authService.isAuthenticated()) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  const isAdmin = authService.isAdminOrInitialAdmin();
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
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">Carregando grupos de pesquisa...</span>
        </div>
      </div>
    );
  }

  // Admin tem acesso estrito a Convites de cadastro, Grupos, Solicitações e Recursos Financeiros
  // Usuários têm acesso estrito ao restante
  const navItems = isAdmin
    ? [
        { path: "/grupos", label: "Grupos de Pesquisa", icon: Users },
        { path: "/gestao-convites", label: "Convites de Cadastro", icon: MailPlus },
        { path: "/usuarios", label: "Usuários", icon: UserCog },
        { path: "/recursos", label: "Recursos Financeiros", icon: Hexagon },
        { path: "/solicitacoes", label: "Solicitações", icon: FileText },
      ]
    : [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/projetos", label: "Painel de Projetos", icon: FolderKanban },
        { path: "/atividades", label: "Atividades", icon: ListTodo },
        { path: "/editais", label: "Editais e Eventos", icon: Telescope },
        { path: "/noticias", label: "Notícias", icon: Newspaper },
        { path: "/calendario", label: "Calendário", icon: Calendar },
        { path: "/materiais", label: "Materiais", icon: Box },
        { path: "/lembretes", label: "Lembretes", icon: Bell },
        { path: "/solicitacoes", label: "Solicitações", icon: FileText },
      ];

  // Nome da página atual no header: rótulo do menu da rota (ou de uma rota fora do menu)
  const ROTAS_FORA_DO_MENU: { prefixo: string; label: string }[] = [
    { prefixo: "/grupos/", label: "Grupos de Pesquisa" },
    { prefixo: "/participantes", label: "Participantes" },
    { prefixo: "/publicacoes", label: "Publicações" },
  ];
  const caminho = location.pathname;
  const nomeRota =
    ROTAS_FORA_DO_MENU.find((r) => caminho.startsWith(r.prefixo))?.label ??
    navItems.find((item) =>
      item.path === "/" ? caminho === "/" : caminho === item.path || caminho.startsWith(`${item.path}/`)
    )?.label ??
    null;
  const trilha = [nomeRota, tituloPagina].filter(Boolean) as string[];

  return (
    <CabecalhoContext.Provider value={{ definirTitulo: setTituloPagina }}>
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${ sidebarOpen ? "w-64" : "w-20" } bg-card border-r border-border/30 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
          {sidebarOpen && (
            <LogoOrbytum tamanho={30} comNome classeNome="text-xl" />
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
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-background text-primary font-medium"
                    : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${ isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground" }`}
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
            <LogoOrbytum tamanho={22} className="mx-auto flex justify-center" />
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative z-50 h-16 bg-card/50 backdrop-blur-sm border-b border-border/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="shrink-0 -mb-2">
              <LogoOrbytum tamanho={24} comNome classeNome="text-lg" />
            </h2>
            {!isAdmin && (
              <>
                <span className="text-muted-foreground/50 font-light select-none">/</span>
                <GrupoCombobox />
              </>
            )}
            {trilha.map((parte, i) => (
              <span key={`${i}-${parte}`} className="hidden sm:flex items-center gap-3 min-w-0">
                <span className="text-muted-foreground/50 font-light select-none">/</span>
                <span
                  className={`text-md font-bold truncate max-w-[16rem] ${
                    i === trilha.length - 1 ? "text-foreground" : "text-muted-foreground"
                  }`}
                  title={parte}
                >
                  {parte}
                </span>
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="px-4 py-2 rounded-lg bg-background border border-border/40">
              <span className="text-sm text-muted-foreground">
                {isAdmin ? "Administrador" : (grupoAtual?.role || "Pesquisador")}
              </span>
            </div>
            <PerfilMenu
              isAdmin={isAdmin}
              role={grupoAtual?.role || "Pesquisador"}
              avatarLabel={isAdmin ? "A" : (grupoAtual?.isLider ? "L" : "U")}
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
    </CabecalhoContext.Provider>
  );
}
