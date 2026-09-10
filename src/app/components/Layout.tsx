import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserCheck,
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
} from "lucide-react";
import { useState } from "react";
import { authApi } from "@/api";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isAdmin = authApi.isAdminOrInitialAdmin();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/grupos", label: "Grupos de Pesquisa", icon: Users },
    { path: "/participantes", label: "Participantes", icon: UserCheck },
    ...(isAdmin
      ? [{ path: "/gestao-convites", label: "Convites de Cadastro", icon: MailPlus }]
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
    <div className="flex h-full bg-[#0a1929]">
      {/* Sidebar */}
      <aside
        className={`${ sidebarOpen ? "w-64" : "w-20" } bg-[#0d1f30] border-r border-[#3d4f62]/30 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#3d4f62]/30">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ff8c42]" />
              <span className="text-white font-semibold">SGA</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#3d4f62]/20 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-[#8b96a5]" />
            ) : (
              <Menu className="w-5 h-5 text-[#8b96a5]" />
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
                    ? "bg-[#0a1929] text-[#ff8c42]"
                    : "hover:bg-[#0a1929]/50 text-[#8b96a5] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${ isActive ? "text-[#ff8c42]" : "text-[#8b96a5] group-hover:text-white" }`}
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
        <div className="p-4 border-t border-[#3d4f62]/30">
          {sidebarOpen ? (
            <div className="text-xs text-[#8b96a5] text-center">
              ORBYTUM
              <div className="text-[#3d4f62] mt-1">v1.0.0</div>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#ff8c42] mx-auto" />
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0d1f30]/50 backdrop-blur-sm border-b border-[#3d4f62]/30 flex items-center justify-between px-6">
          <div>
            <h2 className="text-white">ORBYTUM</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-[#0a1929]">
              <span className="text-sm text-[#8b96a5]">Administrador</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ff8c42] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
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
