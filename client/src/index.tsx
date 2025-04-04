import { Scroll } from "components/dialog/Scrollbars";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "katex/dist/katex.min.css";
import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Scroll y style={{ height: "100dvh" }}>
      <App />
    </Scroll>
  </BrowserRouter>
);
