// import React from "react";

// export default function AdminSidebar({ selected, setSelected }) {
//   const menu = [
//     { key: "userList", label: "👥 User List" },
//     { key: "refillRequests", label: "💰 Refill Requests" },
//     { key: "withdrawRequests", label: "💸 Withdraw Requests" },
//     { key: "gameHistory", label: "🎮 Game History" },
    
//   ];

//   return (
//     <div style={{ width: 250, background: "#222", color: "#fff", padding: 20 }}>
//       <h2>🛠 Admin</h2>
//       {menu.map((item) => (
//         <div
//           key={item.key}
//           onClick={() => setSelected(item.key)}
//           style={{
//             padding: "10px 0",
//             cursor: "pointer",
//             color: selected === item.key ? "#0f0" : "#fff",
//           }}
//         >
//           {item.label}
//         </div>
//       ))}
//     </div>
//   );
// }// not working 
