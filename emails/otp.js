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



const ciIcon = `CI Client`