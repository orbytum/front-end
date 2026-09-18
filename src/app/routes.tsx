import { createBrowserRouter, Navigate } from "react-router";
import { RouterRef } from "./utils/RouterRef";
import { Layout } from "./components/Layout";
import { GrupoProvider } from "./contexts/GrupoContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Grupos } from "./pages/Grupos";
import { ParticipantesDoGrupo } from "./pages/ParticipantesDoGrupo";
import { Recursos } from "./pages/Recursos";
import { Solicitacoes } from "./pages/Solicitacoes";
import { Materiais } from "./pages/Materiais";
import { Projetos } from "./pages/Projetos";
import { Atividades } from "./pages/Atividades";
import { Editais } from "./pages/Editais";
import { Eventos } from "./pages/Eventos";
import { Calendario } from "./pages/Calendario";
import { Login } from "./pages/Login";
import { Publicacoes } from "./pages/Publicacoes";
import { Lembretes } from "./pages/Lembretes";
import { AceitarConviteCadastro } from "./pages/AceitarConviteCadastro";
import { AceitarConviteGrupo } from "./pages/AceitarConviteGrupo";
import { GestaoConvitesCadastro } from "./pages/GestaoConvitesCadastro";
import { CriarAdminInicial } from "./pages/CriarAdminInicial";
import { UserOnlyRoute } from "./components/UserOnlyRoute";
import { AdminOnlyRoute } from "./components/AdminOnlyRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/criar-admin-inicial",
    Component: CriarAdminInicial,
  },
  {
    path: "/convite",
    Component: AceitarConviteCadastro,
  },
  {
    path: "/convite/:token",
    Component: AceitarConviteCadastro,
  },
  {
    path: "/convites/aceitar/cadastro/:token",
    Component: AceitarConviteCadastro,
  },
  {
    path: "/convites/aceitar/grupo/:token",
    Component: AceitarConviteGrupo,
  },
  {
    path: "/convite/grupo/:token",
    Component: AceitarConviteGrupo,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <GrupoProvider>
          <Layout />
        </GrupoProvider>
      </ProtectedRoute>
    ),
    children: [
      // Rotas exclusivas de Usuários Comuns (USER)
      {
        index: true,
        element: (
          <UserOnlyRoute>
            <Dashboard />
          </UserOnlyRoute>
        ),
      },
      {
        path: "publicacoes",
        element: (
          <UserOnlyRoute>
            <Publicacoes />
          </UserOnlyRoute>
        ),
      },
      {
        path: "materiais",
        element: (
          <UserOnlyRoute>
            <Materiais />
          </UserOnlyRoute>
        ),
      },
      {
        path: "projetos",
        element: (
          <UserOnlyRoute>
            <Projetos />
          </UserOnlyRoute>
        ),
      },
      {
        path: "atividades",
        element: (
          <UserOnlyRoute>
            <Atividades />
          </UserOnlyRoute>
        ),
      },
      {
        path: "editais",
        element: (
          <UserOnlyRoute>
            <Editais />
          </UserOnlyRoute>
        ),
      },
      {
        path: "eventos",
        element: (
          <UserOnlyRoute>
            <Eventos />
          </UserOnlyRoute>
        ),
      },
      {
        path: "calendario",
        element: (
          <UserOnlyRoute>
            <Calendario />
          </UserOnlyRoute>
        ),
      },
      {
        path: "lembretes",
        element: (
          <UserOnlyRoute>
            <Lembretes />
          </UserOnlyRoute>
        ),
      },

      // Rotas exclusivas de Administradores (ADMIN / INITIAL_ADMIN)
      {
        path: "grupos",
        element: (
          <AdminOnlyRoute>
            <Grupos />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "grupos/:groupId/participantes",
        element: (
          <AdminOnlyRoute>
            <ParticipantesDoGrupo />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "participantes",
        element: (
          <AdminOnlyRoute>
            <Navigate to="/grupos" replace />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "gestao-convites",
        element: (
          <AdminOnlyRoute>
            <GestaoConvitesCadastro />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "recursos",
        element: (
          <AdminOnlyRoute>
            <Recursos />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "solicitacoes",
        element: (
          <AdminOnlyRoute>
            <Solicitacoes />
          </AdminOnlyRoute>
        ),
      },
    ],
  },
]);

RouterRef.setNavigate((to) => router.navigate(to));