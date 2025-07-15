// // working file 

import React, {useState} from "react";
import AdminSidebar from "./AdminSidebar";
import AdminContent from "./AdminContent";
import useRoleGuard from "@/hooks/useRoleGuard";


export default function AdminDashboard() {
  useRoleGuard("admin");
  const [selected, setSelected] = useState("users");
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AdminSidebar onSelect={setSelected} />
      <div style={{ flex: 1, background: "#f4f4f4", padding: "20px" }}>
        <AdminContent selected={selected} />
      </div>
    </div>
  );
}

