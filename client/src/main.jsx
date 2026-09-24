import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ValuesVisibilityProvider } from "./context/ValuesVisibilityContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ValuesVisibilityProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ValuesVisibilityProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
