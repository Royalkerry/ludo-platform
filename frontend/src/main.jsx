// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Root from "./Root";
import "./index.css";
import { GameProvider } from "./ludo/context/GameContext"; 


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <GameProvider>
    <Root />
    </GameProvider>
</BrowserRouter>
);
