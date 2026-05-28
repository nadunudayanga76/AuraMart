import Inquiry from '../models/Inquiry.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to an inquiry
// @route   POST /api/inquiries/:id/reply
// @access  Private/Admin
export const replyToInquiry = async (req, res) => {
  const { replyMessage } = req.body;

  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
        <h2 style="color: #4C51BF;">AuraMart Customer Support</h2>
        <p>Dear ${inquiry.name},</p>
        <p>Thank you for inquiring about <strong>${inquiry.productName}</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3 style="color: #333;">Admin Reply:</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #555; white-space: pre-wrap;">
          ${replyMessage}
        </div>
        <br/>
        <p style="font-size: 12px; color: #888;">This is an automated response from AuraMart Support.</p>
      </div>
    `;

    const success = await sendEmail({
      email: inquiry.email,
      subject: `RE: Inquiry about ${inquiry.productName}`,
      html: emailHtml,
    });

    if (success) {
      inquiry.isReplied = true;
      inquiry.replyMessage = replyMessage;
      inquiry.repliedAt = Date.now();
      await inquiry.save();

      res.status(200).json(inquiry);
    } else {
      res.status(500).json({ message: 'Failed to send email reply' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (inquiry) {
      await inquiry.deleteOne();
      res.json({ message: 'Inquiry removed successfully' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
