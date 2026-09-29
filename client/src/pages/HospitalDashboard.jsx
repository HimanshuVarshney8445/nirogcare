import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  UserPlus,
  LogOut,
  User,
  Activity,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  Stethoscope,
  Building,
  PanelLeft,
  Mail,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getHospital } from "../services/hospitalsServices";
import HospitalProfile from "../component/HospitalProfile";
import {
  getDoctorRequestsApi,
  updateDoctorRequestApi,
} from "../services/doctorServices";
import { getPatientsByHospital } from "../services/hospitalsServices";
import DrPatientsListByHospital from "../component/DrPatientsListByHospital";
import { getAllHospitalPatients } from "../services/hospitalsServices";
import { getAllAssistantsForHospital, updateAssistantVerification } from "../services/hospitalsServices";
import AllAssistants from "../component/AllAssistants";
import AddPatientModal from "../component/AddPatientModal";

const HospitalDashboard = () => {
  const { logout } = useAuth();
  const { tab } = useParams();

  const activeTab = tab || "home";

  const handleTabChange = (tab) => {
    navigate(`/hospitalAdmin/dashboard/${tab}`);
  };

  const [toggleSideBar, setToggleSideBar] = useState(false);
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [hospitalProfileLoading, setHospitalProfileLoading] = useState(true);
  const [hospitalProfileError, setHospitalProfileError] = useState(null);
  const [doctorsPatientsData, setDoctorsPatientsData] = useState([]);
  const [activeDoctorsCount, setActiveDoctorsCount] = useState(0);
  const [AllPatients, setAllPatients] = useState([]);
  const [allAssistants, setAllAssistants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientsLength, setPatientsLength] = useState(0);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setToggleSideBar(false);
      } else {
        setToggleSideBar(true);
      }
    };

    // Call on mount
    handleResize();

    // Optional: respond to future resizes
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();

  const getHospitalProfile = async () => {
    setHospitalProfileLoading(true);
    try {
      const response = await getHospital();
      setHospitalProfile(response.hospital || null);
      setHospitalProfileError(null);
    } catch (error) {
      if (error?.status === 404) {
        setHospitalProfile(null);
        setHospitalProfileError(
          "No hospital profile found. Please register your hospital.",
        );
      } else {
        setHospitalProfileError("Unable to load hospital profile.");
      }
    } finally {
      setHospitalProfileLoading(false);
    }
  };

  useEffect(() => {
    getHospitalProfile();
  }, []);

  const fetchDoctorRequests = async () => {
    try {
      const response = await getDoctorRequestsApi();
      setDoctorRequests(response.doctors || []);
    } catch (error) {
      console.log("Error fetching doctor requests:", error);
    }
  };

  const handleDoctorRequest = async (doctorId, status) => {
    try {
      await updateDoctorRequestApi(doctorId, status);

      toast.success(
        status === "approved"
          ? "Doctor approved successfully"
          : "Doctor request rejected",
      );

      fetchDoctorRequests();
      fetchDRPatientsStats();
    } catch (error) {
      toast.error("Failed to update doctor request");
    }
  };

  const fetchDRPatientsStats = async () => {
    try {
      const response = await getPatientsByHospital();
      if (response) {
        setDoctorsPatientsData(response.doctors);
        setActiveDoctorsCount(response.doctors.length);
      }
    } catch (error) {
      console.log("Error in fetching patient stats", error);
    }
  };

  useEffect(() => {
    if (activeTab === "home" || activeTab === "doctors") {
      fetchDRPatientsStats();
    }

    if (activeTab === "doctors") {
      fetchDoctorRequests();
    }
  }, [activeTab]);

  const fetchAllHospitalPatients = async () => {
    try {
      const response = await getAllHospitalPatients();
      if (response) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysPatients = (response.appointments || []).filter(
          (patient) => {
            if (!patient.appointmentDate) return false;

            const appointmentDate = new Date(patient.appointmentDate);
            appointmentDate.setHours(0, 0, 0, 0);

            return appointmentDate.getTime() === today.getTime();
          },
        );

        setAllPatients(todaysPatients);
        setPatientsLength(todaysPatients.length);
      }
    } catch (error) {
      console.log("Error in fetching today's patients", error);
    }
  };

  useEffect(() => {
    fetchAllHospitalPatients();
  }, []);

  const fetchAllAssistants = async () => {
    try {
      const response = await getAllAssistantsForHospital();
      if (response) {
        console.log(response);
        setAllAssistants(response?.assistants);
      }
    } catch (error) {
      console.log("Error in fetching all assistants", error);
    }
  };

  const handleAssistantVerification = async (assistantId, status) => {
    try {
      await updateAssistantVerification(assistantId, status);
      toast.success(status === "approved" ? "Assistant approved successfully" : "Assistant rejected");
      fetchAllAssistants();
    } catch (error) {
      toast.error("Failed to update assistant request");
    }
  };

  useEffect(() => {
    if (activeTab === "assistants") {
      fetchAllAssistants();
    }
  }, [activeTab]);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "profile", label: "My Profile", icon: User },
    { id: "patients", label: "Todays Patients", icon: Users },
    { id: "doctors", label: "Doctor Collection", icon: UserCheck },
    { id: "assistants", label: "Assistant Collection", icon: UserPlus },
  ];

  const hospitalStats = [
    {
      icon: Users,
      label: "Total Patients",
      value: patientsLength,
      color: "text-blue-400",
    },
    {
      icon: UserCheck,
      label: "Doctors on Duty",
      value: activeDoctorsCount,
      color: "text-purple-400",
    },
    {
      icon: Activity,
      label: "Emergency Cases",
      value: "0",
      color: "text-red-400",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logout successful!", {
        duration: 3000,
        className: "doctor-toast",
      });

      navigate("/auth", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Hospital Overview */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 rounded-xl border border-blue-500/30">
              <h2 className="text-2xl font-bold text-white mb-2">
                Hospital Overview
              </h2>
              <p className="text-gray-300">
                Real-time hospital operations dashboard
              </p>
            </div>

            {!hospitalProfile && !hospitalProfileLoading && (
              <div className="bg-gray-900/80 border border-green-500/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Hospital not registered yet
                    </h3>
                    <p className="text-gray-400 mt-2">
                      Click below to register your hospital and complete your
                      profile.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/hospitalAdmin/profile")}
                    className="rounded-xl bg-gradient-to-r from-green-500 to-cyan-400 px-6 py-3 font-semibold text-black hover:opacity-90 transition"
                  >
                    Register Hospital
                  </button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hospitalStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {stat.value}
                  </h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Recent Admissions
                </h3>
                <div className="space-y-3">
                  {AllPatients.slice(0, 3).map((patient, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">
                            {patient.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {patient.condition}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 text-sm">
                            {patient.time}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              patient.status === "Completed"
                                ? "bg-green-400/20 text-green-400"
                                : patient.status === "In Progress"
                                  ? "bg-yellow-400/20 text-yellow-400"
                                  : "bg-blue-400/20 text-blue-400"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Emergency Alerts
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-medium">
                        Critical Patient - Room 205
                      </span>
                    </div>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        Lab Results Pending - 3 Hours
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-medium">
                        Maintenance - OR 3 Tomorrow
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        if (hospitalProfileLoading) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-gray-400">Loading hospital profile...</p>
            </div>
          );
        }

        if (!hospitalProfile) {
          return (
            <div className="text-white">Hospital profile not available.</div>
          );
        }

        return <HospitalProfile hospitalProfile={hospitalProfile} />;

      case "patients": {
        const filteredPatients = AllPatients.filter((patient) => {
          const name = patient.name?.toLowerCase() || "";
          const phone = patient.phone || "";
          const query = searchQuery.toLowerCase();
          return name.includes(query) || phone.includes(query);
        });

        return (
          <div className="space-y-6">
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Today's Patients
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Patient</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {filteredPatients.map((patient, index) => (
                  <div
                    key={patient._id || index}
                    className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side */}
                      <div className="flex items-center gap-4">
                        {/* Patient index */}
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 font-semibold">
                            {index + 1}
                          </span>
                        </div>

                        {/* Patient information */}
                        <div>
                          <h4 className="font-medium text-white">
                            {patient.name}
                          </h4>

                          <p className="text-gray-400 text-sm">
                            Age: {patient.age}
                          </p>

                          <p className="text-gray-300 text-sm">
                            Phone: {patient.phone}
                          </p>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="text-right">
                        <p className="text-blue-400 font-medium">
                          {patient.time}
                        </p>

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            patient.status === "Completed"
                              ? "bg-green-400/20 text-green-400"
                              : patient.status === "In Progress"
                                ? "bg-yellow-400/20 text-yellow-400"
                                : "bg-blue-400/20 text-blue-400"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "doctors":
        return (
          <div className="space-y-6">
            <DrPatientsListByHospital
              data={doctorsPatientsData}
              doctorRequests={doctorRequests}
              onDoctorRequest={handleDoctorRequest}
            />
          </div>
        );
      case "assistants":
        return (
          <div className="space-y-6">
            <AllAssistants data={allAssistants} onVerificationChange={handleAssistantVerification} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Sidebar */}
      <div
        className={`${toggleSideBar ? "w-64" : "w-20"} fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out bg-gray-900/50 border-r border-gray-700/50 flex flex-col backdrop-blur-sm overflow-hidden z-50`}
      >
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex mt-0.5 items-center justify-between">
            <div className="flex items-center space-x-3 group">
              {toggleSideBar && (
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/30">
                  <Stethoscope className="text-emerald-400 w-7 h-7 group-hover:text-emerald-300" />
                </div>
              )}

              {toggleSideBar && (
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-blue-300 transition-all duration-300">
                  NirogCare
                </h1>
              )}
            </div>
            <PanelLeft
              onClick={() => setToggleSideBar((prev) => !prev)}
              className={`${
                toggleSideBar ? "" : "mt-[10px] mb-[13px] mr-[10px]"
              } text-emerald-700 hover:text-emerald-500 cursor-pointer transition duration-300`}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center ${
                    toggleSideBar ? "space-x-3" : "justify-center"
                  } cursor-pointer p-3 rounded-lg relative ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white border border-green-500/50"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {toggleSideBar && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {activeTab === item.id && (
                    <span
                      className={`w-1.5 h-1.5 bg-cyan-300 rounded-full ${
                        toggleSideBar
                          ? "ml-auto"
                          : "absolute right-1.5 bottom-1.5"
                      }`}
                    ></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              toggleSideBar ? "space-x-3 justify-start" : "justify-center"
            } p-3 rounded-lg text-gray-300 hover:bg-red-600 cursor-pointer hover:text-white transition-all duration-300`}
          >
            <LogOut className="w-5 h-5" />
            {toggleSideBar && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`${toggleSideBar ? "ml-64" : "ml-20"} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}
      >
        {/* Header */}
        {/* Header - Only visible on Home tab */}
        {activeTab === "home" && (
          <header className="bg-gray-900/30 border-b border-gray-700/50 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div>
                <h2 className="text-xl font-semibold text-white capitalize">
                  Hospital Dashboard
                </h2>

                <p className="text-gray-400 text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                {/* <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />

                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button> */}

                {/* Hospital Admin */}
                <div
                  onClick={() => handleTabChange("profile")}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-700 to-blue-700 rounded-full flex items-center justify-center group-hover:ring-2 group-hover:ring-emerald-400 transition-all duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>

                  <span className="text-white font-medium">
                    {hospitalProfile?.userId?.name || "Hospital Admin"}
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>

        {/* Add Patient Modal */}
        <AddPatientModal
          isOpen={showAddPatientModal}
          onClose={() => setShowAddPatientModal(false)}
          onSuccess={fetchAllHospitalPatients}
          hospitalId={hospitalProfile?._id}
        />
      </div>
    </div>
  );
};

export default HospitalDashboard;
