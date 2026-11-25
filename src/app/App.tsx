import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GlobalErrorAlert } from "./components/GlobalErrorAlert";
import { ConfirmacaoProvider } from "./contexts/ConfirmacaoContext";

export default function App() {
  return (
    <ConfirmacaoProvider>
      <GlobalErrorAlert />
      <RouterProvider router={router} />
    </ConfirmacaoProvider>
  );
}
