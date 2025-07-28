// src/hooks/useRoleGuard.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";

const useRoleGuard = (expectedRole) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await axios.get("/user/me"); // or /admin/me if admin route
        const actualRole = res.data?.role;

        if (expectedRole === "user" && actualRole !== "user") {
          throw new Error("Role mismatch");
        }

        if (expectedRole === "admin" && actualRole === "user") {
          throw new Error("Role mismatch");
        }

        // ✅ Role is valid, do nothing
      } catch {
        localStorage.clear();
        navigate("/");
      }
    };

    checkRole();
  }, [expectedRole, navigate]);
};

export default useRoleGuard;
