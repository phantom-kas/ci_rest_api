// services/emailService.js
import nodemailer from 'nodemailer'
// import dotenv from 'dotenv';
// dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  
});


export async function sendEmail(to,emailTemlate,subject='Verify Your Email') {
  const html = emailTemlate;

  console.log(emailTemlate);
  console.log({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  });


  await transporter.sendMail({
    from: `"GClient" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

