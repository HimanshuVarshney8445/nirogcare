import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import SkeletonLoader from "./component/Loader";

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading){
    if (loading) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-300 rounded-full animate-spin"></div>

        <p className="text-emerald-300 text-sm font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
}
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
