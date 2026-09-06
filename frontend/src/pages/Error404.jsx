import React from "react";
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background p-6 font-body-md text-body-md text-on-background antialiased">
      <main className="flex flex-col items-center px-container-padding text-center">
        {/* Missing Receipt Illustration */}
        <div className="group relative mx-auto mb-8 h-32 w-32 cursor-default">
          {/* Back shadow card */}
          <div className="absolute inset-0 -rotate-6 transform rounded-xl bg-surface-container-highest shadow-sm transition-transform duration-300 group-hover:-rotate-12"></div>

          {/* Front receipt card */}
          <div className="absolute inset-0 z-10 flex rotate-3 transform items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest shadow-md transition-transform duration-300 group-hover:rotate-6">
            <span className="material-symbols-outlined text-4xl! text-outline">
              receipt_long
            </span>

            {/* Torn edge effect */}
            <div className="absolute -bottom-2 left-0 flex w-full justify-between px-2">
              <div className="h-3 w-3 rounded-full bg-background"></div>
              <div className="h-3 w-3 rounded-full bg-background"></div>
              <div className="h-3 w-3 rounded-full bg-background"></div>
              <div className="h-3 w-3 rounded-full bg-background"></div>
              <div className="h-3 w-3 rounded-full bg-background"></div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-unit font-headline-lg text-headline-lg text-on-background">
          404 - Page Not Found
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-8 max-w-md font-body-lg text-body-lg text-on-surface-variant">
          We couldn't find the page you're looking for. It might have been
          moved, deleted, or the link is incorrect.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="font-label-md text-label-md inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 font-semibold tracking-wide text-on-primary transition-all outline-none hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-primary/40"
        >
          Back to Dashboard
        </Link>
      </main>
    </div>
  );
};

export default Error404;
