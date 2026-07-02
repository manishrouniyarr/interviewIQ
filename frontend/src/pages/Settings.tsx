import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type AlertType = { type: 'success' | 'error'; message: string } | null;

export default function Settings() {
  const { user, token, updateUser } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState<AlertType>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<AlertType>(null);

  const showAlert = (setter: (a: AlertType) => void, type: 'success' | 'error', message: string) => {
    setter({ type, message });
    setTimeout(() => setter(null), 4000);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showAlert(setProfileAlert, 'error', 'Name and email are required.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      updateUser(data.user);
      showAlert(setProfileAlert, 'success', 'Profile updated successfully!');
    } catch (err: any) {
      showAlert(setProfileAlert, 'error', err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert(setPasswordAlert, 'error', 'All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert(setPasswordAlert, 'error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert(setPasswordAlert, 'error', 'Password must be at least 6 characters.');
      return;
    }
    setIsSavingPassword(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change password');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showAlert(setPasswordAlert, 'success', 'Password changed successfully!');
    } catch (err: any) {
      showAlert(setPasswordAlert, 'error', err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const Alert = ({ alert }: { alert: AlertType }) => {
    if (!alert) return null;
    return (
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
        alert.type === 'success'
          ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
      }`}>
        {alert.type === 'success'
          ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
          : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
        {alert.message}
      </div>
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const inputClass = "w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account preferences.</p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
      </div>

      {/* Profile section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Profile Information
        </h2>

        <div className="space-y-4 mb-5">
          <div>
            <label className={labelClass}>Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        <Alert alert={profileAlert} />

        <button
          onClick={handleUpdateProfile}
          disabled={isSavingProfile}
          className="mt-4 w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSavingProfile
            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            : <><Save className="w-4 h-4" />Save profile</>}
        </button>
      </div>

      {/* Password section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-500" />
          Change Password
        </h2>

        <div className="space-y-4 mb-5">
          {[
            { label: 'Current password', value: currentPassword, setter: setCurrentPassword },
            { label: 'New password',     value: newPassword,     setter: setNewPassword },
            { label: 'Confirm new password', value: confirmPassword, setter: setConfirmPassword },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>
          ))}
        </div>

        <Alert alert={passwordAlert} />

        <button
          onClick={handleChangePassword}
          disabled={isSavingPassword}
          className="mt-4 w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSavingPassword
            ? <><Loader2 className="w-4 h-4 animate-spin" />Changing...</>
            : <><Lock className="w-4 h-4" />Change password</>}
        </button>
      </div>
    </div>
  );
}