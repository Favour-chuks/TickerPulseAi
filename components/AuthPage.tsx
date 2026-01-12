
import React, { useState } from 'react';
import { Activity, ArrowRight, Loader2, Lock, Mail, User, Chrome, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AuthPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { login, loginWithGoogle, register, resetPassword, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (view === 'login') {
        await login(email, password);
      } else if (view === 'register') {
        await register(email, password, firstName, lastName);
      } else if (view === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err) {
      // Error is handled in store
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#121214] border border-[#212124] p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4">
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">SignalHub</h1>
            <p className="text-slate-400 text-sm mt-1">Institutional Narrative Intelligence</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          {view === 'forgot' && resetSent ? (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Reset Link Sent</h3>
                <p className="text-slate-400 text-sm mt-2">Check your inbox at <span className="text-white">{email}</span> for instructions.</p>
              </div>
              <button 
                onClick={() => { setView('login'); setResetSent(false); }}
                className="text-emerald-500 hover:text-emerald-400 text-sm font-bold mt-4"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Work Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                  required
                />
              </div>

              {view !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    required
                  />
                </div>
              )}

              {view === 'login' && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {view === 'login' ? 'Initialize Session' : view === 'register' ? 'Create Account' : 'Send Reset Link'}
                    {view !== 'forgot' && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          )}

          {view !== 'forgot' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2d2d31]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#121214] px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-[#1c1c1f] hover:bg-[#252529] border border-[#2d2d31] text-white py-3 rounded-lg transition-all flex items-center justify-center gap-3 font-medium"
              >
                 <Chrome className="w-5 h-5" />
                 Sign in with Google
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            {view === 'login' ? (
              <button
                onClick={() => setView('register')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Don't have an access key? Register
              </button>
            ) : view === 'register' ? (
              <button
                onClick={() => setView('login')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Already have an account? Login
              </button>
            ) : (
              <button
                onClick={() => setView('login')}
                className="flex items-center justify-center gap-2 w-full text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
