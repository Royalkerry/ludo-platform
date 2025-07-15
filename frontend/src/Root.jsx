// src/Root.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Lobby from "./pages/Lobby";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin"; // ✅
import Login from "./pages/login";

export default function Root() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/game" element={<App />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      {/* add more routes as needed */}
    </Routes>
  );
}
