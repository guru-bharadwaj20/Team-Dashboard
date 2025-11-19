import { useState } from 'react';
import { getCurrentUser } from '../utils/helpers.js';
import { authApi } from '../api/authApi.js';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [user] = useState(currentUser);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await authApi.updateProfile(formData.name, formData.email);
      
      alert(res.message || 'Profile updated successfully');
      
      // Update local user state
      setFormData({
        name: res.user.name,
        email: res.user.email,
      });
      
      setEditMode(false);
      
      // Refresh page to update UI with new user data
      window.location.reload();
    } catch (error) {
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      alert(res.message || 'Password changed successfully');
      setChangePasswordMode(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Failed to change password: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will delete all your teams and proposals.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your last chance. Are you absolutely sure you want to permanently delete your account?'
    );

    if (!doubleConfirm) return;

    try {
      await authApi.deleteAccount();
      
      alert('Account deleted successfully');
      navigate('/');
    } catch (error) {
      alert('Failed to delete account: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
      </div>

      {/* Profile Information */}
      {!editMode && !changePasswordMode && (
        <>
          <div className="profile-info">
            <div className="profile-info-item">
              <div className="profile-info-label">Name</div>
              <div className="profile-info-value">{user.name}</div>
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-info-item">
              <div className="profile-info-label">Email</div>
              <div className="profile-info-value">{user.email}</div>
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-info-item">
              <div className="profile-info-label">Member Since</div>
              <div className="profile-info-value">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="profile-button primary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
            <button 
              className="profile-button secondary"
              onClick={() => setChangePasswordMode(true)}
            >
              Change Password
            </button>
            <button 
              className="profile-button danger"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </>
      )}

      {/* Edit Profile Mode */}
      {editMode && (
        <div className="profile-section">
          <h2 className="profile-section-title">Edit Profile</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="profile-actions">
              <button
                className="profile-button primary"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                className="profile-button secondary"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: user.name,
                    email: user.email,
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Mode */}
      {changePasswordMode && (
        <div className="profile-section">
          <h2 className="profile-section-title">Change Password</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>
            <div className="profile-actions">
              <button
                className="profile-button primary"
                onClick={handlePasswordUpdate}
              >
                Update Password
              </button>
              <button
                className="profile-button secondary"
                onClick={() => {
                  setChangePasswordMode(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
