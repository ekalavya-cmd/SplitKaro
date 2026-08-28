import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import SettleUp from "./pages/SettleUp";
import Error404 from "./pages/Error404";
import { PersistentErrorBanner } from "./components/PersistentErrorBanner";
import { useAuth } from "./context/useAuth";

function App() {
  const { hasConnectionError, retryConnection } = useAuth();

  return (
    <>
      {hasConnectionError && (
        <PersistentErrorBanner refetch={retryConnection} />
      )}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settle-up" element={<SettleUp />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
