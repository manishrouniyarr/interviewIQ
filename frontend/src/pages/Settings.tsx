import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type AlertType = { type: 'success' | 'error'; message: string } | null;

export default function Settings() {
  const { user, token, updateUser } = useAuth();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState<AlertType>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<AlertType>(null);

  const showAlert = (
    setter: (a: AlertType) => void,
    type: 'success' | 'error',
    message: string
  ) => {
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
      const response = await fetch('http://localhost:5001/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const response = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change password');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
          ? 'bg-green-900/30 border border-green-700/40 text-green-400'
          : 'bg-red-900/30 border border-red-700/40 text-red-400'
      }`}>
        {alert.type === 'success'
          ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
          : <AlertCircle className="w-4 h-4 flex-shrink-0" />
        }
        {alert.message}
      </div>
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="p-6 md:p-8 text-slate-100 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Settings</h1>
      <p className="text-slate-400 mb-8">Manage your account preferences.</p>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-slate-800 border border-slate-700 rounded-2xl">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-100">{user?.name}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Update Profile */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Profile Information
        </h2>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        <Alert alert={profileAlert} />

        <button
          onClick={handleUpdateProfile}
          disabled={isSavingProfile}
          className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSavingProfile ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
          ) : (
            <><Save className="w-4 h-4" />Save Profile</>
          )}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          Change Password
        </h2>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <Alert alert={passwordAlert} />

        <button
          onClick={handleChangePassword}
          disabled={isSavingPassword}
          className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSavingPassword ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Changing...</>
          ) : (
            <><Lock className="w-4 h-4" />Change Password</>
          )}
        </button>
      </div>
    </div>
  );
}