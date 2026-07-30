import { useState } from 'react';
import Modal from '../common/Modal.jsx';

const CreateTeamModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit}>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div
              role="alert"
              className="bg-danger-50 border border-danger-300 text-danger-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="team-name" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Team Name <span className="text-danger-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="team-name"
              name="name"
              required
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              className="input-field text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="team-description" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="team-description"
              name="description"
              rows="3"
              maxLength={1000}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter team description"
              className="input-field text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 sm:px-6 sm:py-3 text-sm bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 sm:px-6 sm:py-3 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTeamModal;
