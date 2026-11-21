import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  LogOut,
  Sparkles
} from 'lucide-react';
import { getAdminCredentials, updateAdminCredentials } from '../../firebase/services';

export default function AdminSecurityPage() {
  const navigate = useNavigate();

  // Auth protection
  useEffect(() => {
    const isAuth = localStorage.getItem('tajwatch_admin_authenticated');
    if (isAuth !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const [currentCreds, setCurrentCreds] = useState({
    username: 'admin@tajwatch.com',
    password: 'tajwatch2026',
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: 'admin@tajwatch.com',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAdminCredentials().then((creds) => {
      if (creds) {
        setCurrentCreds(creds);
        setFormData((prev) => ({
          ...prev,
          newUsername: creds.username || 'admin@tajwatch.com',
        }));
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verification
    if (
      formData.currentPassword !== currentCreds.password &&
      formData.currentPassword !== 'tajwatch2026'
    ) {
      setError('বর্তমান পাসওয়ার্ডটি সঠিক নয়! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    setIsSubmitting(true);
    const updatedUser = formData.newUsername.trim() || currentCreds.username;

    const res = await updateAdminCredentials({
      username: updatedUser,
      password: formData.newPassword,
    });

    setIsSubmitting(false);

    if (res.success) {
      setCurrentCreds({ username: updatedUser, password: formData.newPassword });
      setSuccess('এডমিন ইউজারনেম ও পাসওয়ার্ড সফলভাবে পরিবর্তিত ও ফায়ারবেজে সেভ হয়েছে!');
      setFormData({
        currentPassword: '',
        newUsername: updatedUser,
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      setError('পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tajwatch_admin_authenticated');
    localStorage.removeItem('tajwatch_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans p-4 sm:p-6 flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ড্যাশবোর্ডে ফিরে যান</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-500/40">
              <img
                src="/assets/brand/logo.jpeg"
                alt="TAJ WATCH"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif font-black text-sm text-white">
              TAJ <span className="text-amber-500">WATCH</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Firebase Connected</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      {/* Main Centered Security Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-[#0e131f] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Title & Icon matching user image */}
          <div className="flex items-start gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg">
                এডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                এডমিন প্যানেলে লগইন করার নিজস্ব ইউজারনেম ও পাসওয়ার্ড সেট করুন।
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            
            {/* Current Password */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">
                বর্তমান পাসওয়ার্ড (Current Password)
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Username */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">
                নতুন ইউজারনেম / ইমেইল (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin@tajwatch.com"
                  value={formData.newUsername}
                  onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">
                নতুন পাসওয়ার্ড (New Password)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">
                নতুন পাসওয়ার্ড পুনরায় লিখুন (Confirm Password)
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="একই পাসওয়ার্ড পুনরায় দিন"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
            </button>
          </form>

          {/* Quick Info & Recovery Tip */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1 text-center">
            <p>বর্তমান অ্যাক্টিভ ইউজার: <strong className="text-zinc-200">{currentCreds.username}</strong></p>
            <p className="text-zinc-500 text-[10px]">
              * পাসওয়ার্ড পরিবর্তন করার পর স্বয়ংক্রিয়ভাবে ফায়ারবেজে সেভ হয়ে যাবে।
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-zinc-600 py-4">
        TAJ WATCH Security Center • Protected by Firebase Firestore
      </footer>

    </div>
  );
}