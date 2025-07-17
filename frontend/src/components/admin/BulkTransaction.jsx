import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function BulkTransaction() {
  const [users, setUsers] = useState([]);
  const [txData, setTxData] = useState({});
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(1);
  const usersPerPage = 5;
  const totalPages = Math.ceil(users.length / usersPerPage);

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
      await axios.post("/admin/bulk-transact", { transactions, password });
      setMessage("✅ Transactions successful");
      setTxData({});
      setPassword("");
    } catch (err) {
      console.error("Bulk Transaction Error:", err.response?.data || err);
      setMessage("❌ Error: " + (err.response?.data?.error || "Request failed"));
    }
  };

  const paginatedUsers = users.slice((page - 1) * usersPerPage, page * usersPerPage);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded shadow text-black">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">⚡ Bulk Transaction Panel</h2>

      <div className="overflow-auto rounded-md">
        <table className="min-w-full border-collapse border text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Note</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Credit Limit</th>
              <th className="p-2 border">Points</th>
              <th className="p-2 border">P / L</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => {
              const credit = user.creditLimit || 0;
              const profitLoss = user.points - credit;
              const selectedType = txData[user.id]?.type;

              return (
                <tr key={user.id} className="border-t dark:border-gray-700">
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
                      value={txData[user.id]?.amount || ""}
                      onChange={(e) => handleChange(user.id, "amount", e.target.value)}
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="text"
                      placeholder="Note"
                      className="w-full px-2 py-1 border rounded dark:bg-gray-800 dark:text-white"
                      value={txData[user.id]?.note || ""}
                      onChange={(e) => handleChange(user.id, "note", e.target.value)}
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleChange(user.id, "type", "refill")}
                      className={`text-xs px-2 py-1 rounded mr-1 ${
                        selectedType === "refill" ? "bg-green-600 text-white" : "bg-gray-300"
                      }`}
                    >
                      R
                    </button>
                    <button
                      onClick={() => handleChange(user.id, "type", "withdraw")}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedType === "withdraw" ? "bg-red-600 text-white" : "bg-gray-300"
                      }`}
                    >
                      W
                    </button>
                  </td>
                  <td className="p-2 border text-right font-mono">
                    {credit}
                    <button
                      onClick={() => {
                        const limit = prompt(`Set credit limit for ${user.username}:`, credit);
                        if (!limit) return;
                        axios.post("/admin/set-credit-limit", {
                          userId: user.id,
                          creditLimit: parseInt(limit)
                        }).then(() => {
                          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, creditLimit: parseInt(limit) } : u));
                        }).catch(() => alert("❌ Failed to update credit limit"));
                      }}
                      className="ml-2 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs"
                    >
                      ✏️
                    </button>
                  </td>
                  <td className="p-2 border text-right">{user.points}</td>
                  <td className={`p-2 border font-bold text-right ${profitLoss >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {profitLoss >= 0 ? `+${profitLoss}` : profitLoss}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ⬅️ Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-5 flex items-center gap-3">
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          🚀 Submit
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 font-semibold ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
