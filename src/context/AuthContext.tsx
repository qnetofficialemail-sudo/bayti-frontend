import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
interface User { id: number; email: string; full_name: string; role: string; }
interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<User>; register: (data: any) => Promise<User>; logout: () => void; isLoading: boolean; }
const AuthContext = createContext<AuthContextType>(null!);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setIsLoading(false);
  }, []);
  const login = async (email: string, password: string): Promise<User> => {
    const form = new FormData();
    form.append("username", email);
    form.append("password", password);
    const { data } = await api.post("/api/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };
  const register = async (formData: any): Promise<User> => {
    const { data } = await api.post("/api/auth/register", formData);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
