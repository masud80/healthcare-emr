export const getPatientRegistrationEmailTemplate = (patientName: string, resetLink: string) => ({
  subject: 'Welcome to Patient Portal - Complete Your Registration',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Your Patient Portal</h2>
      <p>Dear ${patientName},</p>
      <p>Your healthcare provider has enabled access to your personal patient portal. To complete your registration and access your health information, please set up your password by clicking the link below:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #1a237e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Set Up Password
        </a>
      </p>
      <p>This link will expire in 24 hours for security purposes.</p>
      <p>If you did not request this access, please contact your healthcare provider.</p>
      <p>Best regards,<br>Your Healthcare Team</p>
    </div>
  `
}); 