import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import API from "../libs/api/api";
import FormError from "../libs/form-error";
import { z } from "zod";

const registerSchema = z.object({
	username: z.string("username must be a string").min(5, "username must be at least 5 characters").max(100, "username must not be more than 100 characters"),
	pin: z.string("pin is required").regex(/^\d{6}$/, "pin must be 6 digits"),
	confirm_pin: z.string("confirm pin is required").regex(/^\d{6}$/, "confirm pin must be 6 digits"),
}).refine(data => data.pin === data.confirm_pin, {
	error: "Pins do not match",
	path: ['confirm_pin']
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { markAsAuthenticated } = useAuth();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setError(null);
    setLoading(true);
    try {
      await API.register(values.username, values.pin, values.confirm_pin);
      markAsAuthenticated();
      navigate("/");
    } catch (err) {
      FormError.applyServerErrors(err, setFormError, setError);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/4 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
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
            <input
              type="text"
              placeholder="Choose a username"
              {...registerField("username")}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-4 py-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {errors.username && (
              <p className="text-[10px] text-red-400 ml-1">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...registerField("pin")}
                className="w-full bg-background/50 border border-white/5 rounded-2xl px-4 py-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-zinc-100 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.pin && (
              <p className="text-[10px] text-red-400 ml-1">{errors.pin.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-300 ml-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...registerField("confirm_pin")}
              className="w-full bg-background/50 border border-white/5 rounded-2xl px-4 py-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {errors.confirm_pin && (
              <p className="text-[10px] text-red-400 ml-1">{errors.confirm_pin.message}</p>
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
              <>
                <span>Create Account</span>
              </>
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
    </div>
  );
}