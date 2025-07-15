import React, { useState } from "react";
import axios from "@/utils/axiosInstance";

export default function CreateUserForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
    uplinkId: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post("/api/auth/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStatus("✅ User created: " + res.data.username);
    } catch (err) {
      setStatus("❌ " + (err.response?.data?.error || "Failed to create user"));
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow-md w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border p-2"
          type="text"
          name="uplinkId"
          placeholder="Uplink ID (admin user ID)"
          value={formData.uplinkId}
          onChange={handleChange}
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create User
        </button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
