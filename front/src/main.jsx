import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Theme } from "./context/ThemeContext";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
  <Theme>

      <AuthProvider>
        <App />
      </AuthProvider>
      </Theme>
    </BrowserRouter>

  </StrictMode>
);