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


export default function Root() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/game" element={<App />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/refill" element={<RefillRequest />} />
      <Route path="/withdraw" element={<WithdrawRequest />} />
      <Route path="/my-requests" element={<MyRequests />} />

      {/* add more routes as needed */}
    </Routes>
  );
}
