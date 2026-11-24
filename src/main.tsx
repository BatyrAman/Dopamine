import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import DopamineLanding from "./components/DopamineLanding";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DopamineLanding />
  </StrictMode>,
);
