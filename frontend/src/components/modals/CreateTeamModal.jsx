import { useState } from 'react';

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Create New Team</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg p-2 transition-all duration-200"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-danger-50 border border-danger-300 text-danger-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700">
                Team Name <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter team name"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter team description"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
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
      </div>
    </div>
  );
};

export default CreateTeamModal;
