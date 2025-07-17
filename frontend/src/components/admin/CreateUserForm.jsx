import React, { useState } from "react";
import axios from "@/utils/axiosInstance";

export default function CreateUserForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "user",
    uplinkId: "",
    points: "",
    creditLimit: "0",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setStatus("❌ Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      const payload = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        uplinkId: formData.uplinkId,
        points: parseInt(formData.points || 0),
        creditLimit: formData.role === "user" ? 0 : parseInt(formData.creditLimit || 0),
      };

      const res = await axios.post("/admin/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatus("✅ User created: " + res.data.username);
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        role: "user",
        uplinkId: "",
        points: "",
        creditLimit: "0",
      });
    } catch (err) {
      setStatus("❌ " + (err.response?.data?.error || "Failed to create user"));
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded shadow w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">➕ Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="number"
          name="points"
          placeholder="Initial Points"
          value={formData.points}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          name="uplinkId"
          placeholder="Uplink ID"
          value={formData.uplinkId}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
          <option value="master">Master Admin</option>
        </select>
        <input
          type="number"
          name="creditLimit"
          placeholder="Credit Limit"
          value={formData.creditLimit}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          disabled={formData.role === "user"}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          🚀 Create User
        </button>
      </form>

      {status && (
        <p
          className={`mt-4 font-semibold ${
            status.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
