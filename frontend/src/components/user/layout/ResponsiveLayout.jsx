import React from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";

const ResponsiveLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar for desktop only */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 p-4 pb-20 md:pb-4 md:ml-64">
        <Outlet />
      </div>

      {/* Bottom nav for mobile only */}
      <BottomNav />
    </div>
  );
};

export default ResponsiveLayout;
