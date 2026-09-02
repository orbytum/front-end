import { RouterProvider } from "react-router";
import { router } from "./routes";
import { GlobalErrorAlert } from "./components/GlobalErrorAlert";

export default function App() {
  return (
    <>
      <GlobalErrorAlert />
      <RouterProvider router={router} />
    </>
  );
}