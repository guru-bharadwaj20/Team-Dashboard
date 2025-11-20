import Contact from '../models/Contact.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Please provide name, email, subject, and message' 
      });
    }

    if (message.length < 10) {
      return res.status(400).json({ 
        message: 'Message must be at least 10 characters long' 
      });
    }

    // Create contact message
    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await contact.save();

    res.status(201).json({
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      },
    });
  } catch (error) {
    console.error('Error submitting contact:', error);
    res.status(500).json({ 
      message: 'Failed to submit message', 
      error: error.message 
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      total: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch messages', 
      error: error.message 
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ 
      message: 'Failed to fetch message', 
      error: error.message 
    });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'read', 'responded'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: new, read, or responded' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({
      message: 'Contact status updated',
      contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ 
      message: 'Failed to update message status', 
      error: error.message 
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({
      message: 'Contact message deleted',
      contact,
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      message: 'Failed to delete message', 
      error: error.message 
    });
  }
};
