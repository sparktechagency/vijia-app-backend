import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#1C1C1E; color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1C1E; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#2A2A2C; border-radius:8px; padding:40px; text-align:center;">
          
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:20px;">
              <img src="https://res.cloudinary.com/dkbcx9amc/image/upload/v1764853157/Group_2_hclirw.png" alt="Viajia Logo" width="120" style="display:block; margin:0 auto 10px auto;">
            </td>
          </tr>

          
          <!-- Greeting -->
          <tr>
            <td style="padding:20px 0;">
              <p style="font-size:18px; margin:0;">Hello ${values.name},</p>
              <p style="font-size:16px; color:#cccccc; margin:5px 0 0 0;">
                Use the following OTP to verify your account:
              </p>
            </td>
          </tr>
          
          <!-- OTP -->
          <tr>
            <td style="padding:20px 0;">
              <div style="display:inline-block; background-color:#00BCD1; color:#1C1C1E; font-size:24px; font-weight:bold; padding:15px 30px; border-radius:6px; letter-spacing:4px;">
                ${values.otp}
              </div>
            </td>
          </tr>
          
          <!-- Additional Info -->
          <tr>
            <td style="padding:20px 0;">
              <p style="font-size:14px; color:#aaaaaa; margin:0;">
                This OTP is valid for 10 minutes. Please do not share it with anyone.  
                If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Friendly Closing -->
          <tr>
            <td style="padding:20px 0;">
              <p style="font-size:16px; color:#cccccc; margin:0;">
                Thank you for choosing Viajia! We are excited to help you plan smarter.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top:30px; border-top:1px solid #444444;">
              <p style="font-size:12px; color:#777777; margin:0;">
                &copy; 2025 Viajia. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#1C1C1E; color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1C1E; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#2A2A2C; border-radius:8px; padding:40px; text-align:center;">
          
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:20px;">
              <img src="https://res.cloudinary.com/dkbcx9amc/image/upload/v1764853157/Group_2_hclirw.png" alt="Viajia Logo" width="120" style="display:block; margin:0 auto 10px auto;">
            </td>
          </tr>

          <!-- App Name and Intro Text -->
          
          <!-- Greeting -->
          <tr>
            <td style="padding:20px 0;">
              <p style="font-size:18px; margin:0;">Hello,</p>
              <p style="font-size:16px; color:#cccccc; margin:5px 0 0 0;">
                We received a request to reset your password. Use the OTP below to proceed:
              </p>
            </td>
          </tr>
          
          <!-- OTP -->
          <tr>
            <td style="padding:20px 0;">
              <div style="display:inline-block; background-color:#00BCD1; color:#1C1C1E; font-size:24px; font-weight:bold; padding:15px 30px; border-radius:6px; letter-spacing:4px;">
                ${values.otp}
              </div>
            </td>
          </tr>
          
          <!-- Additional Info -->
          <tr>
            <td style="padding:20px 0;">
              <p style="font-size:14px; color:#aaaaaa; margin:0;">
                This OTP is valid for 10 minutes. Please do not share it with anyone.  
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Friendly Closing -->
          <tr>
            <td style="padding:20px 0;">
              <p style="font-size:16px; color:#cccccc; margin:0;">
                Thank you for using Viajia! Stay organized and plan smarter.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top:30px; border-top:1px solid #444444;">
              <p style="font-size:12px; color:#777777; margin:0;">
                &copy; 2025 Viajia. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
