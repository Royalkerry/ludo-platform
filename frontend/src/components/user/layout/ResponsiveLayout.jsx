import React from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import { Outlet } from "react-router-dom";

const ResponsiveLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar → Desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile TopBar */}
      <div className="md:hidden sticky top-0 z-50">
        <TopBar />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 md:pb-4 md:ml-64">
        <Outlet />
      </div>

      {/* Bottom nav → Mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default ResponsiveLayout;
