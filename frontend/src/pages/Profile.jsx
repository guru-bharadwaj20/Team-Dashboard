import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/helpers.js';
import { user as userAPI } from '../utils/api.js';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [user] = useState(currentUser);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      await userAPI.updateProfile(formData);
      alert('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      alert(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await userAPI.changePassword(passwordData);
      alert('Password changed successfully');
      setChangePasswordMode(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== currentUser?.email) {
      alert('Email does not match. Please enter your email to confirm.');
      return;
    }

    try {
      setLoading(true);
      await userAPI.deleteAccount();
      alert('Account deleted successfully');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      navigate('/');
    } catch (err) {
      alert(err?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
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

      {!editMode && !changePasswordMode && !deleteMode ? (
        <>
          <div className="profile-info">
            <div className="profile-info-item">
              <div className="profile-info-label">Name</div>
              <div className="profile-info-value">{user.name}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Email</div>
              <div className="profile-info-value">{user.email}</div>
            </div>
            <div className="profile-info-item">
              <div className="profile-info-label">Member Since</div>
              <div className="profile-info-value">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">Statistics</h2>
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Teams Joined</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">47</div>
                <div className="stat-label">Votes Cast</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">23</div>
                <div className="stat-label">Proposals Created</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">156</div>
                <div className="stat-label">Comments</div>
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
              onClick={() => setDeleteMode(true)}
            >
              Delete Account
            </button>
          </div>
        </>
      ) : editMode ? (
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
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
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
      ) : changePasswordMode ? (
        <div className="profile-section">
          <h2 className="profile-section-title">Change Password</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="oldPassword"
                placeholder="Enter your current password"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password (min 6 characters)"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="profile-actions">
              <button
                className="profile-button primary"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                className="profile-button secondary"
                onClick={() => {
                  setChangePasswordMode(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : deleteMode ? (
        <div className="profile-section">
          <h2 className="profile-section-title">Delete Account</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <p style={{ color: '#991b1b', fontWeight: '600', margin: '0 0 0.5rem 0' }}>⚠️ Warning: This action is permanent</p>
              <p style={{ color: '#7f1d1d', margin: 0 }}>Deleting your account will remove all your data including teams, proposals, and voting history. This cannot be undone.</p>
            </div>
            <div className="form-group">
              <label>Type your email to confirm deletion</label>
              <input
                type="email"
                placeholder={currentUser?.email}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <small style={{ color: '#6b7280' }}>Type: {currentUser?.email}</small>
            </div>
            <div className="profile-actions">
              <button
                className="profile-button danger"
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirm !== currentUser?.email}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                className="profile-button secondary"
                onClick={() => {
                  setDeleteMode(false);
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
