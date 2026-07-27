import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login/Login.jsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";

function PrivateRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}