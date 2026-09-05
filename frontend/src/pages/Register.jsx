import React from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "A valid email address is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

const fieldBorder = (hasError) =>
  hasError ? "border-error" : "border-outline-variant";

export default function Register() {
  const { register: authRegister, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // If user is already authenticated, redirect to pending invite or /
  if (isAuthenticated) {
    const pendingToken = sessionStorage.getItem("pendingInviteToken");
    if (pendingToken) {
      return <Navigate to={`/invite/${pendingToken}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      // If the user was redirected here mid-invite-flow, send them back
      // to complete the join rather than landing on the dashboard.
      const pendingToken = sessionStorage.getItem("pendingInviteToken");
      if (pendingToken) {
        navigate(`/invite/${pendingToken}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Registration failed.",
      });
    }
  };

  const handleGoogleSignUp = (e) => {
    e.preventDefault();
    showToast({ type: "success", message: "Google Sign-In is coming soon." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Registration Card */}
      <main className="flex w-full max-w-105 flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
        {/* Header */}
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="mb-2 font-headline-lg text-headline-lg font-black tracking-tighter text-primary">
            SplitKaro
          </h1>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Create your account
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Start splitting expenses with friends.
          </p>
        </header>
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4"
        >
          {/* Name Input */}
          <div className="flex flex-col gap-1">
            <label
              className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
              htmlFor="name"
            >
              NAME
            </label>
            <input
              className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.name)} rounded-DEFAULT px-3 py-2 font-body-md text-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
              id="name"
              placeholder="John Doe"
              type="text"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 font-label-sm text-label-sm text-error">
                {errors.name.message}
              </p>
            )}
          </div>
          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label
              className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
              htmlFor="email"
            >
              EMAIL
            </label>
            <input
              className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.email)} rounded-DEFAULT px-3 py-2 font-body-md text-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
              id="email"
              placeholder="john@example.com"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 font-label-sm text-label-sm text-error">
                {errors.email.message}
              </p>
            )}
          </div>
          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label
              className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
              htmlFor="password"
            >
              PASSWORD
            </label>
            <input
              className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.password)} rounded-DEFAULT px-3 py-2 font-body-md text-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
              id="password"
              placeholder="••••••••"
              type="password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="font-label-sm text-[12px] font-normal text-error">
                {errors.password.message}
              </p>
            ) : (
              <p className="font-label-sm text-[12px] font-normal text-on-surface-variant">
                At least 8 characters
              </p>
            )}
          </div>
          {/* Primary Action */}
          <button
            className="mt-2 w-full rounded-DEFAULT bg-primary py-3 font-label-sm text-label-sm text-on-primary transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        {/* Divider */}
        <div className="flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-outline-variant"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            or
          </span>
          <div className="h-px flex-1 bg-outline-variant"></div>
        </div>
        {/* Secondary Action */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-DEFAULT border border-outline-variant bg-transparent py-3 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-low focus:ring-2 focus:ring-outline/50 focus:outline-none"
          type="button"
          onClick={handleGoogleSignUp}
        >
          {/* Simplified Google G Icon SVG for minimal footprint, strictly adhering to constraints */}
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            ></path>
          </svg>
          Sign up with Google
        </button>
        {/* Footer */}
        <p className="mt-2 text-center font-body-md text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary hover:underline"
            to="/login"
          >
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
