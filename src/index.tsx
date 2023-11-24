import "./index.css";

import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "./i18n";
import IndexProvider from "api/contexts";

import App from "./App";

ReactDOM.render(
  <BrowserRouter>
    <IndexProvider>
      <App />
    </IndexProvider>
  </BrowserRouter>,
  document.getElementById("root"),
);
