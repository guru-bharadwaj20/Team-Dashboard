import { useState } from 'react';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

const emptyForm = () => ({
  title: '',
  description: '',
  deadline: '',
  options: ['', ''],
});

const CreateProposalModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOptionChange = (index, value) => {
    setFormData((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
    setError('');
  };

  const addOption = () =>
    setFormData((prev) =>
      prev.options.length >= MAX_OPTIONS ? prev : { ...prev, options: [...prev.options, ''] }
    );

  const removeOption = (index) =>
    setFormData((prev) =>
      prev.options.length <= MIN_OPTIONS
        ? prev
        : { ...prev, options: prev.options.filter((_, i) => i !== index) }
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Proposal title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Proposal description is required');
      return;
    }

    const options = formData.options.map((o) => o.trim()).filter(Boolean);
    if (options.length < MIN_OPTIONS) {
      setError(`Please provide at least ${MIN_OPTIONS} options`);
      return;
    }

    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) {
      setError('Options must be unique');
      return;
    }

    if (formData.deadline) {
      const deadline = new Date(formData.deadline);
      if (Number.isNaN(deadline.getTime())) {
        setError('Please enter a valid deadline');
        return;
      }
      // Compared against the start of today so "today" remains selectable.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        setError('Deadline cannot be in the past');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({ ...formData, options });
      setFormData(emptyForm());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create proposal');
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
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Create New Proposal</h2>
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
              <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-gray-700">
                Proposal Title <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                placeholder="Enter proposal title"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700">
                Description <span className="text-danger-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                maxLength={5000}
                placeholder="Enter detailed proposal description"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {/* Options were previously never collected: the board hardcoded
                Yes/No/Abstain for every proposal it created. */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Options <span className="text-danger-500">*</span>
                <span className="ml-1 font-normal text-gray-500">
                  ({MIN_OPTIONS}–{MAX_OPTIONS})
                </span>
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      maxLength={200}
                      placeholder={`Option ${index + 1}`}
                      aria-label={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                    {formData.options.length > MIN_OPTIONS && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        aria-label={`Remove option ${index + 1}`}
                        className="px-3 py-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.options.length < MAX_OPTIONS && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  + Add option
                </button>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="deadline" className="block text-xs sm:text-sm font-semibold text-gray-700">
                Feedback Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProposalModal;
