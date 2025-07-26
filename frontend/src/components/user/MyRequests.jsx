import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/user/my-requests");
        setRequests(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch requests:", err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-10 bg-white text-black rounded shadow-md w-full">
      <h2 className="text-xl font-bold mb-4">
        📋 My Refill & Withdrawal Requests
      </h2>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100">Type</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Amount</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Note</th>
              <th className="border border-gray-300 p-2 bg-gray-100">Status</th>
              <th className="border border-gray-300 p-2 bg-gray-100">
                Requested At
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="border border-gray-300 p-2">{req.type}</td>
                <td className="border border-gray-300 p-2">{req.amount}</td>
                <td className="border border-gray-300 p-2">{req.note || "-"}</td>
                <td className="border border-gray-300 p-2">{req.status}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(req.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => navigate("/lobby")}
        className="mt-8 px-5 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        ⬅️ Back to Lobby
      </button>
    </div>
  );
}
