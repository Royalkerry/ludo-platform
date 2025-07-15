import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import LobbySidebar from "@/components/user/LobbySidebar";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/user/my-requests");
        setRequests(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch requests:", err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ✅ Reused Sidebar with user name and balance */}
      <LobbySidebar />

      {/* Main content */}
      <div style={{ flex: 1, padding: "40px", color: "#333" }}>
        <h2 className="text-xl font-bold mb-4">📋 My Refill & Withdrawal Requests</h2>

        {requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Note</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Requested At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td style={tdStyle}>{req.type}</td>
                  <td style={tdStyle}>{req.amount}</td>
                  <td style={tdStyle}>{req.note || "-"}</td>
                  <td style={tdStyle}>{req.status}</td>
                  <td style={tdStyle}>{new Date(req.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Optional Back Button */}
        <button
          onClick={() => navigate("/lobby")}
          style={{
            marginTop: "30px",
            padding: "10px 20px",
            backgroundColor: "#555",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ⬅️ Back to Lobby
        </button>
      </div>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#eee",
  textTransform: "capitalize",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
