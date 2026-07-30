import { useState } from 'react';
import Modal from '../common/Modal.jsx';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Proposal">
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
            <label htmlFor="proposal-title" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Proposal Title <span className="text-danger-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="proposal-title"
              name="title"
              required
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter proposal title"
              className="input-field text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="proposal-description" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Description <span className="text-danger-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="proposal-description"
              name="description"
              rows="4"
              required
              maxLength={5000}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed proposal description"
              className="input-field text-sm resize-none"
            />
          </div>

          {/* Options were previously never collected: the board hardcoded
              Yes/No/Abstain for every proposal it created. */}
          <fieldset className="space-y-1.5 sm:space-y-2 border-0 p-0 m-0">
            <legend className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Options <span className="text-danger-500" aria-hidden="true">*</span>
              <span className="ml-1 font-normal text-gray-500">
                ({MIN_OPTIONS}&ndash;{MAX_OPTIONS})
              </span>
            </legend>
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
                    className="input-field flex-1 text-sm py-2"
                  />
                  {formData.options.length > MIN_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      aria-label={`Remove option ${index + 1}`}
                      className="px-3 py-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
                    >
                      <span aria-hidden="true">&#10005;</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                + Add option
              </button>
            )}
          </fieldset>

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="proposal-deadline" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Feedback Deadline
            </label>
            <input
              type="date"
              id="proposal-deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="input-field text-sm"
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
            {loading ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProposalModal;
