import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useAllGroupsQuery } from "../queries/useGroupsQueries";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { RecordSettlementModal } from "../components/RecordSettlementModal";
import { NewGroupModal } from "../components/NewGroupModal";

const Layout = () => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [expenseModalData, setExpenseModalData] = useState(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [settlementModalData, setSettlementModalData] = useState(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openSettlementModal = (initialData = null) => {
    setSettlementModalData(initialData);
    setIsSettlementModalOpen(true);
  };

  const openExpenseModal = (initialData = null) => {
    setExpenseModalData(initialData);
    setIsAddExpenseOpen(true);
  };

  const { isAuthenticated, isInitializing, logout, user } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      showToast({
        type: "success",
        message: "Logged out successfully.",
      });
    } catch (error) {
      console.error("Logout failed in UI:", error);
      showToast({
        type: "error",
        message: "Failed to log out. Please try again.",
      });
    }
  };

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useAllGroupsQuery({
    enabled: isAuthenticated && !isInitializing,
  });

  // Auto-select the first group when groups data becomes available.
  // If ?group=<id> is present (set by InviteLanding after a join), prefer that
  // group and immediately clean the param from the URL so it doesn't persist.
  // Done during render phase to avoid cascading effect renders.
  if (groups && groups.length > 0 && !selectedGroupId) {
    const requestedId = searchParams.get("group");
    const requestedNum = requestedId ? Number(requestedId) : null;
    if (requestedNum && groups.some((g) => g.id === requestedNum)) {
      setSelectedGroupId(requestedNum);
      setSearchParams({}, { replace: true }); // clean the URL
    } else {
      setSelectedGroupId(groups[0].id);
    }
  } else if (groups && groups.length === 0 && selectedGroupId !== "") {
    setSelectedGroupId("");
  }

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  const navLinks = [
    { name: "Dashboard", path: "/", icon: "dashboard" },
    { name: "Expenses", path: "/expenses", icon: "receipt_long" },
    { name: "Settle Up", path: "/settle-up", icon: "payments" },
    { name: "Groups", path: "/groups", icon: "group" },
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
          <button
            onClick={() => setIsNewGroupModalOpen(true)}
            disabled={!selectedGroupId}
            className="font-label-md text-label-md flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary bg-transparent px-4 py-2 font-semibold tracking-wide text-primary transition-all outline-none hover:bg-primary/5 hover:shadow-sm focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none"
          >
            <span className="material-symbols-outlined text-[22px]!">add</span>{" "}
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
                <span className="material-symbols-outlined text-[20px]!">
                  {link.icon}
                </span>
                <span className="font-label-md text-label-md">{link.name}</span>
              </Link>
            );
          })}
        </nav>
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
              {isInitializing || isLoading ? (
                <option disabled>Loading groups...</option>
              ) : isError ? (
                <option disabled>Error loading groups</option>
              ) : groups && groups.length > 0 ? (
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
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px]! text-outline">
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
              <span className="material-symbols-outlined text-[20px]!">
                notifications
              </span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full font-semibold text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]!">
                help
              </span>
            </button>

            <div className="mx-1 h-6 w-px bg-outline-variant"></div>

            <button
              onClick={() => openSettlementModal()}
              disabled={!selectedGroupId}
              className="font-label-md text-label-md h-9 cursor-pointer rounded-md border border-primary bg-transparent px-4 py-2 font-semibold tracking-wide text-primary transition-all outline-none hover:bg-primary/5 hover:shadow-sm focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              Settle
            </button>

            <button
              onClick={() => openExpenseModal()}
              disabled={!selectedGroupId}
              className="font-label-md text-label-md flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 font-semibold tracking-wide text-on-primary transition-all outline-none hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:hover:bg-primary disabled:hover:text-on-primary disabled:hover:shadow-none"
            >
              <span className="material-symbols-outlined text-[22px]!">
                add
              </span>{" "}
              Add Expense
            </button>

            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-secondary-container font-label-sm text-on-secondary-container transition-shadow focus:ring-2 focus:ring-primary/40 focus:outline-none"
              >
                {/* Avatar Placeholder */}
                <span className="material-symbols-outlined text-[20px]!">
                  person
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="animate-in fade-in absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 shadow-sm duration-150">
                  <div className="border-b border-outline-variant px-3 py-2">
                    <p className="font-body-md leading-tight font-medium text-on-surface">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        showToast({
                          type: "info",
                          message: "Profile page is coming soon.",
                        });
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left font-body-md text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[20px]! text-on-surface-variant">
                        person
                      </span>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        showToast({
                          type: "info",
                          message: "Settings page is coming soon.",
                        });
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left font-body-md text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[20px]! text-on-surface-variant">
                        settings
                      </span>
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="my-1 h-px bg-outline-variant"></div>
                  <button
                    onClick={(e) => {
                      setIsProfileMenuOpen(false);
                      handleLogout(e);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left font-body-md text-error transition-colors hover:bg-error-container/30"
                  >
                    <span className="material-symbols-outlined text-[20px]! text-error">
                      logout
                    </span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
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
                isInitializing,
                groupsIsLoading: isLoading,
                openSettlementModal,
                openExpenseModal,
              }}
            />
          </div>
        </main>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpenseModalData(null);
        }}
        groupId={selectedGroupId}
        initialData={expenseModalData}
      />
      <RecordSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => {
          setIsSettlementModalOpen(false);
          setSettlementModalData(null);
        }}
        groupId={selectedGroupId}
        initialData={settlementModalData}
      />
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
