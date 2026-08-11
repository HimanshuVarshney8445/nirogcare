import React from 'react';
import { Building2, UserPlus, User, Stethoscope, Hash, ShieldCheck } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-emerald-400/[0.04]">
    <div className="w-9 h-9 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/20 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-emerald-400" />
    </div>
    <span className="font-semibold text-lg text-gray-300 w-40 shrink-0">{label}:</span>
    <span className="text-white text-lg ml-0 truncate">{value || 'N/A'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-8 last:mb-0">
    <h3 className="text-xl text-white font-semibold mb-3 flex items-center gap-2">
      {title}
      <span className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
    </h3>
    <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/5 divide-y divide-white/5">
      {children}
    </div>
  </div>
);

const AssistantData = ({ assistantData, userData }) => {
  const assistant = assistantData?.assistant;

  const doctorName = assistant?.doctorId?.userId?.name;
  const doctorId = assistant?.doctorId?._id;
  const hospitalName = assistant?.hospitalId?.name;
  const hospitalId = assistant?.hospitalId?._id;
  const assistantName = userData?.user?.name;
  const assistantId = assistant?._id;

  const initials = assistantName
    ? assistantName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : '—';

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#0b1210] to-[#050807] p-[1px] shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/25 via-emerald-500/5 to-transparent opacity-60" />

          <div className="relative rounded-3xl bg-gradient-to-b from-[#0c1412] to-[#060a09] px-10 pt-10 pb-8 ring-1 ring-emerald-500/15">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-600/20 ring-1 ring-emerald-400/40 flex items-center justify-center">
                  <span className="text-xl font-semibold bg-gradient-to-br from-teal-200 to-emerald-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#0c1412] animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <UserPlus className="w-8 h-8 text-blue-400 shrink-0" />
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-green-300 bg-clip-text text-transparent truncate">
                    Assistant Profile
                  </h2>
                </div>
                <p className="text-gray-400 text-lg">Here are the details of your profile</p>
              </div>
            </div>

            {/* Signature divider — ECG pulse line */}
            <svg viewBox="0 0 400 24" className="w-full h-5 mb-8" preserveAspectRatio="none">
              <path
                d="M0 12 H150 L162 12 L170 2 L180 22 L190 4 L198 12 H400"
                fill="none"
                stroke="url(#pulseGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                  <stop offset="45%" stopColor="#2dd4bf" stopOpacity="0.9" />
                  <stop offset="55%" stopColor="#67e8f9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <Section title="Assistant Info">
              <InfoRow icon={User} label="Assistant Name" value={assistantName} />
              <InfoRow icon={Hash} label="Assistant Id" value={assistantId} />
            </Section>

            <Section title="Doctor Info">
              <InfoRow icon={Stethoscope} label="Doctor Name" value={doctorName} />
              <InfoRow icon={Hash} label="Doctor ID" value={doctorId} />
            </Section>

            <Section title="Hospital Info">
              <InfoRow icon={Building2} label="Hospital Name" value={hospitalName} />
              <InfoRow icon={Hash} label="Hospital ID" value={hospitalId} />
            </Section>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 mt-8 pt-6 border-t border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
              <p className="text-sm text-gray-500">
                Your information is secure and encrypted
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantData;