import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Home,
  Users,
  FlaskConical,
  UserCheck,
  UserPlus,
  LogOut,
  User,
  Bell,
  Activity,
  Bed,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Plus,
  Heart,
  Stethoscope,
  Building,
  PanelLeft,
  Phone,
  Mail,
  Scale,
  IdCard,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '../services/logoutService';
import { useNavigate } from 'react-router-dom';
import { getHospital } from '../services/hospitalsServices';
import { getPatientsByHospital } from '../services/hospitalsServices';
import DrPatientsListByHospital from '../component/DrPatientsListByHospital';
import { getAllHospitalPatients } from '../services/hospitalsServices';
import { getAllAssistantsForHospital } from '../services/hospitalsServices';
import AllAssistants from '../component/AllAssistants';

const HospitalDashboard = () => {
  const { tab } = useParams();

  const activeTab = tab || "home";

  const handleTabChange = (tab) => {
    navigate(`/hospitalAdmin/dashboard/${tab}`);
  };
  const [notifications] = useState(5);
  const [toggleSideBar, setToggleSideBar] = useState(false);
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [hospitalProfileLoading, setHospitalProfileLoading] = useState(true);
  const [hospitalProfileError, setHospitalProfileError] = useState(null);
  const [doctorsPatientsData, setDoctorsPatientsData] = useState([]);
  const [AllPatients, setAllPatients] = useState([]);
  const [allAssistants, setAllAssistants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientsLength, setPatientsLength] = useState(0);




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
      console.log("Error in fetching profile", error);
      if (error?.status === 404) {
        setHospitalProfile(null);
        setHospitalProfileError("No hospital profile found. Please register your hospital.");
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



  const fetchDRPatientsStats = async () => {
    try {
      const response = await getPatientsByHospital();
      if (response) {
        setDoctorsPatientsData(response.doctors);
        console.log("Patient Stats: ", response);
      }

    } catch (error) {
      console.log("Error in fetching patient stats", error)
    }
  }

  useEffect(() => {
    if (activeTab === 'doctors') {
      fetchDRPatientsStats();
    }
  }, [activeTab])



  const fetchAllHospitalPatients = async () => {
    try {
      const response = await getAllHospitalPatients();
      if (response) {
        console.log("All Hospital Patients: ", response);
        setAllPatients(response.appointments);
        setPatientsLength(response.totalAppointments);
      }

    } catch (error) {
      console.log("Error in fetching all hospital patients", error)
    }
  };

  useEffect(() => {

    fetchAllHospitalPatients();

  }, [])


  const fetchAllAssistants = async () => {
    try {
      const response = await getAllAssistantsForHospital();
      if (response) {
        console.log(response)
        setAllAssistants(response?.assistants);
      }

    } catch (error) {
      console.log("Error in fetching all assistants", error)

    }
  }


  useEffect(() => {
    if (activeTab === 'assistants') {
      fetchAllAssistants();
    }
  }, [activeTab])



  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'patients', label: 'Todays Patients', icon: Users },
    { id: 'doctors', label: 'Doctor Collection', icon: UserCheck },
    { id: 'assistants', label: 'Assistant Collection', icon: UserPlus },
  ];

  const hospitalStats = [
    { icon: Users, label: 'Total Patients', value: patientsLength, change: '+12%', color: 'text-blue-400' },
    { icon: UserCheck, label: 'Doctors on Duty', value: '2', change: '+2', color: 'text-purple-400' },
    { icon: Activity, label: 'Emergency Cases', value: '0', change: '+3', color: 'text-red-400' },
  ];

  const handleLogout = async () => {
    const response = await logoutUser();
    if (response?.status === 200) {
      console.log("Logout successfully !!");
      toast.success("Logout successful!");
      navigate("/auth");
    } else {
      toast.error("Logout failed!");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Hospital Overview */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 rounded-xl border border-blue-500/30">
              <h2 className="text-2xl font-bold text-white mb-2">Hospital Overview</h2>
              <p className="text-gray-300">Real-time hospital operations dashboard</p>
            </div>

            {!hospitalProfile && !hospitalProfileLoading && (
              <div className="bg-gray-900/80 border border-green-500/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Hospital not registered yet</h3>
                    <p className="text-gray-400 mt-2">Click below to register your hospital and complete your profile.</p>
                  </div>
                  <button
                    onClick={() => navigate('/hospitalAdmin/profile')}
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
                <div key={index} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{stat.value}</h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Admissions</h3>
                <div className="space-y-3">
                  {AllPatients.slice(0, 3).map((patient, index) => (
                    <div key={index} className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{patient.name}</h4>
                          <p className="text-gray-400 text-sm">{patient.condition}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 text-sm">{patient.time}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${patient.status === 'Completed' ? 'bg-green-400/20 text-green-400' :
                              patient.status === 'In Progress' ? 'bg-yellow-400/20 text-yellow-400' :
                                'bg-blue-400/20 text-blue-400'
                            }`}>
                            {patient.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Emergency Alerts</h3>
                <div className="space-y-3">
                  <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-medium">Critical Patient - Room 205</span>
                    </div>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Lab Results Pending - 3 Hours</span>
                    </div>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-medium">Maintenance - OR 3 Tomorrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        if (hospitalProfileLoading) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-white">Loading hospital profile...</div>
            </div>
          );
        }

        if (!hospitalProfile) {
          return (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
              <div className="w-full max-w-2xl bg-gray-900/80 rounded-3xl border border-green-500/20 p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white">Hospital Profile</h2>
                  <p className="text-gray-400 mt-2">No hospital profile is registered yet.</p>
                </div>
                <div className="bg-gray-800/40 rounded-2xl border border-gray-700/60 p-6 space-y-4">
                  <p className="text-gray-300">To use the hospital admin dashboard, please register your hospital first.</p>
                  <p className="text-gray-500 text-sm">Your hospital data will appear here once registration is complete.</p>
                  <button
                    onClick={() => navigate('/hospitalAdmin/profile')}
                    className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-cyan-400 px-6 py-3 font-semibold text-black hover:opacity-90 transition"
                  >
                    Register Hospital
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center ">
            <div className="w-full max-w-lg border-none">
              {/* Main Card */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl shadow-2xl p-7 border border-green-500/20 backdrop-blur-sm">

                {/* Header */}
                <div className="text-center mb-4">
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <User className="w-8 h-8 text-blue-400" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-green-300 bg-clip-text text-transparent">
                      Hospital Profile
                    </h2>
                  </div>
                </div>


                {/* User Information Display */}
                <div className="relative bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl p-5 mb-4 border border-green-500/30 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-xl"></div>
                  <h3 className="text-xl font-semibold text-cyan-500 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full mr-3 animate-pulse"></div>
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center group">
                      <User className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm min-w-[60px]">Name:</span>
                      <span className="text-white ml-2 font-medium">{hospitalProfile?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center group">
                      <Phone className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm min-w-[60px]">Phone:</span>
                      <span className="text-white ml-2 font-medium">{hospitalProfile?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center group">
                      <Mail className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm min-w-[60px]">Email:</span>
                      <span className="text-white ml-2 font-medium">{hospitalProfile?.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center group">
                      <Scale className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm min-w-[60px]">Licence No:</span>
                      <span className="text-white ml-2 font-medium">{hospitalProfile?.licenseNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center group">
                      <IdCard className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm min-w-[60px]">Id:</span>
                      <span className="text-white ml-2 font-medium">{hospitalProfile?._id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center group">
                      <MapPin className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-sm min-w-[60px]">Address:</span>
                      <span className="text-white ml-2 font-medium">{hospitalProfile?.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

              </div>




              {/* Footer */}
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">
                  Your information is secure and encrypted
                </p>
              </div>
            </div>
          </div>

        );
      case 'patients': {
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
                <h2 className="text-2xl font-bold text-white">Today's Patients</h2>
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
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Patient</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {filteredPatients.map((patient, index) => (
                  <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{patient.name} ({patient.userId})</h4>
                        <p className="text-gray-400 text-sm">Age: {patient.age}</p>
                        <p className="text-gray-300 text-sm">Phone: {patient.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-medium">{patient.time}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${patient.status === 'Completed' ? 'bg-green-400/20 text-green-400' :
                            patient.status === 'In Progress' ? 'bg-yellow-400/20 text-yellow-400' :
                              'bg-blue-400/20 text-blue-400'
                          }`}>
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




      case 'doctors':
        return (
          <div className="space-y-6">
            <DrPatientsListByHospital data={doctorsPatientsData} />
          </div>
        );
      case 'assistants':
        return (
          <div className="space-y-6">
            <AllAssistants data={allAssistants} />
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
              className={`${toggleSideBar ? "" : "mt-[10px] mb-[13px] mr-[10px]"
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
                  className={`w-full flex items-center ${toggleSideBar ? "space-x-3" : "justify-center"
                    } cursor-pointer p-3 rounded-lg relative ${activeTab === item.id
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
                      className={`w-1.5 h-1.5 bg-cyan-300 rounded-full ${toggleSideBar
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
            className={`w-full flex items-center ${toggleSideBar ? "space-x-3 justify-start" : "justify-center"
              } p-3 rounded-lg text-gray-300 hover:bg-red-600 cursor-pointer hover:text-white transition-all duration-300`}
          >
            <LogOut className="w-5 h-5" />
            {toggleSideBar && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${toggleSideBar ? "ml-64" : "ml-20"} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
        {/* Header */}
        <header className="bg-gray-900/30 border-b border-gray-700/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white capitalize">
                {activeTab === 'home' ? 'Hospital Dashboard' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <p className="text-gray-400 text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{hospitalProfile?.userId?.name || 'Hospital Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
