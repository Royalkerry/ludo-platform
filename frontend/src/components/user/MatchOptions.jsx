import React, { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance"; // use real axios when backend ready

export default function MatchOptions() {
  const [availableUsers, setAvailableUsers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user")); // to avoid showing self

  useEffect(() => {
    // 🚨 Replace this with real API later
    setTimeout(() => {
      setAvailableUsers([
        { id: 1, username: "kerry" },
        { id: 2, username: "rohan" },
        { id: 3, username: "shyam" },
      ]);
    }, 300);
  }, []);

  const handleChallenge = (user) => {
    alert(`🔔 Challenge sent to ${user.username}`);
    // Later: emit socket event or call backend
  };

  const gameModes = [
    { title: "2 Player", image: "/assets/images/2player.jpg" },
    { title: "4 Player", image: "/assets/images/4player.jpg" },
    { title: "Tournament", image: "/assets/images/tournament.jpg" },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🎯 Choose Your Game Mode</h2>

      {/* Game mode cards */}
      <div style={styles.cardGrid}>
        {gameModes.map((mode, i) => (
          <div key={i} style={styles.card}>
            <img src={mode.image} alt={mode.title} style={styles.image} />
            <h3 style={{ color: "black" }}>{mode.title}</h3>
          </div>
        ))}
      </div>

      {/* User list for challenge */}
      <div style={styles.userBox}>
        <h3 style={{ marginBottom: 10, color: "black"  }}>👥 Available Users</h3>
        {availableUsers.filter(u => u.id !== currentUser.id).length === 0 ? (
          <p>No users available to challenge</p>
        ) : (
          <ul style={styles.userList}>
            {availableUsers
              .filter(u => u.id !== currentUser.id)
              .map((user) => (
                <li key={user.id} style={styles.userItem}>
                  {user.username}
                  <button onClick={() => handleChallenge(user)} style={styles.btn}>Challenge</button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "900px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    color: "#222",
  },
  cardGrid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  card: {
    border: "2px solid #ccc",
    borderRadius: "12px",
    padding: "10px",
    textAlign: "center",
    width: "180px",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  image: {
    width: "100%",
    height: "110px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  userBox: {
    background: "#f4f4f4",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  userList: {
    listStyle: "none",
    paddingLeft: 0,
    margin: 0,
  },
  userItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #ddd",
    color: "#333",
  },
  btn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
