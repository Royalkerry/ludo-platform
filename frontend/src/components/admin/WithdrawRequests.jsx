// src/components/admin/WithdrawalRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/transactions/point-requests/pending");
        const withdrawalOnly = res.data.filter((tx) => tx.type === "withdraw");
        setRequests(withdrawalOnly);
      } catch (err) {
        console.error("❌ Error fetching withdrawal requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`/transactions/point-requests/${id}/approve`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("❌ Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/transactions/point-requests/${id}/reject`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("❌ Failed to reject request");
    }
  };

  return (
    <div className="w-full text-black">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">🧾 Withdrawal Requests</h2>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500">No withdrawal requests pending.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-medium">👤 User</th>
                <th className="px-4 py-3 font-medium">💸 Amount</th>
                <th className="px-4 py-3 font-medium">📝 Note</th>
                <th className="px-4 py-3 font-medium">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{r.User?.username}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">₹{r.amount}</td>
                  <td className="px-4 py-3">{r.note || "-"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
