import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use real email service (e.g. Gmail)
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Fallback to Ethereal Email (Fake SMTP for testing)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    const mailOptions = {
      from: `"AuraMart Admin" <${process.env.EMAIL_USER || 'admin@auramart.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    
    // If using ethereal, log the preview URL
    if (!process.env.EMAIL_USER) {
      console.log("Preview test email URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default sendEmail;
