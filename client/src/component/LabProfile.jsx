import React from "react";
import {
  User,
  Phone,
  IdCard,
  MapPin,
  FlaskConical,
  ShieldCheck,
  Pencil,
} from "lucide-react";

const DetailField = ({
  icon: Icon,
  iconColor,
  label,
  value,
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-10 h-10 rounded-lg bg-black/20 border border-white/5 flex items-center justify-center shrink-0">
      <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
    </div>

    <div className="min-w-0 pt-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="text-sm font-medium text-gray-100 truncate">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const LabProfileView = ({
  labData,
  onUpdateProfile,
}) => {
  const initials = (labData?.name || "L")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="text-white max-w-3xl w-full">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-green-600/20 bg-gradient-to-br from-gray-900 via-gray-900 to-green-950/40 p-6 mb-5">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-green-500/5 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">

            {/* Lab Information */}
            <div className="flex items-center gap-4 min-w-0">

              {/* Lab Initials */}
              <div className="w-16 h-16 rounded-2xl bg-green-400/10 border border-green-500/30 flex items-center justify-center shrink-0">
                <span className="text-xl font-semibold text-green-400">
                  {initials}
                </span>
              </div>

              {/* Lab Name */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold text-white leading-tight truncate">
                    {labData?.name || "Lab profile"}
                  </h2>

                  <ShieldCheck className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                </div>

                <p className="text-sm text-gray-400 mt-0.5">
                  Diagnostic laboratory · License{" "}
                  {labData?.licenseNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Active Status */}
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 border border-green-500/30 text-xs font-medium text-green-300 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Active
              </span>

              {/* Update Profile Button */}
              <button
                type="button"
                onClick={() => {
                  if (onUpdateProfile) {
                    onUpdateProfile();
                  }
                }}
                className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-sm font-medium text-green-300 hover:bg-green-500/20 hover:border-green-400/40 hover:text-green-200 transition-all duration-200"
              >
                <Pencil className="w-4 h-4" />
                <span>Update Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contact and Identity */}
        <div className="bg-gray-900/50 rounded-2xl border border-green-600/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Contact and identity
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

            <DetailField
              icon={User}
              iconColor="text-teal-400"
              label="Name"
              value={labData?.name}
            />

            <DetailField
              icon={Phone}
              iconColor="text-teal-400"
              label="Phone"
              value={labData?.phone}
            />

            <DetailField
              icon={IdCard}
              iconColor="text-yellow-300"
              label="License number"
              value={labData?.licenseNumber}
            />

            <DetailField
              icon={MapPin}
              iconColor="text-cyan-400"
              label="Address"
              value={labData?.address}
            />

          </div>
        </div>

        {/* Test Types */}
        <div className="bg-gray-900/50 rounded-2xl border border-green-600/20 p-5 mt-4">

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Test types offered
            </p>

            <span className="text-xs text-gray-500">
              {labData?.testTypes?.length || 0} total
            </span>
          </div>

          {labData?.testTypes?.length ? (
            <div className="flex flex-wrap gap-2">
              {labData.testTypes.map((type, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-black/20 border border-green-500/20 text-green-300"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-green-400" />
                  {type}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No test types listed
            </p>
          )}

        </div>

      </div>
    </div>
  );
};

export default LabProfileView;