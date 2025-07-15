// src/pages/RefillRequest.jsx
import React, { useState } from "react";
import axios from "@/utils/axiosInstance";
import LobbySidebar from "@/components/user/LobbySidebar"; 

export default function RefillRequest() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("/user/request-refill", { amount, note });
      setMessage("✅ Refill request submitted successfully!");
      setAmount("");
      setNote("");
    } catch (err) {
      setMessage("❌ Failed to submit request.");
    }
  };

  return (<div style={{ display: "flex", height: "100vh" }}>
    <LobbySidebar /> {/* ✅ Sidebar reused */}
    <div style={{ flex: 1, padding: "40px" }}>
      <h2 className="text-xl font-bold mb-4">💸 Refill Points</h2>

      {message && <p className="mb-2">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="number"
          placeholder="Enter points to refill"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="p-2 rounded text-black"
        />

        <textarea
          placeholder="Note (e.g., UPI reference)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="p-2 rounded text-black"
        />

        <button type="submit" className="bg-green-600 text-white py-2 rounded">
          Submit Refill Request
        </button>
      </form>
    </div>
  </div>
);
}