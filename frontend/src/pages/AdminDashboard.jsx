// // working file 

import React, {useState} from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminContent from "../components/AdminContent";

export default function AdminDashboard() {
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

