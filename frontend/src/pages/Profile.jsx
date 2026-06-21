import { useState } from 'react';
import { getCurrentUser, saveCurrentUser } from '../utils/helpers.js';
import { authApi } from '../api/index.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const stored = getCurrentUser();

  const [user, setUser] = useState(stored);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: stored?.name || '',
    email: stored?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const flash = (msg, isError = false) => {
    if (isError) { setErrorMsg(msg); setSuccessMsg(''); }
    else { setSuccessMsg(msg); setErrorMsg(''); }
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswordData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      const res = await authApi.updateProfile(formData.name, formData.email);
      const updated = res?.user || { ...user, name: formData.name, email: formData.email };
      saveCurrentUser(updated);
      setUser(updated);
      setFormData({ name: updated.name, email: updated.email });
      setEditMode(false);
      flash('Profile updated successfully');
    } catch (err) {
      flash('Failed to update profile: ' + (err.response?.data?.message || err.message), true);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      flash('New passwords do not match', true); return;
    }
    if (passwordData.newPassword.length < 6) {
      flash('Password must be at least 6 characters', true); return;
    }
    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setChangePasswordMode(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      flash('Password changed successfully');
    } catch (err) {
      flash('Failed to change password: ' + (err.response?.data?.message || err.message), true);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? All teams and proposals will be permanently removed.')) return;
    if (!window.confirm('This cannot be undone. Are you absolutely sure?')) return;
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      flash('Failed to delete account: ' + (err.response?.data?.message || err.message), true);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-8">
          My Profile
        </h1>

        {/* Flash messages */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-300 text-green-800 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* View Mode */}
        {!editMode && !changePasswordMode && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {initials}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{user.name}</div>
                  <div className="text-gray-500 text-sm">{user.email}</div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Full Name</div>
                  <div className="text-lg text-gray-900 font-medium">{user.name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</div>
                  <div className="text-lg text-gray-900 font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Member Since</div>
                  <div className="text-lg text-gray-900 font-medium">{memberSince}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setChangePasswordMode(true)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl shadow transition-all"
              >
                Change Password
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {editMode && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow transition-all">
                  Save Changes
                </button>
                <button
                  onClick={() => { setEditMode(false); setFormData({ name: user.name, email: user.email }); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Mode */}
        {changePasswordMode && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
            <div className="space-y-5">
              {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    name={field}
                    value={passwordData[field]}
                    onChange={handlePasswordChange}
                    placeholder={field === 'newPassword' ? 'Min 6 characters' : ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handlePasswordUpdate} className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow transition-all">
                  Update Password
                </button>
                <button
                  onClick={() => { setChangePasswordMode(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
