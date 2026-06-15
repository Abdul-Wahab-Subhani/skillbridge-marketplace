import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/me', form);
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      const { data } = await api.post('/providers/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = { ...user, avatar: data.data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-800 dark:text-white">My Account</h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-300">
        Manage your account details and security settings.
      </p>

      {/* Avatar */}
      <div className="mt-6 card p-6">
        <h2 className="font-semibold text-brand-800 dark:text-white">Profile Photo</h2>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-500 dark:bg-brand-700">
                {user?.name?.[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-accent-500 text-white hover:bg-accent-600">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-100">
              {uploadingAvatar ? 'Uploading...' : 'Click the camera icon to update your photo'}
            </p>
            <p className="text-xs text-brand-400">JPG, PNG or WebP · Max 5MB</p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <form onSubmit={handleProfileSave} className="mt-4 card p-6 space-y-4">
        <h2 className="font-semibold text-brand-800 dark:text-white">Personal Details</h2>
        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email (read-only)</label>
          <input className="input bg-brand-50 dark:bg-brand-700/50 cursor-not-allowed" value={user?.email || ''} readOnly />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className="input"
            placeholder="+92 300 0000000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
          <span className="badge bg-brand-50 text-brand-500 dark:bg-brand-700 dark:text-brand-300 capitalize">
            {user?.role}
          </span>
        </div>
      </form>

      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="mt-4 card p-6 space-y-4">
        <h2 className="font-semibold text-brand-800 dark:text-white">Change Password</h2>
        <div>
          <label className="label">Current Password</label>
          <input
            type="password"
            required
            className="input"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="label">New Password (min. 6 characters)</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
          />
        </div>
        <button type="submit" disabled={savingPw} className="btn-primary">
          {savingPw ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
