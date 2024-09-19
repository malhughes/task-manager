import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LogInPage from "./pages/LogInPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LogInPage />
  </StrictMode>
);
