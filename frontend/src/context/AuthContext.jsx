/* eslint-disable react-hooks/immutability */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ FIXED: Load user from localStorage AND verify with backend
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // ✅ Load saved user immediately (for instant UI)
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }

          // ✅ Then verify and update from backend
          const { data } = await axios.get("/api/auth/me");
          setUser(data.data);

          // ✅ Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(data.data));
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ✅ FIXED: Login function with localStorage persistence
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      const token = data.token;
      const userData = data.data;

      // ✅ Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Set axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // ✅ Update state
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ✅ FIXED: Register function with localStorage persistence
  const register = async (
    name,
    email,
    password,
    university,
    semester,
    course,
  ) => {
    try {
      const { data } = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        university,
        semester,
        course,
      });
      const token = data.token;
      const userData = data.data;

      // ✅ Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Set axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // ✅ Update state
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // ✅ FIXED: Logout function clears everything
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // ✅ NEW: Update user function (for profile updates)
  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  const value = {
    user,
    setUser: updateUser, // ✅ Use updateUser instead of direct setUser
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
