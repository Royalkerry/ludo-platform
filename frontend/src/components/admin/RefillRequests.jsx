// src/components/admin/RefillRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function RefillRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/transactions/point-requests/pending");
        const refillOnly = res.data.filter((tx) => tx.type === "refill");
        setRequests(refillOnly);
      } catch (err) {
        console.error("❌ Error fetching requests:", err);
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
    } catch {
      alert("❌ Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/transactions/point-requests/${id}/reject`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("❌ Failed to reject request");
    }
  };

  return (
    <div className="w-full p-4 text-black">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Refill Requests</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-500 italic">No refill requests pending.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-sm">
                <th className="px-4 py-3 border text-left">👤 User</th>
                <th className="px-4 py-3 border text-left">💵 Amount</th>
                <th className="px-4 py-3 border text-left">📝 Note</th>
                <th className="px-4 py-3 border text-left">⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 text-sm">
                  <td className="border px-4 py-2">{r.User?.username}</td>
                  <td className="border px-4 py-2 text-green-700 font-semibold">{r.amount}</td>
                  <td className="border px-4 py-2 text-gray-600">{r.note || "-"}</td>
                  <td className="border px-4 py-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
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
