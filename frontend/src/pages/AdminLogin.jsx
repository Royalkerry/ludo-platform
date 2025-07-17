import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // setErrorMsg("");
    try {
      // Make sure the URL matches your backend auth route.
      const res = await axios.post("/auth/login", {
        username,
        password,
      });

      const { user, token } = res.data;

      // Allow only admin or privileged roles here.
      if (!["creator", "superadmin", "admin", "master"].includes(user?.role)) {
        setError("Access denied: Not an admin role");
        return;
      }

      // Save token and user data correctly into localStorage.
      localStorage.setItem("adminToken", token);
      // IMPORTANT: Save user under the key "user" so that sidebars/components reading from localStorage work.
      // localStorage.setItem("user", JSON.stringify(user));

      // Redirect to admin dashboard.
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      // ✅ Show specific error if available (e.g., "🚫 You are blocked")
      const msg = err.response?.data?.error || "Invalid credentials";
      setError(msg);
      // setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Admin Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  },
  heading: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    textAlign: "center",
  },
};
