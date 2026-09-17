"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.push("/nexoraa/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blood-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-mono font-black text-2xl text-dark-100">
            <span className="text-blood-600">&lt;</span>
            Zyrenn
            <span className="text-blood-600">/&gt;</span>
          </span>
          <p className="mt-2 text-xs text-dark-600 font-mono">
            {`// restricted access`}
          </p>
        </div>

        {/* Card */}
        <div className="card-dark rounded-2xl p-8 border border-dark-800">
          <h1 className="text-lg font-semibold text-dark-100 mb-6">Sign in</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono text-dark-500 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono text-dark-500 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-dark-900 border border-dark-800 text-dark-200 placeholder-dark-700 text-sm focus:outline-none focus:border-blood-700 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-600 hover:text-dark-400 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-blood-400 font-mono bg-blood-950/50 border border-blood-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blood-700 hover:bg-blood-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors mt-2"
            >
              {loading ? (
                <span className="font-mono text-xs animate-pulse">
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={14} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
