import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SUPER_ADMIN_EMAIL, ADMIN_ACCESS_PASSWORD, BUSINESS_INFO } from '../../data/initialData';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onExit: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onExit }) => {
  const { loginAsAdminDirectly } = useAuth();

  const [email, setEmail] = useState<string>(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState<string>(ADMIN_ACCESS_PASSWORD);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Direct local check
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && password === ADMIN_ACCESS_PASSWORD) {
      loginAsAdminDirectly(cleanEmail, password);
      setSuccessMsg('Administrator credentials verified. Loading Admin Dashboard...');
      setTimeout(() => {
        onSuccess();
      }, 300);
    } else {
      setIsLoading(false);
      if (cleanEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        setErrorMsg(`Access Denied: Only authorized email (${SUPER_ADMIN_EMAIL}) is permitted.`);
      } else {
        setErrorMsg(`Invalid password. Please use the designated administrator password: "${ADMIN_ACCESS_PASSWORD}"`);
      }
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#090d16] text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 m-2 sm:m-4">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            B
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">BizManager Pro</span>
            <span className="text-[10px] text-blue-400 block font-medium">Enterprise Administrator Portal</span>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </button>
      </header>

      {/* Main Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Badge & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrator Sign In
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Direct secure portal for <span className="text-blue-400 font-mono font-semibold">{SUPER_ADMIN_EMAIL}</span>.
            </p>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Admin Credentials Authorized</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Email: <span className="text-slate-200 font-mono">{SUPER_ADMIN_EMAIL}</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Password: <span className="text-slate-200 font-mono">{ADMIN_ACCESS_PASSWORD}</span>
            </p>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mdomrfaruk111@gmail.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 transition-colors font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Admin Password
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-slate-600 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in to Admin Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help Footer inside Card */}
          <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-500 space-y-1">
            <p>Authorized Admin: <span className="text-slate-400 font-mono">{SUPER_ADMIN_EMAIL}</span></p>
            <p>Helpline: {BUSINESS_INFO.phone}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-800/80 px-6 flex items-center justify-between text-[11px] text-slate-500 bg-slate-950/60">
        <div>Authorized Administration • NexShop Hub</div>
        <div>Hotline: {BUSINESS_INFO.phone}</div>
      </footer>
    </div>
  );
};
