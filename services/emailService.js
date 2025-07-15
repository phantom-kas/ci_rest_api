// services/emailService.js
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  
});


export async function sendEmail(to,emailTemlate) {
  const html = emailTemlate;

  console.log(emailTemlate);
  console.log({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  });


  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email',
    html,
  });
}

