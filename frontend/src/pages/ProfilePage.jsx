import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  RiUserLine, RiMailLine, RiLockLine, RiCameraLine,
  RiSaveLine, RiEyeLine, RiEyeOffLine, RiShieldLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({});
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileRef = useRef();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (pwForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setPwLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setAvatarLoading(false);
    }
  };

  const togglePw = (field) => setShowPw(s => ({ ...s, [field]: !s[field] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account information</p>
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <RiUserLine /> Profile Picture
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.avatar?.url
                ? <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                : getInitials(user?.name)
              }
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.name}</p>
            <p className="text-xs text-slate-400 mb-3">{user?.email}</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-sm py-2"
              disabled={avatarLoading}
            >
              <RiCameraLine />
              Change Photo
            </button>
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, WebP up to 5MB</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <RiUserLine /> Personal Information
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10 opacity-60 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RiSaveLine />}
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <RiShieldLine /> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPassword', label: 'New Password', placeholder: '••••••••' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder={placeholder}
                  value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => togglePw(key)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw[key] ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RiShieldLine />}
              Update Password
            </button>
          </div>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Account Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Role</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize mt-0.5">{user?.role}</p>
          </div>
          <div>
            <p className="text-slate-400">Member Since</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Last Login</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Status</p>
            <span className="inline-flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
