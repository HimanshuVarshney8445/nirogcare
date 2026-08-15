import { useState } from 'react';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Loader,
  ArrowLeft,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  CalendarCheck,
} from 'lucide-react';
import { callAuthLoginApi, callAuthRegisterApi } from '../api/authServices';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { refetchUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setErrorMessage('');
    setShowPassword(false);

    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    try {
      setIsLoading(true);

      const response = isSignup
        ? await callAuthRegisterApi(formData)
        : await callAuthLoginApi(formData.email, formData.password);

      if (response?.user) {
        await refetchUser();

        toast.success(
          isSignup
            ? 'Account created successfully!'
            : 'Logged in successfully!'
        );

        navigate(
          response.user.role
            ? `/${response.user.role}/dashboard`
            : '/select-role'
        );
      }
    } catch (error) {
      const message =
        error.message || 'Authentication failed. Please try again.';

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex flex-col">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-3xl" />

      </div>

      {/* ================= HEADER ================= */}
      <header className="relative z-10 w-full px-6 md:px-10 py-4">

        <div className="flex items-center justify-between">

          {/* Back Home */}
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-gray-400 hover:text-emerald-300 transition-all duration-200"
          >

            <div className="w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/70 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all">

              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />

            </div>

            <span className="hidden sm:block text-sm font-medium">
              Back Home
            </span>

          </button>

        </div>

      </header>

      {/* ================= MAIN ================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">

        <div className="w-full max-w-4xl">

          <div className="grid lg:grid-cols-[0.9fr_1fr] bg-gray-900/70 backdrop-blur-2xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">

            {/* ================= LEFT PANEL ================= */}
            <div className="hidden lg:flex relative p-8 xl:p-9 flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 border-r border-gray-800">

              <div>

                {/* Logo */}
                <div className="flex items-center space-x-3 mb-8">

                  <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30">

                    <Stethoscope className="text-emerald-300 w-7 h-7" />

                  </div>

                  <div>

                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                      NirogCare
                    </h1>

                    <p className="text-xs text-gray-500">
                      Your health, our care
                    </p>

                  </div>

                </div>

                {/* Main Heading */}
                <div className="max-w-sm">

                  <p className="text-emerald-400 text-sm font-semibold mb-3 tracking-wide">
                    YOUR HEALTH MATTERS
                  </p>

                  <h2 className="text-4xl xl:text-[2.7rem] font-bold leading-tight mb-5">

                    Healthcare made

                    <span className="block bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                      simpler for you.
                    </span>

                  </h2>

                  <p className="text-gray-400 text-base leading-relaxed">

                    {isSignup
                      ? 'Create your NirogCare account and take the first step towards simpler, smarter and more accessible healthcare.'
                      : 'Sign in to access your healthcare journey, manage appointments and stay connected with the care you need.'}

                  </p>

                </div>

              </div>

              {/* Bottom */}
              <div className="mt-7">

                <div className="flex items-center gap-3 text-gray-500 text-xs">

                  <div className="w-8 h-px bg-gradient-to-r from-emerald-500 to-cyan-500" />

                  <span>
                    Caring technology for better healthcare
                  </span>

                </div>

              </div>

              {/* Decorative Circles */}
              <div className="absolute -bottom-20 -right-20 w-52 h-52 border border-emerald-500/10 rounded-full" />

              <div className="absolute -bottom-12 -right-12 w-40 h-40 border border-cyan-500/10 rounded-full" />

            </div>

            {/* ================= RIGHT FORM ================= */}
            <div className="p-7 sm:p-9 xl:p-10">

              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-7">

                <div className="flex items-center space-x-3">

                  <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30">

                    <Stethoscope className="text-emerald-300 w-7 h-7" />

                  </div>

                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                    NirogCare
                  </h1>

                </div>

              </div>

              {/* Form Heading */}
              <div className="mb-7">

                <p className="text-emerald-400 text-sm font-semibold mb-2 tracking-wide">

                  {isSignup
                    ? 'JOIN NIROGCARE'
                    : 'WELCOME BACK'}

                </p>

                <h2 className="text-3xl font-bold text-white mb-2">

                  {isSignup
                    ? 'Create your account'
                    : 'Welcome back'}

                </h2>

                <p className="text-gray-400 text-sm leading-relaxed">

                  {isSignup
                    ? 'Create your account to access personalized healthcare services.'
                    : 'Sign in to continue to your NirogCare account.'}

                </p>

              </div>

              {/* ================= FORM ================= */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* Full Name */}
                {isSignup && (
                  <div>

                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>

                    <div className="relative group">

                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />

                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-base text-white placeholder-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />

                    </div>

                  </div>
                )}

                {/* Phone */}
                {isSignup && (
                  <div>

                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>

                    <div className="relative group">

                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-base text-white placeholder-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />

                    </div>

                  </div>
                )}

                {/* Email */}
                <div>

                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>

                  <div className="relative group">

                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-base text-white placeholder-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>

                  <div className="relative group">

                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-base text-white placeholder-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                    >

                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}

                    </button>

                  </div>

                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-base font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:from-emerald-600 hover:to-cyan-700 hover:shadow-emerald-500/20 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
                >

                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {isSignup
                        ? 'Create NirogCare Account'
                        : 'Sign In'}

                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}

                </button>

              </form>

              {/* Switch Login / Signup */}
              <div className="mt-7 text-center">

                <p className="text-gray-400 text-sm">
                  {isSignup
                    ? 'Already have a NirogCare account?'
                    : "Don't have a NirogCare account?"}
                </p>

                <button
                  type="button"
                  onClick={toggleMode}
                  className="mt-2 text-emerald-400 text-base font-semibold hover:text-emerald-300 transition-colors"
                >
                  {isSignup
                    ? 'Sign in here'
                    : 'Create an account'}
                </button>

              </div>

              {/* Security */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-600">

                <ShieldCheck className="w-4 h-4 text-emerald-500/70" />

                <span>
                  Your healthcare information is securely protected
                </span>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 px-6 py-3">

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">

          <p>
            © {new Date().getFullYear()} NirogCare. All rights reserved.
          </p>

          <div className="flex items-center gap-5">

            <button className="hover:text-gray-300 transition-colors">
              Privacy
            </button>

            <button className="hover:text-gray-300 transition-colors">
              Terms
            </button>

            <span className="flex items-center gap-1.5">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

              Secure Healthcare Platform

            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default Auth;