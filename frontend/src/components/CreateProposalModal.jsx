import { useState } from 'react';
import '../Modal.css';

const CreateProposalModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
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

    if (!formData.title.trim()) {
      setError('Proposal title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Proposal description is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ title: '', description: '', deadline: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Proposal</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}

            <div className="form-group">
              <label htmlFor="title">Proposal Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter proposal title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed proposal description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Voting Deadline</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button primary"
              disabled={loading}
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
