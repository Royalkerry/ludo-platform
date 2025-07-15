import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function BulkTransaction() {
  const [users, setUsers] = useState([]);
  const [txData, setTxData] = useState({});
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/admin/downline-users")
      .then(res => setUsers(res.data))
      .catch(() => alert("Failed to load users"));
  }, []);

  const handleChange = (userId, field, value) => {
    setTxData(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    const transactions = Object.entries(txData).map(([userId, data]) => ({
      userId: parseInt(userId),
      amount: parseInt(data.amount),
      type: data.type,
      note: data.note || ""
    })).filter(t => !isNaN(t.amount) && t.amount > 0 && t.type);

    if (transactions.length === 0) {
      setMessage("❌ Please fill at least one valid transaction.");
      return;
    }

    try {
      const res = await axios.post("/admin/bulk-transact", { transactions, password });
      setMessage("✅ Transactions successful");
      setTxData({});
      setPassword("");
    } catch (err) {
      console.error("Bulk Transaction Error:", err.response?.data || err);
      setMessage("❌ Error: " + (err.response?.data?.error || "Request failed"));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚡ Bulk Transaction Panel</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#333", color: "white" }}>
            <th>Username</th>
            <th>Amount</th>
            <th>Note</th>
            <th>Action</th>
            <th>Credit Limit</th>
            <th>Current Points</th>
            <th>Profit / Loss</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const credit = user.creditLimit || 0;
            const profitLoss = user.points - credit;
            const selectedType = txData[user.id]?.type;

            return (
              <tr key={user.id}>
                <td>{user.username}</td>

                <td>
                  <input
                    type="number"
                    style={{ width: "80px" }}
                    value={txData[user.id]?.amount || ""}
                    onChange={(e) => handleChange(user.id, "amount", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="text"
                    placeholder="Optional note"
                    value={txData[user.id]?.note || ""}
                    onChange={(e) => handleChange(user.id, "note", e.target.value)}
                  />
                </td>

                <td>
                  <button
                    onClick={() => handleChange(user.id, "type", "refill")}
                    style={{
                      background: selectedType === "refill" ? "green" : "#ccc",
                      color: "white",
                      marginRight: "5px",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    R
                  </button>
                  <button
                    onClick={() => handleChange(user.id, "type", "withdraw")}
                    style={{
                      background: selectedType === "withdraw" ? "red" : "#ccc",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    W
                  </button>
                </td>

                <td>
                  {credit}
                  <button
                    onClick={() => {
                      const limit = prompt(`Set new credit limit for ${user.username}:`, credit);
                      if (!limit) return;
                      axios.post("/admin/set-credit-limit", {
                        userId: user.id,
                        creditLimit: parseInt(limit)
                      }).then(() => {
                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, creditLimit: parseInt(limit) } : u));
                      }).catch(() => alert("❌ Failed to update credit limit"));
                    }}
                    style={{
                      marginLeft: "6px",
                      background: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer"
                    }}
                  >
                    ✏️
                  </button>
                </td>

                <td>{user.points}</td>

                <td style={{ color: profitLoss < 0 ? "red" : "green" }}>
                  {profitLoss >= 0 ? `+${profitLoss}` : profitLoss}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleSubmit} style={{ padding: "6px 12px" }}>🚀 Submit</button>
      </div>

      {message && (
        <p style={{ marginTop: "15px", color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
