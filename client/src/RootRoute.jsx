import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Home />;
  }

  if (user && !user.role) {
    return <Navigate to="/select-role" replace />;
  }

  if (user?.role === "patient") {
    return <Navigate to="/patient/dashboard/home" replace />;
  }

  if (user?.role === "doctor") {
    return <Navigate to="/doctor/dashboard/home" replace />;
  }

  if (user?.role === "hospitalAdmin") {
    return <Navigate to="/hospitalAdmin/dashboard/home" replace />;
  }

  if (user?.role === "labAdmin") {
    return <Navigate to="/labAdmin/dashboard/home" replace />;
  }

  if (user?.role === "assistant") {
    return <Navigate to="/assistant/dashboard/home" replace />;
  }

  return <Home />;
};

export default RootRoute;
