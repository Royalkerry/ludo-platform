import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function Transactions({ selectedUserId = null }) {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchTransactions = async (customStart = null, customEnd = null) => {
    if (!token) {
      setError("Token missing. Please login again.");
      return;
    }

    try {
      const params = {};
      if (selectedUserId) params.userId = selectedUserId;

      if (customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      } else if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await axios.get("/transactions", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data);
      setError("");
    } catch (err) {
      console.error("❌ Transaction fetch error:", err);
      setError("Transaction fetch error");
    }
  };

  useEffect(() => {
    if (token) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayStr = today.toISOString().split("T")[0];
      const yestStr = yesterday.toISOString().split("T")[0];

      setStartDate(todayStr);
      setEndDate(todayStr);
      fetchTransactions(todayStr, todayStr);
    }
  }, [selectedUserId]);

  const handleToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
    fetchTransactions(todayStr, todayStr);
  };

  const handleYesterday = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    const startStr = yesterday.toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];
  
    setStartDate(startStr);
    setEndDate(endStr);
    fetchTransactions(startStr, endStr);
  };

  const handleCustomRange = () => {
    if (startDate && endDate) {
      fetchTransactions(startDate, endDate);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>🧾 Transaction History</h3>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleToday}>Get Today</button>
        <button onClick={handleYesterday} style={{ marginLeft: "10px" }}>
          From Yesterday
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          From:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          To:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={handleCustomRange} style={{ marginLeft: "20px" }}>
          Filter
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#ef320a", color: "white" }}>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Note</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} style={tdStyle}>
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.user?.username || "-"}</td>
                <td style={tdStyle}>{t.type}</td>
                <td
                  style={{
                    ...tdStyle,
                    color: t.type === "refill" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {t.amount}
                </td>
                <td style={tdStyle}>{t.status}</td>
                <td style={tdStyle}>
                  {new Date(t.requestedAt).toLocaleString()}
                </td>
                <td style={tdStyle}>{t.note || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc",
};
