// src/components/admin/RefillRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance"; 

export default function RefillRequests() {
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

        // Filter for only "refill" type transactions
        const refillTxs = res.data.filter((tx) => tx.type === "refill");
        setRequests(refillTxs);
      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
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
      alert("❌ Failed to approve request");
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", color: "#333" }}>
      <h2>💰 Refill Requests</h2>
      {requests.length === 0 ? (
        <p>No pending refill requests.</p>
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
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};
