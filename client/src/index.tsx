import React from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Scroll } from "components/dialog/Scrollbars";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Scroll y style={{ height: "100vh" }}>
      <App />
    </Scroll>
  </BrowserRouter>
);
