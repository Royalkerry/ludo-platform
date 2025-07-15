// not working file 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import AdminSidebar from "../components/AdminSidebar";
import AdminContent from "../components/AdminContent";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("users");
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "player",
    uplinkId: "",
  });
  const token = localStorage.getItem("adminToken");
  useEffect(() => {
    
    if (!token) {
      navigate("/admin-login");
      return;
    }

    axios
      .get("/auth/downline-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUserList(res.data))
      .catch((err) => {
        console.error("Error fetching users", err);
        alert("Session expired or not authorized");
        localStorage.removeItem("adminToken");
        navigate("/admin-login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AdminSidebar />
      <AdminContent />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "sans-serif",
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#111",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    marginBottom: "40px",
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center",
  },
  menu: {
    listStyle: "none",
    padding: 0,
  },
  menuItem: {
    margin: "10px 0",
    cursor: "pointer",
  },
  logoutBtn: {
    marginTop: "auto",
    backgroundColor: "#f00",
    color: "#fff",
    padding: "10px",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  content: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#f4f4f4",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  th: {
    backgroundColor: "#eee",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
  },
};
