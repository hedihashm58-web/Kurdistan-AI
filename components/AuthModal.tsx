
import React, { useState } from 'react';
import { register, login, saveSession, User } from '../services/authService';

interface AuthModalProps {
  onAuthenticated: (user: User) => void;
}

type Mode = 'login' | 'signup';

const errorMessages: Record<string, string> = {
  EMAIL_EXISTS: 'ئەم ئیمەیڵە پێشتر تۆمارکراوە',
  USERNAME_EXISTS: 'ئەم ناوە پێشتر تۆمارکراوە',
  INVALID_CREDENTIALS: 'ئیمەیڵ یان وشەی نهێنی هەڵەیە',
  WEAK_PASSWORD: 'وشەی نهێنی دەبێت لانی کەم ٨ پیت بێت',
  REQUIRED: 'تکایە هەموو خانەکان پڕ بکەرەوە',
};

const AuthModal: React.FC<AuthModalProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || (mode === 'signup' && !username.trim())) {
      setError(errorMessages.REQUIRED);
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError(errorMessages.WEAK_PASSWORD);
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('وشەی نهێنی و پشتڕاستکردنەوەکەی یەک نین');
      return;
    }

    setLoading(true);
    try {
      let user: User;
      if (mode === 'signup') {
        user = await register(username.trim(), email.trim(), password);
      } else {
        user = await login(email.trim(), password);
      }
      saveSession(user);
      onAuthenticated(user);
    } catch (err: any) {
      const code = err?.message as string;
      setError(errorMessages[code] || 'کێشەیەک ڕوویدا، دووبارە هەوڵ بدەرەوە');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white/5 border border-yellow-500/20 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition-all font-["Noto_Sans_Arabic"] text-sm';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#010204]" dir="rtl">
      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Card */}
        <div className="bg-white/[0.02] border border-yellow-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] backdrop-blur-3xl">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-[1.3rem] royal-sun-emblem flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(255,215,0,0.25)]" role="img" aria-label="KurdAI logo">☀️</div>
            <h1 className="text-3xl font-black royal-gold-gradient tracking-tighter font-['Noto_Sans_Arabic']">KurdAI Pro</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] font-['Noto_Sans_Arabic']">ژیریی نیشتمانیی کوردستان</p>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl">
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all font-['Noto_Sans_Arabic'] ${
                  mode === m
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'text-slate-400 hover:text-yellow-500'
                }`}
              >
                {m === 'login' ? 'چوونەژوورەوە' : 'تۆمارکردن'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="ناو"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={inputCls}
                autoComplete="username"
              />
            )}
            <input
              type="email"
              placeholder="ئیمەیڵ"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="وشەی نهێنی"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputCls}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'signup' && (
              <input
                type="password"
                placeholder="دووبارەکردنەوەی وشەی نهێنی"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            )}

            {error && (
              <p className="text-red-400 text-xs font-bold text-center font-['Noto_Sans_Arabic'] bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-black font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_8px_30px_rgba(234,179,8,0.3)] font-['Noto_Sans_Arabic']"
            >
              {loading ? '...' : mode === 'login' ? 'چوونەژوورەوە' : 'دامەزراندن'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
