import { useState } from 'react';
import { getCurrentUser } from '../utils/helpers.js';
import './Profile.css';

const Profile = () => {
  const currentUser = getCurrentUser();
  const [user] = useState(currentUser);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Mock API call
      // await user.updateProfile(formData);
      
      alert('Profile updated successfully');
      setEditMode(false);
    } catch {
      alert('Failed to update profile');
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

      {!editMode ? (
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
            <button className="profile-button secondary">
              Change Password
            </button>
            <button className="profile-button danger">
              Delete Account
            </button>
          </div>
        </>
      ) : (
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
    </div>
  );
};

export default Profile;
