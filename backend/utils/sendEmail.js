import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    if (process.env.BREVO_API_KEY) {
      // Use Brevo API for Render (bypasses SMTP blocking)
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'AuraMart Admin',
            email: process.env.EMAIL_USER || 'admin@auramart.com'
          },
          to: [
            { email: options.email }
          ],
          subject: options.subject,
          htmlContent: options.html
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Brevo API Error:", errorData);
        return false;
      }
      console.log("Email sent successfully via Brevo API");
      return true;
    } else {
      // Fallback to Ethereal Email (Fake SMTP for testing)
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      const mailOptions = {
        from: `"AuraMart Admin" <${process.env.EMAIL_USER || 'admin@auramart.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments || [],
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      console.log("Preview test email URL: %s", nodemailer.getTestMessageUrl(info));
      
      return true;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default sendEmail;
