import React from "react";
import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-on-background font-body-md text-body-md overflow-x-hidden antialiased selection:bg-primary/20 selection:text-primary">
      <nav className="flex items-center justify-between bg-surface-container-lowest py-4 px-6 border-b border-outline-variant shadow-sm sticky top-0 z-10">
        <h1 className="text-headline-sm font-headline-sm text-primary font-bold tracking-tight">SplitKaro</h1>
        <div className="flex gap-6">
          <Link
            to="/"
            className="text-label-md font-label-md font-medium text-on-surface hover:text-primary transition-colors uppercase tracking-wider"
          >
            Dashboard
          </Link>
          <Link
            to="/expenses"
            className="text-label-md font-label-md font-medium text-on-surface hover:text-primary transition-colors uppercase tracking-wider"
          >
            Expenses
          </Link>
          <Link
            to="/settle-up"
            className="text-label-md font-label-md font-medium text-on-surface hover:text-primary transition-colors text-nowrap uppercase tracking-wider"
          >
            Settle Up
          </Link>
        </div>
      </nav>
      <main className="pt-8 pb-24 px-6 max-w-[1440px] mx-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
