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

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
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
      { index: true, Component: Dashboard },
      { path: "grupos", Component: Grupos },
      { path: "grupos/:groupId/participantes", Component: ParticipantesDoGrupo },
      { path: "participantes", element: <Navigate to="/grupos" replace /> },
      { path: "recursos", Component: Recursos },
      { path: "solicitacoes", Component: Solicitacoes },
      { path: "materiais", Component: Materiais },
      { path: "projetos", Component: Projetos },
      { path: "atividades", Component: Atividades },
      { path: "editais", Component: Editais },
      { path: "eventos", Component: Eventos },
      { path: "calendario", Component: Calendario },
      { path: "publicacoes", Component: Publicacoes },
      { path: "lembretes", Component: Lembretes },
      { path: "gestao-convites", Component: GestaoConvitesCadastro },
    ],
  },
]);

RouterRef.setNavigate((to) => router.navigate(to));