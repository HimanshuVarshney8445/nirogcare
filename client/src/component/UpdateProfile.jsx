import { User, Phone, Mail, IdCard, ShieldCheck } from 'lucide-react';

const UpdatePatientProfile = ({ userData = {} }) => {
  const name = userData?.user?.name || 'N/A';
  const phone = userData?.user?.phone || 'N/A';
  const email = userData?.user?.email || 'N/A';

  const initials = name !== 'N/A'
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
    : '—';

  const rows = [
    { icon: User, label: 'Name', value: name },
    { icon: Phone, label: 'Phone', value: phone },
    { icon: Mail, label: 'Email', value: email },
    { icon: IdCard, label: 'Profile ID', value: 'Hidden for privacy', muted: true },
  ];

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0b1210] to-[#050807] p-[1px] shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/25 via-emerald-500/5 to-transparent opacity-60" />

          <div className="relative rounded-2xl bg-gradient-to-b from-[#0c1412] to-[#060a09] px-7 pt-7 pb-6 ring-1 ring-emerald-500/15">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-600/20 ring-1 ring-emerald-400/40 flex items-center justify-center">
                  <span className="text-lg font-semibold bg-gradient-to-br from-teal-200 to-emerald-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0c1412] animate-pulse" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-[0.18em] text-emerald-400/70 uppercase mb-0.5">
                  Patient Profile
                </p>
                <h2 className="text-xl font-semibold text-white truncate">
                  {name}
                </h2>
              </div>
            </div>

            {/* Signature divider — ECG pulse line */}
            <svg viewBox="0 0 400 24" className="w-full h-5 mb-6" preserveAspectRatio="none">
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

            {/* Info rows */}
            <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/5 divide-y divide-white/5">
              {rows.map(({ icon: Icon, label, value, muted }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-emerald-400/[0.04]"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
                  <span className={`text-sm font-medium truncate ${muted ? 'text-gray-500 italic' : 'text-gray-100'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
              <p className="text-xs text-gray-500">
                Your information is secure and encrypted
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePatientProfile;