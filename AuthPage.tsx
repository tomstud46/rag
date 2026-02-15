import React, { useState } from 'react';
import { Bot, Mail, Lock, User as UserIcon, ArrowRight, Chrome, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ------------------------------
  // Email/Password Authentication
  // ------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || (!isLogin && !username)) {
      setError("Please fill in all security parameters.");
      return;
    }

    setLoading(true);
    try {
      let user: User;
      if (isLogin) {
        user = await apiService.login(email, password);
        setSuccess("Authentication successful. Redirecting to dashboard...");
        setTimeout(() => onLogin(user), 1000);
      } else {
        user = await apiService.register(username, email, password);
        setSuccess("Account initialized. Redirecting to dashboard...");
        setTimeout(() => onLogin(user), 1000);
      }
    } catch (err: any) {
      if (err.message === "ACCOUNT_NOT_FOUND") {
        setError("Account not found. Please sign up.");
        setTimeout(() => {
          setIsLogin(false);
          setError(null);
        }, 1500);
      } else if (err.message === "ACCOUNT_ALREADY_EXISTS") {
        setError("Account already exists. Please log in.");
        setTimeout(() => {
          setIsLogin(true);
          setError(null);
        }, 1500);
      } else if (err.message === "INVALID_CREDENTIALS") {
        setError("Invalid credentials. Please verify your passphrase.");
      } else {
        setError("Authentication handshake failed. Try again.");
      }
      setLoading(false);
    }
  };

  // ------------------------------
  // Google Sign-In
  // ------------------------------
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google OAuth failed: No credential returned.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send credential to your backend to verify/create user
      const user: User = await apiService.googleLogin(credentialResponse.credential);
      setSuccess("Google OAuth successful. Redirecting...");
      setTimeout(() => onLogin(user), 1000);
    } catch (err) {
      console.error(err);
      setError("Google OAuth link failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-[#12161c] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 relative">
        <div className="bg-[#4ade80] p-10 text-black text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent"></div>
          <div className="relative z-10">
            <div className="bg-black/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-black/10 shadow-lg group">
              <Bot size={40} className="text-black group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">TechCorp AI</h2>
            <p className="text-black/60 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Neural Interface Access</p>
          </div>
        </div>

        <div className="p-10 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-500 leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="text-[#4ade80] flex-shrink-0" />
              <p className="text-xs font-bold text-[#4ade80] leading-tight">{success}</p>
            </div>
          )}

          {/* ------------------- Google Sign-In ------------------- */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google OAuth link failed.")}
            />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">or cryptolink</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          {/* ------------------- Email/Password Form ------------------- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Identity</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="text" 
                    disabled={loading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Operator Name"
                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 text-white rounded-2xl focus:border-[#4ade80]/40 outline-none transition-all font-medium placeholder:text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Comm Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" 
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@techcorp.io"
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 text-white rounded-2xl focus:border-[#4ade80]/40 outline-none transition-all font-medium placeholder:text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Passphrase</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" 
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 text-white rounded-2xl focus:border-[#4ade80]/40 outline-none transition-all font-medium placeholder:text-slate-800"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#4ade80] text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-[#4ade80]/10 flex items-center justify-center gap-3 mt-6 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isLogin ? 'Establish Link' : 'Initialize Core'}
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 font-bold">
            {isLogin ? "No identity found?" : "Already verified?"}{' '}
            <button 
              type="button"
              disabled={loading}
              onClick={() => {setIsLogin(!isLogin); setError(null); setSuccess(null);}}
              className="text-[#4ade80] font-black hover:underline underline-offset-4 uppercase tracking-tighter"
            >
              {isLogin ? 'Register Node' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
