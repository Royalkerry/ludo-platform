// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";

import Users from "./Users";
import GameHistory from "./GameHistory";
import RefillRequests from "./RefillRequests";
import WithdrawRequests from "./WithdrawRequests";
import Transactions from "./Transactions";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("users");

  const renderContent = () => {
    switch (selectedPage) {
      case "users":
        return <Users />;
      case "refillRequests":
        return <RefillRequests />;
      case "withdrawRequests":
        return <WithdrawRequests />;
      case "gameHistory":
        return <GameHistory />;
      case "transactions":
        return <Transactions />;
      default:
        return <div className="text-gray-600">Please select an option.</div>;
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen releative">
      {/* Sidebar */}
      <AdminSidebar
        onSelect={(page) => {
          setSelectedPage(page);
          setSidebarOpen(false); // auto close on mobile
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Content Wrapper */}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
      sidebarOpen ? "md:ml-64" : "md:ml-0"
    }`}>

        {/* Topbar for Mobile */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>

        {/* Page Content */}
        <main className="flex-1 w-full px-3 py-4 sm:px-4 md:px-6 lg:px-8 xl:px-10 overflow-x-auto">
         {renderContent()}
        </main>
      </div>
    </div>
  );
}
