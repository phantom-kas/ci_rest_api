export const verificationEmail = (code) => {
    return `
 <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Verification Code</h2>
      <p>Hello,</p>
      <p>Here is your verification code:</p>
      <div style="font-size: 24px; font-weight: bold; color: #333; padding: 10px 0;">${code}</div>
      <p>This code will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr>
      <p style="font-size: 12px; color: #999;">
    ${ciIcon}
      </p>
    </div>
`
}

export const resetPasswordEmailHTML = (resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #4CAF50;">Reset Your Password</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. If this was you, please click the button below to reset it:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" target="_blank"
         style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
         Reset Password
      </a>
    </div>
    
    <p>If you didn't request a password reset, you can ignore this email. This link will expire in 1 hour.</p>
    
    <p>Thanks,<br>CiClient</p>

    <hr style="margin-top: 30px;">
    <p style="font-size: 12px; color: #888;">If you're having trouble clicking the button, copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #888;">${resetLink}</p>
  </div>
`;


const ciIcon = `CI Client`