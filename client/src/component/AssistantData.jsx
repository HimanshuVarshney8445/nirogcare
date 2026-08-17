import React from "react";
import {
  Building2,
  UserPlus,
  User,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-emerald-400" />
    </div>

    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">
        {label}
      </p>

      <p className="text-base font-semibold text-white truncate">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="group rounded-2xl bg-white/[0.025] border border-white/[0.07] p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-400/20 hover:-translate-y-0.5">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center transition-colors group-hover:bg-emerald-400/15">
        <Icon className="w-5 h-5 text-emerald-400" />
      </div>

      <div>
        <h3 className="text-base font-semibold text-white">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>

    {children}
  </div>
);

const AssistantData = ({ assistantData, userData }) => {
  const assistant = assistantData?.assistant;

  const doctorName = assistant?.doctorId?.userId?.name;
  const hospitalName = assistant?.hospitalId?.name;
  const assistantName = userData?.user?.name;

  const initials = assistantName
    ? assistantName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("")
    : "A";

  return (
    <div className="w-full flex justify-center px-4 py-6 md:px-8">
      <div className="w-full max-w-4xl">

        {/* Main Profile */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#101a17] via-[#0b1210] to-[#070b0a] shadow-[0_20px_60px_-25px_rgba(16,185,129,0.25)]">

          {/* Background Glow */}
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/[0.06] blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8 lg:p-10">

            {/* Header */}
            <div className="flex items-center justify-between gap-5">

              <div className="flex items-center gap-5 min-w-0">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-[76px] h-[76px] rounded-2xl bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <span className="text-2xl font-bold text-emerald-300">
                      {initials}
                    </span>
                  </div>

                  {/* Active indicator */}
                  <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-emerald-400 border-[3px] border-[#0b1210]" />
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />

                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                      Healthcare Staff
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                    {assistantName || "Assistant"}
                  </h1>

                  <p className="text-sm text-gray-400 mt-1">
                    Assistant Profile
                  </p>
                </div>
              </div>

              {/* Active Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 shrink-0">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-xs font-semibold text-emerald-300">
                  Active
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

            {/* Introduction */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Profile Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your professional information and current work assignment.
              </p>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Personal Information */}
              <InfoCard
                icon={User}
                title="Personal Information"
                subtitle="Your registered profile"
              >
                <DetailItem
                  icon={User}
                  label="Assistant Name"
                  value={assistantName}
                />
              </InfoCard>

              {/* Doctor */}
              <InfoCard
                icon={Stethoscope}
                title="Assigned Doctor"
                subtitle="Doctor you are assisting"
              >
                <DetailItem
                  icon={Stethoscope}
                  label="Doctor Name"
                  value={doctorName}
                />
              </InfoCard>

              {/* Hospital */}
              <InfoCard
                icon={Building2}
                title="Hospital"
                subtitle="Your associated facility"
              >
                <DetailItem
                  icon={Building2}
                  label="Hospital Name"
                  value={hospitalName}
                />
              </InfoCard>

              {/* Assignment */}
              <InfoCard
                icon={UserPlus}
                title="Work Assignment"
                subtitle="Your current healthcare role"
              >
                <div className="flex items-center gap-3">

                  {/* Assistant */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </div>

                    <span className="text-xs font-medium text-gray-400 mt-2">
                      Assistant
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06]">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>

                  {/* Doctor */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-blue-400" />
                    </div>

                    <span className="text-xs font-medium text-gray-400 mt-2">
                      Doctor
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06]">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>

                  {/* Hospital */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-400" />
                    </div>

                    <span className="text-xs font-medium text-gray-400 mt-2">
                      Hospital
                    </span>
                  </div>

                </div>
              </InfoCard>
            </div>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/[0.06]">
              <ShieldCheck className="w-4 h-4 text-emerald-500/70" />

              <p className="text-xs text-gray-500">
                Your profile information is securely protected
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantData;