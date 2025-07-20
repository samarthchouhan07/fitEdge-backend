import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
    <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #10b981; margin-bottom: 10px;">Welcome to FitEdge 💪</h2>
      <p style="font-size: 16px; color: #333;">We received a request to log in to your account. Use the OTP below to proceed:</p>
      
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 15px; background-color: #e0f2f1; text-align: center; border-radius: 6px; color: #065f46;">
        ${otp}
      </div>

      <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>5 minutes</strong>. If you didn't request this, you can safely ignore it.</p>
      
      <hr style="margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} FitEdge. All rights reserved.
      </p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `FitEdge ${process.env.MAIL_USER}`,
    to: email,
    subject: "Your OTP for FitZone Login",
    html: htmlContent
  });
};
