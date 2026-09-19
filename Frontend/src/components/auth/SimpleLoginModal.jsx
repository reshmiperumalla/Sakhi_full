import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { X, LogIn, Mail, Lock, Sparkles, AlertCircle, PhoneCall } from 'lucide-react';

export function SimpleLoginModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError(t('auth.login_error'));
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      onClose();
      window.location.reload();
    } catch (err) {
      console.warn('Login failed:', err);
      setError(t('auth.login_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('demo@mitra.org');
    setPassword('demo123');
    setError('');
    setLoading(true);
    try {
      await login('demo@mitra.org', 'demo123');
      onClose();
      window.location.reload();
    } catch (err) {
      console.warn('Demo login failed:', err);
      setError(t('auth.login_error'));
    } finally {
      setLoading(false);
    }
  };

  // Render via createPortal into document.body to ensure it escapes any header backdrop-filter / clipping
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-[#E3E7E4] shadow-elevated p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#667085] hover:text-[#263238] hover:bg-[#F7F8F5] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center font-bold text-lg shrink-0">
            🌸
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#263238] leading-tight">
              {t('auth.login_title')}
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              {t('auth.login_subtitle')}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2 text-xs text-[#991B1B]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              {t('auth.email_label')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D0D5DD] rounded-xl text-sm text-[#101828] focus:outline-none focus:border-[#176B5B] focus:ring-1 focus:ring-[#176B5B] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              {t('auth.password_label')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#98A2B3] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D0D5DD] rounded-xl text-sm text-[#101828] focus:outline-none focus:border-[#176B5B] focus:ring-1 focus:ring-[#176B5B] transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={LogIn}
            disabled={loading}
            className="w-full justify-center font-semibold mt-2"
          >
            {loading ? t('auth.logging_in') : t('auth.submit_login')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E3E7E4]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#98A2B3] font-medium">or</span>
          </div>
        </div>

        {/* 1-Click Demo Account */}
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full py-2.5 px-3 rounded-xl bg-[#F7F8F5] border border-[#E3E7E4] hover:bg-[#EEF2ED] text-xs font-semibold text-[#176B5B] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#176B5B]" />
          <span>{t('auth.demo_btn')}</span>
        </button>

        {/* Reach Out / Helpline Phone Support */}
        <div className="mt-5 pt-4 border-t border-[#E3E7E4]">
          <div className="bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#263238] leading-tight">
                  {t('auth.help_label')}
                </p>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  {t('auth.help_sub')}:{' '}
                  <a 
                    href="tel:18001201930" 
                    className="font-bold text-[#176B5B] hover:underline"
                  >
                    1800-120-1930
                  </a>
                </p>
              </div>
            </div>

            <a
              href="tel:1930"
              title="National Cyber Fraud Helpline"
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E3E7E4] hover:bg-[#FEF2F2] text-[#C54B4B] text-[11px] font-bold transition shadow-subtle shrink-0"
            >
              <span>🛡️ 1930</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
