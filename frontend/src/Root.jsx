// src/Root.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Lobby from "../src/components/user/Lobby";
import AdminDashboard from "../src/components/admin/AdminDashboard"; 
import AdminLogin from "./pages/AdminLogin"; // ✅
import Login from "./pages/login";
import RefillRequest from "./components/user/RefillRequest";
import WithdrawRequest from "./components/user/WithdrawRequest";
import MyRequests from "./components/user/MyRequests";
import ResponsiveLayout from "./components/user/layout/ResponsiveLayout";
import Play from "../src/components/user/play"; 


export default function Root() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Layout-Wrapped Routes (for user) */}
      <Route element={<ResponsiveLayout />}>
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/refill" element={<RefillRequest />} />
        <Route path="/withdraw" element={<WithdrawRequest />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/play" element={<Play />} />
      </Route>

      {/* Game and Admin */}
      {/* <Route path="/game" element={<App />} /> */}
    
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}