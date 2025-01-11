import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import App from "./App";

// Mensajes de consola para depuración
console.log("Rendering App component...");
console.log("Rendering CssBaseline component...");
console.log("Rendering React app to DOM...");

// Renderiza la aplicación
ReactDOM.render(
  <React.StrictMode>
    <CssBaseline>
      <App />
    </CssBaseline>
  </React.StrictMode>,
  document.getElementById("root")
);