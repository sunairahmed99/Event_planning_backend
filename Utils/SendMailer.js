import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config({quiet:true})

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Gmailuser,
    pass: process.env.Gmailpassword
  }
});

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"My App" <${process.env.Gmailuser}>`,
      to,
      subject,
      text,
      html
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};
