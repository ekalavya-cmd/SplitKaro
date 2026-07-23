import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getGroups } from "../services/group.service";

const Layout = () => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups();
        if (data && data.length > 0) {
          setGroups(data);
          setSelectedGroupId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setGroups([]);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  const navLinks = [
    { name: "Dashboard", path: "/", icon: "dashboard" },
    { name: "Expenses", path: "/expenses", icon: "receipt_long" },
    { name: "Settle Up", path: "/settle-up", icon: "payments" },
    { name: "Groups", path: "/groups", icon: "group" },
  ];

  const bottomNavLinks = [
    { name: "Settings", path: "/settings", icon: "settings" },
    { name: "Logout", path: "/logout", icon: "logout" },
  ];

  return (
    <div className="flex min-h-screen bg-background font-body-md text-body-md text-on-background antialiased selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest">
        <div className="p-6 pb-4">
          <h1 className="mb-1 font-headline-md text-headline-lg font-bold tracking-tight text-primary">
            SplitKaro
          </h1>
          <p className="font-label-sm text-label-sm font-medium text-on-surface-variant">
            Manage Expenses
          </p>
        </div>

        <div className="mb-6 px-4">
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-DEFAULT border border-primary bg-transparent font-label-sm text-label-sm font-semibold tracking-wider text-primary transition-all hover:bg-primary/5 hover:shadow-md">
            <span className="material-symbols-outlined text-[18px]">add</span>{" "}
            New Group
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-DEFAULT px-4 py-2 transition-colors ${
                  isActive
                    ? "border-l-2 border-primary bg-primary/10 font-bold text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {link.icon}
                </span>
                <span className="font-body-md text-body-md">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-outline-variant p-4">
          {bottomNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 rounded-DEFAULT px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">
                {link.icon}
              </span>
              <span className="font-body-md text-body-md">{link.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6">
          <div className="flex flex-1 items-center gap-6">
            <select
              value={selectedGroupId}
              onChange={handleGroupChange}
              className="h-9 min-w-40 cursor-pointer rounded-DEFAULT border border-outline-variant bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="" disabled>
                Select a group
              </option>
              {groups && groups.length > 0 ? (
                groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))
              ) : (
                <option disabled>No groups available</option>
              )}
            </select>

            <div className="relative hidden w-full max-w-md md:block">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-full rounded-DEFAULT border border-outline-variant bg-surface-container-low pr-4 pl-10 font-body-md text-body-md placeholder:text-outline focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex h-8 w-8 items-center justify-center rounded-full font-semibold text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full font-semibold text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">
                help
              </span>
            </button>

            <div className="mx-1 h-6 w-px bg-outline-variant"></div>

            <button className="h-9 rounded-DEFAULT border border-primary bg-transparent px-4 font-label-sm text-label-sm font-semibold tracking-wide text-primary transition-all hover:bg-primary/5 hover:shadow-md">
              Groups
            </button>

            <button
              onClick={() => navigate(`/add-expense/${selectedGroupId}`)}
              disabled={!selectedGroupId}
              className="flex h-9 items-center justify-center gap-2 rounded-DEFAULT bg-primary px-4 font-label-sm text-label-sm font-semibold tracking-wide text-on-primary transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>{" "}
              Add Expense
            </button>

            <div className="ml-2 flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-secondary-container font-label-sm text-on-secondary-container">
              {/* Avatar Placeholder */}
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="mx-auto w-full max-w-300">
            <Outlet
              context={{
                selectedGroupId,
                setSelectedGroupId,
                groups,
                setGroups,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
