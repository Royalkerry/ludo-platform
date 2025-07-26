import React, { useState } from "react";
import axios from "@/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function WithdrawRequest() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post("/user/request-withdraw", { amount, note });
      setMessage("✅ Withdrawal request submitted successfully!");
      setAmount("");
      setNote("");
    } catch (err) {
      setMessage("❌ Failed to submit request.");
    }
  };

  return (
    <div className="p-10 bg-white text-black rounded shadow-md w-full">
      <h2 className="text-xl font-bold mb-4">🧾 Withdraw Points</h2>

      {message && <p className="mb-2">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="number"
          placeholder="Enter points to withdraw"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="p-2 rounded text-black border border-gray-300"
        />

        <textarea
          placeholder="Note (e.g., bank details or reason)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="p-2 rounded text-black border border-gray-300"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Withdraw Request
        </button>
      </form>

      {/* Optional Back Button */}
      <button
        onClick={() => navigate("/lobby")}
        className="mt-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ⬅️ Back to Lobby
      </button>
    </div>
  );
}
