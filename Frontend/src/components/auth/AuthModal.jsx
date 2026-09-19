import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Sparkles, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { login, register, loginAsDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedLang, setSelectedLang] = useState(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          name,
          preferred_language: selectedLang
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo();
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-500/30 mb-3">
            🌱
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {mode === 'login' ? t('auth.login_title') : t('auth.register_title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            AI Financial Empowerment for Irregular Incomes
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-emerald-900">Instant Demo Access</div>
              <div className="text-[11px] text-emerald-700">Preloaded with farmer cashflow, scam scenarios & games</div>
            </div>
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={loading}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('auth.demo_btn')}</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            or continue with email
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('auth.name')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Language
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                <option value="te">🇮🇳 తెలుగు (Telugu)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : mode === 'login' ? t('auth.login_btn') : t('auth.register_btn')}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            {mode === 'login' ? t('auth.switch_to_register') : t('auth.switch_to_login')}
          </button>
        </div>
      </div>
    </div>
  );
}
