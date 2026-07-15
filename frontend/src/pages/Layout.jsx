import React from "react";
import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans">
      <nav className="flex items-center justify-between bg-canvas py-md px-xl border-b border-canvas-soft">
        <h1 className="text-display-xs text-ink font-bold">SplitKaro</h1>
        <div className="space-x-xl flex">
          <Link
            to="/"
            className="text-body-sm-strong text-ink hover:text-body transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/expenses"
            className="text-body-sm-strong text-ink hover:text-body transition-colors"
          >
            Expenses
          </Link>
          <Link
            to="/settle-up"
            className="text-body-sm-strong text-ink hover:text-body transition-colors text-nowrap"
          >
            Settle Up
          </Link>
        </div>
      </nav>
      <main className="py-xl px-xl max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
