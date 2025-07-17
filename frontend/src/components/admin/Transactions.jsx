import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function Transactions({ selectedUserId = null }) {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const token = localStorage.getItem("adminToken");

  const fetchTransactions = async (customStart = null, customEnd = null) => {
    if (!token) {
      setError("Token missing. Please login again.");
      return;
    }

    try {
      const params = {};
      if (selectedUserId) params.userId = selectedUserId;
      if (customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      } else if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await axios.get("/transactions", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(res.data);
      setCurrentPage(1); // Reset to first page on fetch
      setError("");
    } catch (err) {
      console.error("❌ Transaction fetch error:", err);
      setError("Transaction fetch error");
    }
  };

  useEffect(() => {
    if (token) {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
      fetchTransactions(todayStr, todayStr);
    }
  }, [selectedUserId]);

  const handleToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
    fetchTransactions(todayStr, todayStr);
  };

  const handleYesterday = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const startStr = yesterday.toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);
    fetchTransactions(startStr, endStr);
  };

  const handleCustomRange = () => {
    if (startDate && endDate) {
      fetchTransactions(startDate, endDate);
    }
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded shadow text-black">
      <h2 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
        🧾 Transaction History
      </h2>

      {/* Filter Buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleToday}
          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Get Today
        </button>
        <button
          onClick={handleYesterday}
          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          From Yesterday
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-200">
            From:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 p-1 border rounded dark:bg-gray-800 dark:text-white"
            />
          </label>
          <label className="text-sm text-gray-700 dark:text-gray-200">
            To:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 p-1 border rounded dark:bg-gray-800 dark:text-white"
            />
          </label>
          <button
            onClick={handleCustomRange}
            className="ml-4 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Filter
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="overflow-auto">
        <table className="w-full text-sm text-left border dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Note</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              currentTransactions.map((t) => (
                <tr key={t.id} className="border-t dark:border-gray-700">
                  <td className="p-2 border">{t.user?.username || "-"}</td>
                  <td className="p-2 border">{t.type}</td>
                  <td
                    className={`p-2 border font-semibold ${
                      t.type === "refill" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {t.amount}
                  </td>
                  <td className="p-2 border">{t.status}</td>
                  <td className="p-2 border">
                    {new Date(t.requestedAt).toLocaleString()}
                  </td>
                  <td className="p-2 border">{t.note || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {transactions.length > transactionsPerPage && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs  bg-gray-600 rounded hover:bg-gray-900 disabled:opacity-50"
          >
            ◀ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2 py-1 text-xs  rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
