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
    showToast({ type: "info", message: "Google Sign-Up is coming soon." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Registration Card */}
      <main className="flex w-full max-w-120 flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
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
              className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.name)} rounded-md px-3 py-2 font-body-md text-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
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
              className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.email)} rounded-md px-3 py-2 font-body-md text-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
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
              className={`w-full border bg-surface-container-lowest ${fieldBorder(!!errors.password)} rounded-md px-3 py-2 font-body-md text-body-md text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
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
            className="font-label-md text-label-md mt-2 w-full cursor-pointer rounded-md bg-primary py-3 font-semibold tracking-wide text-on-primary transition-all outline-none hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:hover:bg-primary disabled:hover:text-on-primary disabled:hover:shadow-none"
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
          className="font-label-md text-label-md flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-outline-variant bg-transparent py-3 font-semibold tracking-wide text-on-surface transition-all outline-none hover:bg-surface-container-low hover:shadow-sm focus:ring-2 focus:ring-outline/40 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none"
          type="button"
          onClick={handleGoogleSignUp}
        >
          {/* Simplified Google G Icon SVG for minimal footprint, strictly adhering to constraints */}
          <svg
            fill="none"
            height="18"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
            className="pt-0.5"
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
          <span>Sign up with Google</span>
        </button>
        {/* Footer */}
        <p className="mt-1 text-center font-body-md text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary transition-all hover:text-primary-container"
            to="/login"
          >
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
