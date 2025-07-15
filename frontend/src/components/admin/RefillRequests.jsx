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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">💰 Refill Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No refill requests pending.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Note</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="text-center">
                <td className="border px-4 py-2">{r.user?.username}</td>
                <td className="border px-4 py-2">{r.amount}</td>
                <td className="border px-4 py-2">{r.note || "-"}</td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    ❌ Reject
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
