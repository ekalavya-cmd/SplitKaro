import React from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required."),
  password: z.string().trim().min(1, "Password is required."),
});

const fieldBorder = (hasError) =>
  hasError ? "border-error" : "border-outline-variant";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // If user is already authenticated, redirect to /
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate("/", { replace: true });
    } catch (error) {
      showToast({ type: "error", message: error.message || "Login failed." });
    }
  };

  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    showToast({ type: "success", message: "Google Sign-In is coming soon." });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showToast({ type: "success", message: "Password reset is coming soon." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      {/* Main Container */}
      <main className="w-full max-w-105">
        {/* Login Card */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="mb-6 font-headline-lg text-headline-lg font-black text-primary">
              SplitKaro
            </h1>
            <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
              Welcome back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Log in to manage your shared expenses.
            </p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                className="mb-1.5 block font-label-sm text-label-sm tracking-wider text-on-surface uppercase"
                htmlFor="email"
              >
                EMAIL
              </label>
              <input
                className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.email)} rounded px-3 py-2.5 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
                id="email"
                placeholder="you@example.com"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 font-label-sm text-label-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>
            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  className="block font-label-sm text-label-sm tracking-wider text-on-surface uppercase"
                  htmlFor="password"
                >
                  PASSWORD
                </label>
                <a
                  className="font-label-sm text-label-sm text-primary transition-colors hover:text-primary-container"
                  href="#"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </a>
              </div>
              <input
                className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.password)} rounded px-3 py-2.5 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
                id="password"
                placeholder="••••••••"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 font-label-sm text-label-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Primary Button */}
            <button
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary py-3 font-label-sm text-label-sm text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging In..." : "Log In"}
            </button>
          </form>
          {/* Divider */}
          <div className="relative flex items-center py-6">
            <div className="grow border-t border-outline-variant"></div>
            <span className="mx-4 shrink-0 font-body-md text-body-md text-on-surface-variant">
              or
            </span>
            <div className="grow border-t border-outline-variant"></div>
          </div>
          {/* Secondary Button (Google) */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-transparent py-3 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-low"
            type="button"
            onClick={handleGoogleSignIn}
          >
            {/* Simple inline SVG for Google G to avoid external dependencies for just a logo in a minimal UI */}
            <svg
              fill="none"
              height="18"
              viewBox="0 0 24 24"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M23.52 12.2727C23.52 11.4218 23.4436 10.6036 23.3018 9.81818H12V14.4545H18.4582C18.18 15.9545 17.3345 17.2309 16.0582 18.0818V21.0927H19.9418C22.2109 19.0036 23.52 15.9273 23.52 12.2727Z"
                fill="#4285F4"
                fillRule="evenodd"
              ></path>
              <path
                clipRule="evenodd"
                d="M12 24C15.24 24 17.9673 22.9255 19.9418 21.0927L16.0582 18.0818C14.9891 18.7964 13.6145 19.2273 12 19.2273C8.87455 19.2273 6.22909 17.1164 5.28545 14.2855H1.27636V17.3945C3.24545 21.3055 7.29273 24 12 24Z"
                fill="#34A853"
                fillRule="evenodd"
              ></path>
              <path
                clipRule="evenodd"
                d="M5.28545 14.2854C5.04 13.5491 4.90364 12.7854 4.90364 12C4.90364 11.2145 5.04 10.4509 5.28545 9.71454V6.60545H1.27636C0.463636 8.22545 0 10.0582 0 12C0 13.9418 0.463636 15.7745 1.27636 17.3945L5.28545 14.2854Z"
                fill="#FBBC05"
                fillRule="evenodd"
              ></path>
              <path
                clipRule="evenodd"
                d="M12 4.77273C13.7618 4.77273 15.3382 5.37818 16.5818 6.56727L20.0291 3.12C17.9618 1.19455 15.24 0 12 0C7.29273 0 3.24545 2.69455 1.27636 6.60545L5.28545 9.71455C6.22909 6.88364 8.87455 4.77273 12 4.77273Z"
                fill="#EA4335"
                fillRule="evenodd"
              ></path>
            </svg>
            Sign in with Google
          </button>
        </div>
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have an account?{" "}
            <Link
              className="font-semibold text-primary transition-colors hover:text-primary-container"
              to="/register"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
