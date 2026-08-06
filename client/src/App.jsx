import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { Route, Routes, Navigate } from "react-router-dom";
import SelectRole from "./pages/SelectRole";
import DoctorDashboard from "./pages/DoctorDashboard";
import ProtectedRoute from "./component/protectedRoute";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AssistantDashboard from "./pages/AssistantDashboard";
import LabAdmin from "./pages/LabAdmin";
import { ProtectRole } from "./component/protect_role";
import HospitalProfileForm from "./component/HospitalProfile";

const App = () => {
  return (
    <>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/select-role"
        element={
          <ProtectRole>
             <SelectRole />
          </ProtectRole>
           
        }
      />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospitalAdmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["hospitalAdmin"]}>
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospitalAdmin/profile"
        element={
          <ProtectedRoute>
            <HospitalProfileForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/labAdmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["labAdmin"]}>
            <LabAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant/dashboard"
        element={
          <ProtectedRoute allowedRoles={["assistant"]}>
            <AssistantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Unauthorized Access</h1>
            <p className="text-gray-400 mb-6">You do not have permission to access this page.</p>
            <a href="/" className="px-6 py-2.5 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors">
              Return Home
            </a>
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
   
    </>
  );
};

export default App;
