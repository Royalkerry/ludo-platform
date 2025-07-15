// ✅ Updated Users.jsx with inline refill/withdraw UI
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import Transactions from "./Transactions";
import BulkTransaction from "./BulkTransaction"; // ✅ Add this

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [view, setView] = useState("users");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userTxInput, setUserTxInput] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [loginInfoVisible, setLoginInfoVisible] = useState({});
  const [loginInfoData, setLoginInfoData] = useState({});

  const [isSuspended, setIsSuspended] = useState(false); // susoend button showing 

  const token = localStorage.getItem("adminToken");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const allowedRoles = {
    creator: ["superadmin", "admin", "master", "user"],
    superadmin: ["admin"],
    admin: ["master"],
    master: ["user"],
  };

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/downline-users", axiosConfig);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };
  // sub suer
  const fetchSubUsers = async (parentId) => {
    try {
      const res = await axios.get(`/admin/downline-users?parentId=${parentId}`, axiosConfig);
      setExpandedRows((prev) => ({
        ...prev,
        [parentId]: res.data
      }));
    } catch (err) {
      console.error("Failed to fetch sub-users", err);
    }
  };


  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleInputChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admin/create", form, axiosConfig);
      setForm({ username: "", password: "", role: "user" });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to create user:", err);
      alert("Failed to create user");
    }
  };

  const handleAction = async (endpoint, payload) => {
    try {
      await axios.post(`/admin/${endpoint}`, payload, axiosConfig);
      fetchUsers();
    } catch (err) {
      console.error(`❌ Failed to ${endpoint}:`, err);
      alert(`Failed to ${endpoint}`);
    }
  };

  const confirmAndSend = (label, endpoint, userId) => {
    const confirm = window.confirm(`Are you sure you want to ${label}?`);
    if (confirm) {
      handleAction(endpoint, { userId });
    }
  };

  const handleInlineInput = (userId, field, value) => {
    setUserTxInput((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  return (
    <div style={{ padding: "20px", color: "#333" }}>
      {/* 🔘 Top Menu Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button style={tabBtn} onClick={() => {
          setSelectedUserId(null);
          setView("transactions");
        }}>📄 View My Transactions</button>
        

        <button style={tabBtn} onClick={() => setView("create")}>➕ Create New User</button>

        <button style={tabBtn} onClick={() => setView("users")}>👥 Show Users</button>

        <button style={tabBtn} onClick={() => setView("bulk")}>💸 Bulk Transaction</button>
      </div>

      {/* 👤 Create Form */}
      {view === "create" && (
        <form onSubmit={handleCreateUser} style={formBox}>
          <h3>Create New Downlink User</h3>
          <input type="text" name="username" value={form.username} onChange={handleInputChange} placeholder="Username" required style={inputStyle} />
          <input type="password" name="password" value={form.password} onChange={handleInputChange} placeholder="Password" required style={inputStyle} />
          <select name="role" value={form.role} onChange={handleInputChange} style={inputStyle}>
            {allowedRoles[currentUser.role]?.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
          <button type="submit" style={buttonStyle}>Create User</button>
        </form>
      )}

      {/* 📄 Transaction View */}
      {view === "transactions" && (
        <>
          <Transactions selectedUserId={selectedUserId} />
          <button style={tabBtn} onClick={() => setView("users")}>🔙 Back to Users</button>
        </>
      )}

      {/* 👥 User Table */}
      {view === "users" && (
        <>
          <h2>👥 Downline Users</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#ef320a", color: "#fff" }}>
                <th style={cellStyle}>Username</th>
                <th style={cellStyle}>Role</th>
                <th style={cellStyle}>Points</th>
                <th style={cellStyle}>Txn</th>
                <th style={cellStyle}>Actions</th>
                <th style={cellStyle}>Credit Limit</th>
                <th style={cellStyle}>P/L</th>
              </tr>
            </thead>
            <tbody>
  {users.map((u) => {
    const creditLimit = u.creditLimit || 0;
    const points = u.points || 0;
    const profitLoss = points - creditLimit;
    const profitLossFormatted = `${profitLoss >= 0 ? "+" : ""}${profitLoss}`;

    return (
      <React.Fragment key={u.id}>
        <tr>
          <td style={{ ...cellStyle, color:
            u.status === "blocked"
              ? "red"
              : u.status === "suspended"
              ? "#e6b800"
              : "inherit"
          }}>
            <button
             style={{
              marginRight: "5px",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "16px", // optional: adjust size
              lineHeight: 1,
              color: "red",
            }}
              onClick={() => {
                if (expandedRows[u.id]) {
                  const updated = { ...expandedRows };
                  delete updated[u.id];
                  setExpandedRows(updated);
                } else {
                  axios
                    .get(`/admin/downline-users?parentId=${u.id}`, axiosConfig)
                    .then((res) => {
                      setExpandedRows((prev) => ({ ...prev, [u.id]: res.data }));
                    })
                    .catch((err) => {
                      console.error("Failed to fetch sub-users", err);
                      alert("Failed to fetch sub-users");
                    });
                }
              }}
            >
              {expandedRows[u.id] ? "-" : "+"}
            </button>
            {u.username}
          </td>
          <td style={cellStyle}>{u.role}</td>
          <td style={cellStyle}>{points}</td>
          <td style={cellStyle}>
            <input
              type="number"
              placeholder="Amt"
              style={{ width: "60px", marginRight: "5px" }}
              onChange={(e) => handleInlineInput(u.id, "amount", e.target.value)}
            />
            <input
              type="text"
              placeholder="Note"
              style={{ width: "100px", marginRight: "5px" }}
              onChange={(e) => handleInlineInput(u.id, "note", e.target.value)}
            />
            <button
              onClick={() => handleAction("refill-points", {
                userId: u.id,
                amount: parseInt(userTxInput[u.id]?.amount || 0),
                note: userTxInput[u.id]?.note || "",
              })}
              style={{ ...miniBtn, backgroundColor: "green" }}
            >R</button>
            <button
              onClick={() => handleAction("withdraw-points", {
                userId: u.id,
                amount: parseInt(userTxInput[u.id]?.amount || 0),
                note: userTxInput[u.id]?.note || "",
              })}
              style={{ ...miniBtn, backgroundColor: "red", marginLeft: "5px" }}
            >W</button>
          </td>
          <td style={cellStyle}>
            <button onClick={() => {
              const pass = prompt("New password?");
              if (pass) handleAction("reset-password", { userId: u.id, newPassword: pass });
            }} style={actionBtn}>🔒 Reset</button>

            {u.status !== "blocked" && (
              <button onClick={() => confirmAndSend("block user", "block-user", u.id)} style={actionBtn}>🚫 Block</button>
            )}
            {u.status !== "suspended" && (
              <button onClick={() => confirmAndSend("suspend user", "suspend-user", u.id)} style={actionBtn}>⏸ Suspend</button>
            )}
            {(u.status === "blocked" || u.status === "suspended") && (
              <button onClick={() => handleAction("activate-user", { userId: u.id })} style={actionBtn}>✅ Activate</button>
            )}

            <button onClick={() => {
              setSelectedUserId(u.id);
              setView("transactions");
            }} style={actionBtn}>📄 View Txns</button>
            <button
  style={{
    background: "none",
    border: "1px solid #ccc",
    padding: "5px 10px",
    cursor: "pointer",
    color: "blue",
    borderRadius: "4px",
  }}
  onClick={() => {
    if (loginInfoVisible[u.id]) {
      setLoginInfoVisible((prev) => ({ ...prev, [u.id]: false }));
    } else {
      axios
  .get(`/users/${u.id}/login-details`) // ✅ No need to manually add /api
  .then((res) => {
    setLoginInfoData((prev) => ({ ...prev, [u.id]: res.data }));
    setLoginInfoVisible((prev) => ({ ...prev, [u.id]: true }));
  })
  .catch((err) => {
    console.error("❌ Failed to fetch login info", err);
    alert("Error fetching login details");
  });
    }
  }}
>
  {loginInfoVisible[u.id] ? "Hide Login Details" : "Show Login Details"}
</button>
{loginInfoVisible[u.id] && loginInfoData[u.id] && (
  <div style={{ fontSize: "13px", color: "#333", marginTop: "5px" }}>
    <p><b>IP:</b> {loginInfoData[u.id].ip}</p>
    <p><b>Location:</b> {loginInfoData[u.id].location}</p>
    <p><b>Browser:</b> {loginInfoData[u.id].browser}</p>
    <p><b>Time:</b> {new Date(loginInfoData[u.id].loginTime).toLocaleString()}</p>
  </div>
)}

          </td>
          <td style={cellStyle}>
            {creditLimit}
            <button
              onClick={() => {
                const limit = prompt("Set credit limit:");
                if (!limit) return;
                handleAction("set-credit-limit", { userId: u.id, creditLimit: parseInt(limit) });
              }}
              style={{ ...miniBtn, backgroundColor: "#ff9800", marginLeft: "5px" }}
            >✏️</button>
          </td>
          <td style={{ ...cellStyle, color: profitLoss >= 0 ? "green" : "red" }}>
            {profitLossFormatted}
          </td>
        </tr>

        {/* 🔽 Sub-users (only 1 level deep) */}
        {expandedRows[u.id] && expandedRows[u.id]
        .filter((sub) => sub.id !== u.id)
        .map((sub) => {
          const credit = sub.creditLimit || 0;
          const subPoints = sub.points || 0;
          const pl = subPoints - credit;
          const plFormatted = `${pl >= 0 ? "+" : ""}${pl}`;

          return (
            <tr key={sub.id} style={{ backgroundColor: "#f9f9f9" }}>
              <td style={{ ...cellStyle, paddingLeft: "30px", color:
                sub.status === "blocked"
                  ? "red"
                  : sub.status === "suspended"
                  ? "#e6b800"
                  : "inherit"
              }}>
                ↳ {sub.username}
              </td>
              <td style={cellStyle}>{sub.role}</td>
              <td style={cellStyle}>{subPoints}</td>
              {/* <td style={cellStyle} colSpan={4}>Sub-user view only</td> */}
              <td style={cellStyle}>hidden</td>
              <td style={cellStyle}>hidden</td>
              <td style={cellStyle}>hidden</td>
          <td style={{ ...cellStyle, color: pl >= 0 ? "green" : "red" }}>
            {plFormatted}
          </td>
            </tr>
          );
        })}
      </React.Fragment>
    );
  })}
</tbody>

          </table>
        </>
      )}

      {/* 💸 Bulk Transaction View */}
      {view === "bulk" && (
        <>
          <BulkTransaction />
          <button style={tabBtn} onClick={() => setView("users")}>🔙 Back to Users</button>
        </>
      )}
    </div>
  );
}

// 🔧 Styles
const inputStyle = {
  padding: "8px",
  marginRight: "10px",
  marginBottom: "10px",
  width: "200px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#ef320a",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const tabBtn = {
  ...buttonStyle,
  marginRight: "10px",
};

const formBox = {
  marginBottom: "30px",
  background: "#f5f5f5",
  padding: "20px",
  borderRadius: "10px"
};

const cellStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
};

const actionBtn = {
  padding: "4px 8px",
  margin: "0 5px",
  backgroundColor: "#333",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};

const miniBtn = {
  padding: "2px 6px",
  marginLeft: "5px",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "10px",
  cursor: "pointer",
};
