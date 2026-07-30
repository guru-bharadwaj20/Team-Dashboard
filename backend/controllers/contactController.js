import { asyncHandler } from '../middleware/asyncHandler.js';
import Contact from '../models/Contact.js';

export const submitContact = asyncHandler(async (req, res) => {
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
});

export const getAllContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json({
    total: contacts.length,
    contacts,
  });
});

export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    return res.status(404).json({ message: 'Contact message not found' });
  }
  res.json(contact);
});

export const updateContactStatus = asyncHandler(async (req, res) => {
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
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact message not found' });
  }

  res.json({
    message: 'Contact message deleted',
    contact,
  });
});
