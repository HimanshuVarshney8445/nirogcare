import React from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  ShieldCheck,
  IdCard,
  MapPin,
  FileCheck,
  Navigation,
} from "lucide-react";

const HospitalProfile = ({ hospitalProfile }) => {

  // This should only happen if the parent really didn't pass data.
  // Your dashboard is already passing the registered hospital.
  if (!hospitalProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">

        <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-red-500/20 p-8 text-center">

          <Building2 className="w-12 h-12 text-red-400 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-white">
            Hospital Profile Unavailable
          </h2>

          <p className="text-gray-400 mt-2">
            Hospital information could not be loaded.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-2xl p-6 mb-6">

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Hospital Icon */}

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">

            <Building2 className="w-10 h-10 text-emerald-400" />

          </div>

          {/* Hospital Name */}

          <div className="text-center sm:text-left flex-1">

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">

              <h1 className="text-3xl font-bold text-white">
                {hospitalProfile.name}
              </h1>

              {hospitalProfile.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">

                  <ShieldCheck className="w-3.5 h-3.5" />

                  Verified

                </span>
              )}

            </div>

            <p className="text-gray-400 mt-2">
              Hospital Administration Profile
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-gray-400 text-sm">

              <MapPin className="w-4 h-4 text-emerald-400" />

              <span>
                {hospitalProfile.address || "Address not available"}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden mb-6">

        <div className="p-6 border-b border-gray-700/50">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

              <User className="w-5 h-5 text-blue-400" />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                Hospital Information
              </h2>

              <p className="text-sm text-gray-500">
                Basic information about your hospital
              </p>

            </div>

          </div>

        </div>


        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Hospital Name */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <Building2 className="w-4 h-4 text-emerald-400" />

              <p className="text-sm text-gray-400">
                Hospital Name
              </p>

            </div>

            <p className="text-white font-medium">
              {hospitalProfile.name || "N/A"}
            </p>

          </div>


          {/* Phone */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <Phone className="w-4 h-4 text-emerald-400" />

              <p className="text-sm text-gray-400">
                Phone Number
              </p>

            </div>

            <p className="text-white font-medium">
              {hospitalProfile.phone || "N/A"}
            </p>

          </div>


          {/* Email */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <Mail className="w-4 h-4 text-emerald-400" />

              <p className="text-sm text-gray-400">
                Email
              </p>

            </div>

            <p className="text-white font-medium break-all">
              {hospitalProfile.userId?.email || "N/A"}
            </p>

          </div>


          {/* Admin Name */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <User className="w-4 h-4 text-emerald-400" />

              <p className="text-sm text-gray-400">
                Admin Name
              </p>

            </div>

            <p className="text-white font-medium">
              {hospitalProfile.userId?.name || "N/A"}
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          REGISTRATION INFORMATION
      ===================================================== */}

      <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden mb-6">

        <div className="p-6 border-b border-gray-700/50">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">

              <FileCheck className="w-5 h-5 text-purple-400" />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                Registration Details
              </h2>

              <p className="text-sm text-gray-500">
                Official hospital registration information
              </p>

            </div>

          </div>

        </div>


        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* License */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <FileCheck className="w-4 h-4 text-purple-400" />

              <p className="text-sm text-gray-400">
                License Number
              </p>

            </div>

            <p className="text-white font-medium">
              {hospitalProfile.licenseNumber || "N/A"}
            </p>

          </div>


          {/* Hospital ID */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <IdCard className="w-4 h-4 text-purple-400" />

              <p className="text-sm text-gray-400">
                Hospital ID
              </p>

            </div>

            <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md 
  bg-black/60 border border-gray-600/70 
  text-gray-300 font-mono text-xs font-semibold 
  tracking-[0.18em] uppercase 
  shadow-inner">
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></span>
              Hidden for privacy
            </p>

          </div>


          {/* Verification */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <ShieldCheck className="w-4 h-4 text-purple-400" />

              <p className="text-sm text-gray-400">
                Verification Status
              </p>

            </div>

            <p
              className={
                hospitalProfile.isVerified
                  ? "text-green-400 font-medium"
                  : "text-yellow-400 font-medium"
              }
            >
              {hospitalProfile.isVerified
                ? "Verified"
                : "Pending Verification"}
            </p>

          </div>


          {/* Created At */}

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

            <div className="flex items-center gap-3 mb-2">

              <FileCheck className="w-4 h-4 text-purple-400" />

              <p className="text-sm text-gray-400">
                Registered On
              </p>

            </div>

            <p className="text-white font-medium">

              {hospitalProfile.createdAt
                ? new Date(
                  hospitalProfile.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                : "N/A"}

            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          LOCATION
      ===================================================== */}

      <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-gray-700/50">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">

              <MapPin className="w-5 h-5 text-cyan-400" />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                Location
              </h2>

              <p className="text-sm text-gray-500">
                Registered hospital location
              </p>

            </div>

          </div>

        </div>


        <div className="p-6">

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">

            <div className="flex items-start gap-4">

              <MapPin className="w-5 h-5 text-cyan-400 mt-1" />

              <div>

                <p className="text-gray-400 text-sm mb-1">
                  Address
                </p>

                <p className="text-white font-medium">
                  {hospitalProfile.address || "N/A"}
                </p>

              </div>

            </div>

          </div>


          {/* Coordinates */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

              <div className="flex items-center gap-3 mb-2">

                <Navigation className="w-4 h-4 text-cyan-400" />

                <p className="text-sm text-gray-400">
                  Latitude
                </p>

              </div>

              <p className="text-white font-medium">

                {hospitalProfile.location?.coordinates?.[1] ??
                  "N/A"}

              </p>

            </div>


            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">

              <div className="flex items-center gap-3 mb-2">

                <Navigation className="w-4 h-4 text-cyan-400" />

                <p className="text-sm text-gray-400">
                  Longitude
                </p>

              </div>

              <p className="text-white font-medium">

                {hospitalProfile.location?.coordinates?.[0] ??
                  "N/A"}

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default HospitalProfile;