import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

import { App as OneApp } from './OneApp.jsx';
if (!location.pathname.replace(import.meta.env.BASE_URL, '/').startsWith('/one1')) import('./cyber.css');
else document.title = 'ONE:1 — A Cinematic Study';
const Experience = location.pathname.replace(import.meta.env.BASE_URL, '/').startsWith('/one1') ? OneApp : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Experience />
  </React.StrictMode>,
);
