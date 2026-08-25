import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Grupos } from "./pages/Grupos";
import { ParticipantesDoGrupo } from "./pages/ParticipantesDoGrupo";
import { Participantes } from "./pages/Participantes";
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
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "grupos", Component: Grupos },
      { path: "grupos/:groupId/participantes", Component: ParticipantesDoGrupo },
      { path: "participantes", Component: Participantes },
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
    ],
  },
]);