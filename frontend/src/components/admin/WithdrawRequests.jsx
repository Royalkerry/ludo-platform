// src/components/admin/WithdrawRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance"; 

export default function WithdrawRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/transaction/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter for "withdraw" type
        const withdrawTxs = res.data.filter((tx) => tx.type === "withdraw");
        setRequests(withdrawTxs);
      } catch (err) {
        console.error("❌ Error fetching withdraws:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  const handleApprove = async (transactionId) => {
    try {
      await axios.post(
        "/transaction/approve",
        { transactionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests((prev) => prev.filter((r) => r.id !== transactionId));
    } catch (err) {
      alert("❌ Failed to approve withdrawal");
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", color: "#333" }}>
      <h2>💸 Withdraw Requests</h2>
      {requests.length === 0 ? (
        <p>No pending withdraw requests.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={cell}>User ID</th>
              <th style={cell}>Amount</th>
              <th style={cell}>Requested At</th>
              <th style={cell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td style={cell}>{req.userId}</td>
                <td style={cell}>{req.amount}</td>
                <td style={cell}>{new Date(req.createdAt).toLocaleString()}</td>
                <td style={cell}>
                  <button onClick={() => handleApprove(req.id)} style={btn}>
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cell = {
  border: "1px solid #ccc",
  padding: "8px",
};

const btn = {
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};
