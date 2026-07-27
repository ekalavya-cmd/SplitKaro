import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import SettleUp from "./pages/SettleUp";
import Error404 from "./pages/Error404";
import { useAuth } from "./context/useAuth";
import { ErrorBlock } from "./components/ErrorBlock";
import { LoadingSpinner } from "./components/LoadingSpinner";

function App() {
  const { isInitializing, hasConnectionError, retryConnection } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (hasConnectionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <ErrorBlock
            error={{
              message:
                "Can't reach the server — check your connection and try again",
            }}
            refetch={retryConnection}
          />
        </div>
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/add-expense/:id" element={<AddExpense />} />
          <Route path="/settle-up" element={<SettleUp />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
