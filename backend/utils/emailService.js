const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const templates = {
  welcome: (data) => ({
    subject: 'Welcome to Smart Task Manager!',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Smart Task Manager</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Your productivity journey starts now</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #f1f5f9;">Welcome, ${data.name}! 🎉</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Your account has been created successfully. Start organizing your tasks, track your progress, and boost your productivity.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600;">Go to Dashboard →</a>
        </div>
        <div style="padding: 20px 40px; border-top: 1px solid #1e293b; color: #475569; font-size: 12px; text-align: center;">
          <p>© 2025 Smart Task Manager. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
  resetPassword: (data) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #f1f5f9;">Hi, ${data.name}</h2>
          <p style="color: #94a3b8; line-height: 1.6;">You requested to reset your password. Click the button below to proceed. This link expires in 10 minutes.</p>
          <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600;">Reset Password →</a>
          <p style="color: #475569; margin-top: 20px; font-size: 13px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, template, data, html }) => {
  const templateContent = template && templates[template] ? templates[template](data) : null;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Smart Task Manager <noreply@smarttask.com>',
    to,
    subject: templateContent?.subject || subject,
    html: templateContent?.html || html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendEmail };
