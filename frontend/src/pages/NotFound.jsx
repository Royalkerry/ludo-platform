import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 20 }}>
      <h2>404 - Page Not Found</h2>
      <Link to="/lobby">Go to Lobby</Link>
    </div>
  );
}
