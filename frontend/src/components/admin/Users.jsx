import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import Transactions from "./Transactions";
import BulkTransaction from "./BulkTransaction";
import CreateUserForm from "./CreateUserForm";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState("users");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userTxInput, setUserTxInput] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [loginInfoVisible, setLoginInfoVisible] = useState({});
  const [loginInfoData, setLoginInfoData] = useState({});

  const token = localStorage.getItem("adminToken");
  // const currentUser = JSON.parse(localStorage.getItem("user"));

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

  const toggleSubUsers = async (parentId) => {
    if (expandedRows[parentId]) {
      const updated = { ...expandedRows };
      delete updated[parentId];
      setExpandedRows(updated);
      return;
    }

    try {
      const res = await axios.get(`/admin/downline-users?parentId=${parentId}`, axiosConfig);
      setExpandedRows((prev) => ({ ...prev, [parentId]: res.data }));
    } catch (err) {
      console.error("❌ Failed to fetch sub-users:", err);
      alert("Failed to load sub-users");
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

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
    if (window.confirm(`Are you sure you want to ${label}?`)) {
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
    <div className="p-4 text-black bg-amber-50">
  {/* Tabs */}
  <div className="mb-4 flex flex-wrap gap-2">
    <button className="bg-orange-600 text-white px-2 py-1 text-xs rounded" onClick={() => { setSelectedUserId(null); setView("transactions"); }}>
      📄 View My Transactions
    </button>
    <button className="bg-orange-600 text-white px-2 py-1 text-xs rounded" onClick={() => setView("create")}>
      ➕ Create User
    </button>
    <button className="bg-orange-600 text-white px-2 py-1 text-xs rounded" onClick={() => setView("users")}>
      👥 Show Users
    </button>
    <button className="bg-orange-600 text-white px-2 py-1 text-xs rounded" onClick={() => setView("bulk")}>
      💸 Banking
    </button>
  </div>

  {/* Conditional Views */}
  {view === "create" && <CreateUserForm />}
  {view === "transactions" && <Transactions selectedUserId={selectedUserId} />}
  {view === "bulk" && <BulkTransaction />}

  {view === "users" && (
    <>
      <h2 className="text-xl font-semibold mb-4">👥 Downline Users</h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-blue-50">
        <table className="min-w-full border border-gray-300 text-xs">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Points</th>
              <th className="p-2 border">Txn</th>
              <th className="p-2 border">Actions</th>
              <th className="p-2 border">Credit Limit</th>
              <th className="p-2 border">P/L</th>
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
                  <tr className="align-center text-black">
                    <td className={`p-2 border whitespace-nowrap ${u.status === "blocked" ? "text-red-600" : u.status === "suspended" ? "text-yellow-600" : ""}`}>
                      {u.role !== "user" && (
                        <button className=" text-amber-950" onClick={() => toggleSubUsers(u.id)}>
                          {expandedRows[u.id] ? "−➖" : "➕"}
                        </button>
                      )}
                      {u.username}
                    </td>
                    <td className="p-2 border">{u.role}</td>
                    <td className="p-2 border">{points}</td>
                    <td className="p-2 border">
                      <div className="flex flex-wrap items-center gap-1">
                        <input
                          type="number"
                          placeholder="Amt"
                          className="w-16 p-1 border rounded"
                          onChange={(e) => handleInlineInput(u.id, "amount", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Note"
                          className="w-24 p-1 border rounded"
                          onChange={(e) => handleInlineInput(u.id, "note", e.target.value)}
                        />
                        <button
                          className="bg-green-600 text-white px-1.5 py-1 rounded text-xs"
                          onClick={() => handleAction("refill-points", {
                            userId: u.id,
                            amount: parseInt(userTxInput[u.id]?.amount || 0),
                            note: userTxInput[u.id]?.note || "",
                          })}
                        >
                          R
                        </button>
                        <button
                          className="bg-red-600 text-white px-1.5 py-1 rounded text-xs"
                          onClick={() => handleAction("withdraw-points", {
                            userId: u.id,
                            amount: parseInt(userTxInput[u.id]?.amount || 0),
                            note: userTxInput[u.id]?.note || "",
                          })}
                        >
                          W
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => {
                          const pass = prompt("New password?");
                          if (pass) handleAction("reset-password", { userId: u.id, newPassword: pass });
                        }} className="bg-gray-700 text-white px-1.5 py-1 rounded text-xs">🔒</button>

                        {u.status !== "blocked" && (
                          <button onClick={() => confirmAndSend("block user", "block-user", u.id)} className="bg-gray-700 text-white px-1.5 py-1 rounded text-xs">🚫</button>
                        )}
                        {u.status !== "suspended" && (
                          <button onClick={() => confirmAndSend("suspend user", "suspend-user", u.id)} className="bg-gray-700 text-white px-1.5 py-1 rounded text-xs">⏸</button>
                        )}
                        {(u.status === "blocked" || u.status === "suspended") && (
                          <button onClick={() => handleAction("activate-user", { userId: u.id })} className="bg-gray-700 text-white px-1.5 py-1 rounded text-xs">✅</button>
                        )}
                        <button onClick={() => { setSelectedUserId(u.id); setView("transactions"); }} className="bg-gray-700 text-white px-1.5 py-1 rounded text-xs">📄</button>

                        <button
                          className="bg-gray-700 text-white px-1.5 py-1 rounded text-xs"
                          onClick={() => {
                            if (loginInfoVisible[u.id]) {
                              setLoginInfoVisible((prev) => ({ ...prev, [u.id]: false }));
                            } else {
                              axios.get(`/users/${u.id}/login-details`, axiosConfig)
                                .then((res) => {
                                  setLoginInfoData((prev) => ({ ...prev, [u.id]: res.data }));
                                  setLoginInfoVisible((prev) => ({ ...prev, [u.id]: true }));
                                }).catch(() => alert("Failed to load login info"));
                            }
                          }}
                        >
                          {loginInfoVisible[u.id] ? "ⓘ" : "ⓘ"}
                        </button>
                      </div>

                      {loginInfoVisible[u.id] && loginInfoData[u.id] && (
                        <div className="text-xs text-gray-700 mt-1">
                          <p><b>IP:</b> {loginInfoData[u.id].ip}</p>
                          <p><b>Location:</b> {loginInfoData[u.id].location}</p>
                          <p><b>Browser:</b> {loginInfoData[u.id].browser}</p>
                          <p><b>Time:</b> {new Date(loginInfoData[u.id].loginTime).toLocaleString()}</p>
                        </div>
                      )}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {creditLimit}
                      <button
                        className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        onClick={() => {
                          const limit = prompt("Set credit limit:");
                          if (limit) {
                            handleAction("set-credit-limit", { userId: u.id, creditLimit: parseInt(limit) });
                          }
                        }}
                      >
                        ✏️
                      </button>
                    </td>
                    <td className={`p-2 border ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {profitLossFormatted}
                    </td>
                  </tr>

                  {/* Sub-users */}
                  {expandedRows[u.id]?.map((sub) => (
                    <tr key={sub.id} className="bg-gray-50 text-xs">
                      <td className="p-2 border pl-8 text-sm">↳ {sub.username}</td>
                      <td className="p-2 border">{sub.role}</td>
                      <td className="p-2 border">{sub.points}</td>
                      <td className="p-2 border" colSpan={3}>Sub-user view only</td>
                      <td className={`p-2 border ${sub.points - sub.creditLimit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {sub.points - sub.creditLimit >= 0 ? "+" : ""}{sub.points - sub.creditLimit}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>

  );
}
