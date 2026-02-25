"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, name: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_PASSWORD = "LIDER2026";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("projekt-ai-user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(email: string, name: string, password: string) {
    if (password !== VALID_PASSWORD) {
      return { error: "Nieprawidłowe hasło" };
    }

    if (!email.trim() || !name.trim()) {
      return { error: "Wypełnij wszystkie pola" };
    }

    // Check if user exists (maybeSingle doesn't error on 0 rows)
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (selectError) {
      console.error("Supabase select error:", selectError);
      return { error: `Błąd połączenia z bazą danych: ${selectError.message}` };
    }

    let currentUser: User;

    if (existingUser) {
      currentUser = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      };
      // Update last login timestamp
      await supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", existingUser.id);
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({ email: email.toLowerCase().trim(), name: name.trim() })
        .select("id, email, name")
        .single();

      if (error || !newUser) {
        console.error("Supabase insert error:", error);
        return { error: `Błąd podczas tworzenia konta: ${error?.message || "Brak danych"}` };
      }

      // Initialize tool sessions for the new user
      const tools = ["A", "B", "C", "D", "E"];
      await supabase.from("tool_sessions").insert(
        tools.map((tool) => ({
          user_id: newUser.id,
          tool_name: tool,
          status: "not_started",
        }))
      );

      currentUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };
    }

    localStorage.setItem("projekt-ai-user", JSON.stringify(currentUser));
    setUser(currentUser);
    return {};
  }

  function logout() {
    localStorage.removeItem("projekt-ai-user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
