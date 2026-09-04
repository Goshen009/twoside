import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/api/client";
import { registerSchema } from "@/types/schemas";
import type { RegisterFormValues } from "@/types/schemas";

export function RegisterPage() {
  const [show_password, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  function applyServerErrors(err: unknown): void {
    if (err instanceof ApiError) {
      if (err.fields && err.fields.length > 0) {
        for (const field_error of err.fields) {
          setFormError(field_error.field as keyof RegisterFormValues, {
            type: "server",
            message: field_error.message,
          });
        }
        return;
      }
      setError(err.message);
      return;
    }
    setError("Something went wrong. Please try again.");
  }

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    setError(null);
    setLoading(true);
    try {
      await registerUser(values.username, values.password);
      navigate("/");
    } catch (err) {
      applyServerErrors(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <AmbientBackground />
      <PageTransition>
      <div className="w-full max-w-sm space-y-6 relative z-10">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl flex items-center gap-2.5 text-xs shadow-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center tracking-tight text-2xl font-bold font-sans text-zinc-100">
            <span>twoside</span>
            <span className="text-primary">.</span>
          </div>
          <p className="text-xs text-muted">Start tracking your expenses and loans instantly</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-surface/80 border border-white/5 rounded-3xl p-5 space-y-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60 pointer-events-none" />
              <input
                type="text"
                placeholder="Choose a username"
                {...registerField("username")}
                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-9 pr-4 py-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            {errors.username && (
              <p className="text-[10px] text-red-400 ml-1">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60 pointer-events-none" />
              <input
                type={show_password ? "text" : "password"}
                placeholder="••••••••"
                {...registerField("password")}
                className="w-full bg-background/50 border border-white/5 rounded-2xl pl-9 pr-10 py-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!show_password)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-zinc-100 transition-colors cursor-pointer"
                aria-label={show_password ? "Hide password" : "Show password"}
              >
                {show_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-400 ml-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary-hover text-background font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log In
          </Link>
        </div>
      </div>
      </PageTransition>
    </div>
  );
}
