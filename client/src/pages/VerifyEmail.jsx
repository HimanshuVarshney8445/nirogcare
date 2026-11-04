import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, Mail, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import {
  resendRegistrationOtpApi,
  verifyRegistrationOtpApi,
} from "../api/authServices";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.max(0, Number(location.state?.resendAfterSeconds) || 0),
  );
  const [message, setMessage] = useState(location.state?.initialError || "");
  const [messageType, setMessageType] = useState(
    location.state?.initialError ? "error" : "success",
  );

  useEffect(() => {
    if (secondsRemaining <= 0) return undefined;
    const timer = window.setTimeout(
      () => setSecondsRemaining((remaining) => Math.max(0, remaining - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  if (!email) {
    return <Navigate to="/auth" replace />;
  }

  const handleVerify = async (event) => {
    event.preventDefault();
    if (loading || otp.length !== 6) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await verifyRegistrationOtpApi(email, otp);
      toast.success(response.message || "Email verified. You can now sign in.");
      navigate("/auth", { replace: true });
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to verify this code. Please try again.");
      if (error.status === 410 || error.status === 429) setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || secondsRemaining > 0) return;

    setResending(true);
    setMessage("");
    try {
      const response = await resendRegistrationOtpApi(email);
      setSecondsRemaining(response.resendAfterSeconds ?? 60);
      setOtp("");
      setMessageType("success");
      setMessage(response.message || "A new verification code was sent.");
    } catch (error) {
      if (error.data?.resendAfterSeconds) {
        setSecondsRemaining(error.data.resendAfterSeconds);
      }
      setMessageType("error");
      setMessage(error.message || "Unable to resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <section className="relative w-full max-w-lg p-7 sm:p-10 bg-gray-900/80 backdrop-blur-2xl border border-gray-800 rounded-3xl shadow-2xl">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="flex items-center gap-3 mt-8 mb-8">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30">
            <Stethoscope className="text-emerald-300 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              NirogCare
            </h1>
            <p className="text-xs text-gray-500">Your health, our care</p>
          </div>
        </div>

        <div className="w-14 h-14 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Mail className="w-7 h-7 text-emerald-300" />
        </div>
        <p className="text-emerald-400 text-sm font-semibold mb-2 tracking-wide">
          EMAIL VERIFICATION
        </p>
        <h2 className="text-3xl font-bold mb-3">Check your inbox</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Enter the 6-digit code we sent to{" "}
          <span className="text-gray-200 font-medium break-all">{email}</span>.
          The code expires in 5 minutes.
        </p>

        <form onSubmit={handleVerify} className="mt-7 space-y-5">
          <label htmlFor="registration-otp" className="sr-only">
            6-digit verification code
          </label>
          <input
            id="registration-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            required
            aria-label="6-digit verification code"
            className="w-full px-4 py-4 bg-gray-800/60 border border-gray-700 rounded-xl text-center text-2xl tracking-[0.6em] text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />

          {message && (
            <div
              role={messageType === "error" ? "alert" : "status"}
              className={`px-4 py-3 rounded-xl border text-sm text-center ${
                messageType === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:from-emerald-600 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify email
                <ShieldCheck className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || secondsRemaining > 0}
            className="font-semibold text-emerald-400 hover:text-emerald-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {resending
              ? "Sending..."
              : secondsRemaining > 0
                ? `Resend in ${secondsRemaining}s`
                : "Resend code"}
          </button>
        </div>
      </section>
    </main>
  );
};

export default VerifyEmail;
