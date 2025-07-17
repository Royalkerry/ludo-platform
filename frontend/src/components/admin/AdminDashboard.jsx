// // working file 

import React, {useState} from "react";
import AdminSidebar from "./AdminSidebar";
import AdminContent from "./AdminContent";
import useRoleGuard from "@/hooks/useRoleGuard";
import AdminLayout from "./AdminLayout";


export default function AdminDashboard() {
  useRoleGuard("admin");
  // const [selected, setSelected] = useState("users");
  return (
    <AdminLayout>
    <h1 className="text-2xl font-bold text-gray-800 mb-4">👋 Welcome to Admin Panel</h1>
    <div className="bg-white text-black text-sm leading-tight">Dashboard content goes here...</div>
  </AdminLayout>
  );
}

