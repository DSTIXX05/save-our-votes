//Google

// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// // Get the current file's directory and go up to the root
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const envPath = join(__dirname, '../../.env'); // Go up two levels to reach app/.env

// dotenv.config({ path: envPath });

// // Debug: Check if environment variables are loaded
// console.log('ENV Path:', envPath);
// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log(
//   'EMAIL_PASS:',
//   process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'
// );

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const testEmail = async () => {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: 'delightsomedunsiasolo24@gmail.com',
//       subject: 'Test Email from SaveOurVotes',
//       text: 'If you receive this, your email setup is working!',
//       html: '<h1>Email Setup Success!</h1><p>Your Gmail configuration is working correctly.</p>',
//     });

//     console.log('Test email sent:', info.messageId);
//   } catch (error) {
//     console.error('Email test failed:', error);
//   }
// };

// testEmail();

//SendGrid
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'delightsomedunsiasolo24@gmail.com',
  from: 'dstixx05@gmail.com', // Must be verified in SendGrid
  subject: 'Test from SendGrid',
  text: 'Hello from SendGrid!',
  html: '<h1>Hello from SendGrid!</h1>',
};

sgMail
  .send(msg)
  .then(() => console.log('Email sent via SendGrid'))
  .catch((error) =>
    console.error('SendGrid error:', error.response?.body || error)
  );
