"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, name, password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  function handleGuestLogin() {
    router.push("/dashboard");
  }

  const labelClass =
    "block text-xs font-semibold tracking-[1.5px] uppercase mb-2";
  const inputClass =
    "w-full px-4 py-3 rounded-[14px] border-[1.5px] outline-none transition-all duration-250 text-ink placeholder:text-locked-text";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div>
        <label htmlFor="name" className={labelClass} style={{ color: "var(--muted)", fontSize: "12px" }}>
          Imię
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Twoje imię"
          required
          className={inputClass}
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass} style={{ color: "var(--muted)", fontSize: "12px" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          required
          className={inputClass}
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass} style={{ color: "var(--muted)", fontSize: "12px" }}>
          Hasło
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wprowadź hasło"
          required
          className={inputClass}
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Remember me + forgot password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="text-muted text-xs">Zapamiętaj mnie</span>
        </label>
        <button
          type="button"
          className="text-xs font-medium transition-colors duration-250"
          style={{ color: "var(--accent)" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Nie pamiętam hasła
        </button>
      </div>

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-[14px] border"
          style={{
            background: "var(--accent-light)",
            color: "var(--accent)",
            borderColor: "var(--accent-glow)",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="group w-full py-3 rounded-[14px] font-semibold text-white transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "var(--accent)" }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.boxShadow = "0 8px 25px var(--accent-glow)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span>{isLoading ? "Logowanie..." : "Zaloguj się"}</span>
        {!isLoading && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-250 -translate-x-1 group-hover:translate-x-0 transition-transform">
            →
          </span>
        )}
      </button>

      {/* Separator */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-xs text-muted">lub</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Guest button */}
      <button
        type="button"
        onClick={handleGuestLogin}
        className="w-full py-3 rounded-[14px] font-medium text-sm transition-all duration-250 border-[1.5px]"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted)",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--muted)";
        }}
      >
        Wejdź jako gość
      </button>
    </form>
  );
}
