import React, { useState } from "react";
import {
  User,
  Phone,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  Search,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  MapPin,
  Tag,
  Activity,
  UserCheck,
} from "lucide-react";

const DrPatientsListByHospital = ({
  data = [],
  doctorRequests = [],
  onDoctorRequest,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'today' | 'completed' | 'pending'
  const [appointmentSearch, setAppointmentSearch] = useState("");

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveTab("all");
    setAppointmentSearch("");
  };

  const backToDoctors = () => {
    setSelectedDoctor(null);
    setAppointmentSearch("");
  };

  // Helper to compute metrics for a doctor
  const getDoctorStats = (doctor) => {
    if (!doctor)
      return {
        totalPatients: 0,
        todaysPatients: 0,
        completed: 0,
        pending: 0,
        totalAppointments: 0,
      };

    const appointments = doctor.appointments || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todaysCount = 0;
    let completedCount = 0;
    let pendingCount = 0;

    appointments.forEach((appt) => {
      if (appt.date) {
        const apptDate = new Date(appt.date);
        apptDate.setHours(0, 0, 0, 0);
        if (apptDate.getTime() === today.getTime()) {
          todaysCount++;
        }
      }
      const status = (appt.status || "booked").toLowerCase();
      if (status === "completed") {
        completedCount++;
      } else if (
        status === "booked" ||
        status === "confirmed" ||
        status === "in-progress"
      ) {
        pendingCount++;
      }
    });

    return {
      totalPatients: doctor.stats?.totalPatients ?? completedCount,
      todaysPatients: doctor.stats?.todaysPatients ?? todaysCount,
      completed: doctor.stats?.completed ?? completedCount,
      pending: doctor.stats?.pending ?? pendingCount,
      totalAppointments: appointments.length,
    };
  };

  const filteredDoctors = data.filter((doctor) => {
    const doctorName = doctor.doctorName || "";
    const spec = doctor.specialization || "";
    const docId = (doctor.doctorId || "").toString();
    const query = search.toLowerCase();

    return (
      doctorName.toLowerCase().includes(query) ||
      spec.toLowerCase().includes(query) ||
      docId.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "booked").toLowerCase();
    switch (s) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            In Progress
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Clock className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            Booked
          </span>
        );
    }
  };

  // Prepare detailed doctor view data
  const doctorStats = selectedDoctor ? getDoctorStats(selectedDoctor) : null;
  const doctorAppointments = selectedDoctor?.appointments || [];

  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);

  const filteredAppointments = doctorAppointments.filter((appt) => {
    // Filter by tab
    const status = (appt.status || "booked").toLowerCase();
    const apptDate = appt.date ? new Date(appt.date) : null;
    if (apptDate) apptDate.setHours(0, 0, 0, 0);

    if (activeTab === "today" && apptDate?.getTime() !== todayZero.getTime()) {
      return false;
    }
    if (activeTab === "completed" && status !== "completed") {
      return false;
    }
    if (
      activeTab === "pending" &&
      !["booked", "confirmed", "in-progress"].includes(status)
    ) {
      return false;
    }

    // Filter by search
    if (appointmentSearch.trim()) {
      const q = appointmentSearch.toLowerCase();
      const nameMatch = (appt.name || "").toLowerCase().includes(q);
      const phoneMatch = (appt.phone || "").toLowerCase().includes(q);
      const idMatch = (appt._id || "").toString().toLowerCase().includes(q);
      return nameMatch || phoneMatch || idMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-2 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* DOCTORS GRID VIEW (Visible when no doctor is selected) */}
        {!selectedDoctor && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  Doctor Collection
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Manage doctors, view appointment queues, and track patient stats
                </p>
                <div className="h-1 mt-3 w-48 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></div>
              </div>

              {/* Search input */}
              <div className="relative max-w-md w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search doctor name or specialization..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-3.5 text-gray-500 h-5 w-5" />
              </div>
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800">
                <div className="w-16 h-16 bg-gray-800/80 rounded-2xl flex items-center justify-center mb-4 border border-gray-700">
                  <Stethoscope className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg font-medium">No doctors found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your search filter or check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => {
                  const stats = getDoctorStats(doctor);

                  return (
                    <div
                      key={doctor.doctorId}
                      onClick={() => selectDoctor(doctor)}
                      className="group relative bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Stethoscope className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {doctor.doctorName}
                            </h3>
                            <span className="inline-block text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5">
                              {doctor.specialization}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor ID Tag */}
                      <div className="bg-gray-950/70 border border-gray-800/80 rounded-lg p-2.5 mb-5 flex items-center justify-between">
                        <span className="text-gray-500 text-xs flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-gray-400" /> Doctor ID:
                        </span>
                        <span className="text-gray-300 font-mono text-xs font-semibold truncate max-w-[170px]">
                          {doctor.doctorId}
                        </span>
                      </div>

                      {/* Stats Overview Chips Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-5">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
                          <p className="text-gray-400 text-[11px] flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" /> Total Patients
                          </p>
                          <p className="text-lg font-bold text-emerald-400 mt-1">
                            {stats.completed}
                          </p>
                        </div>

                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-2.5">
                          <p className="text-gray-400 text-[11px] flex items-center gap-1 truncate">
                            <Calendar className="w-3 h-3 text-purple-400 flex-shrink-0" /> Today's
                          </p>
                          <p className="text-lg font-bold text-purple-400 mt-1">
                            {stats.todaysPatients}
                          </p>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-2.5">
                          <p className="text-gray-400 text-[11px] flex items-center gap-1 truncate">
                            <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" /> Pending
                          </p>
                          <p className="text-lg font-bold text-amber-400 mt-1">
                            {stats.pending}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs text-gray-400 group-hover:text-emerald-300 font-medium">
                        <span>View Appointments</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DOCTOR REQUESTS SECTION (Visible only on Doctor Collection overview grid) */}
            <div className="mt-12 space-y-4 pt-8 border-t border-gray-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Doctor Requests
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Doctors waiting for hospital approval.
                  </p>
                </div>

                {doctorRequests.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold border border-yellow-500/30">
                    {doctorRequests.length} Pending
                  </span>
                )}
              </div>

              {/* No pending requests */}
              {doctorRequests.length === 0 ? (
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center">
                  <UserCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white">
                    No Doctor Requests
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    There are currently no doctors waiting for approval.
                  </p>
                </div>
              ) : (
                /* Pending requests grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorRequests.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <Stethoscope className="w-6 h-6 text-white" />
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {doctor.userId?.name || "Unknown Doctor"}
                            </h3>

                            <p className="text-emerald-400 text-sm font-medium">
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                          Pending Approval
                        </span>
                      </div>

                      {/* Doctor details */}
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400">License:</span>
                          <span className="text-white font-mono">{doctor.licenseNumber}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white">{doctor.userId?.email || "N/A"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-white">{doctor.experience || 0} years</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => onDoctorRequest && onDoctorRequest(doctor._id, "approved")}
                          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Accept Request
                        </button>

                        <button
                          onClick={() => onDoctorRequest && onDoctorRequest(doctor._id, "rejected")}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELECTED DOCTOR DETAILS & APPOINTMENTS VIEW (Visible when a doctor is selected) */}
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Top Navigation */}
            <button
              onClick={backToDoctors}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 px-4 py-2 rounded-xl transition-all group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Doctor Collection</span>
            </button>

            {/* Doctor Info Header Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                      {selectedDoctor.doctorName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {selectedDoctor.specialization}
                      </span>
                      {selectedDoctor.licenseNumber && (
                        <span className="text-xs text-gray-400 bg-gray-800/80 px-2.5 py-0.5 rounded-full border border-gray-700">
                          License: {selectedDoctor.licenseNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3 text-right">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Doctor ID
                  </p>
                  <p className="text-emerald-400 font-mono text-sm font-semibold mt-0.5">
                    {selectedDoctor.doctorId}
                  </p>
                </div>
              </div>
            </div>

            {/* STAT CARDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Patients Card (Shows Completed Patients) */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Total Patients
                  </span>
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-emerald-400">
                    {doctorStats.completed}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Completed consultations</p>
                </div>
              </div>

              {/* Today's Patients Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Today's Patients
                  </span>
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-white">
                    {doctorStats.todaysPatients}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Pending
                  </span>
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-amber-400">
                    {doctorStats.pending}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Awaiting consultation</p>
                </div>
              </div>
            </div>

            {/* TAB FILTERS & SEARCH BAR */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "all"
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  All Appointments ({doctorAppointments.length})
                </button>

                <button
                  onClick={() => setActiveTab("today")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "today"
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Today ({doctorStats.todaysPatients})
                </button>

                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "completed"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Completed ({doctorStats.completed})
                </button>

                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "pending"
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Pending ({doctorStats.pending})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search patient, phone, ID..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
              </div>
            </div>

            {/* APPOINTMENTS LIST VIEW */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Appointment List
                </h3>
                <span className="text-xs text-gray-400">
                  Showing {filteredAppointments.length} appointment
                  {filteredAppointments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-900/20 rounded-2xl border border-gray-800">
                  <Calendar className="h-10 w-10 text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">
                    No appointments match the selected filter
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Try selecting "All Appointments" or clear your search input.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appt) => (
                    <div
                      key={appt._id}
                      className="bg-gray-900/80 border border-gray-800/90 rounded-2xl p-5 hover:border-gray-700 transition-all shadow-md hover:shadow-xl"
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Patient Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="h-6 w-6 text-emerald-400" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white">
                                {appt.name}
                              </h4>
                              {getStatusBadge(appt.status)}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                              <span className="flex items-center gap-1 text-gray-300">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                {appt.phone}
                              </span>
                              {appt.age && <span>Age: {appt.age}</span>}
                              {appt.gender && (
                                <span className="capitalize">
                                  Gender: {appt.gender}
                                </span>
                              )}
                              {appt.mode && (
                                <span className="capitalize px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300 font-medium flex items-center gap-1">
                                  {appt.mode === "online" ? (
                                    <Video className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <MapPin className="w-3 h-3 text-emerald-400" />
                                  )}
                                  {appt.mode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Date, Time & Appt Details */}
                        <div className="flex flex-wrap items-center gap-4 lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-800 w-full lg:w-auto justify-between lg:justify-end">
                          <div>
                            <p className="text-xs text-gray-400 flex items-center lg:justify-end gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-purple-400" />
                              <span className="font-semibold text-white">
                                {formatDate(appt.date)}
                              </span>
                            </p>
                            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center lg:justify-end gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Slot: {appt.timeSlot || "Standard Slot"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 block">
                              Appt ID
                            </span>
                            <span className="font-mono text-[11px] text-gray-400">
                              {appt._id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrPatientsListByHospital;
