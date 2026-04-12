<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vortex OTP Verification</title>
</head>
<body style="background-color: #f4f4f5; color: #333; font-family: Arial, Helvetica, sans-serif; padding: 20px; margin: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="24" style="border: 1px solid #e5e7eb; background-color: #ffffff; margin: 0 auto; text-align: left; border-radius: 8px;">
                    <tr>
                        <td style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; text-align: center;">
                            <h1 style="color: #4f46e5; font-size: 22px; letter-spacing: 1px; margin: 0;">VORTEX</h1>
                            <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Email Verification</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 20px; padding-bottom: 24px; color: #374151; font-size: 14px; line-height: 1.7;">
                            <p style="margin-top: 0;">Hi,</p>
                            <p>To complete your registration on Vortex, please use the following verification code:</p>

                            <div style="text-align: center; margin: 28px 0;">
                                <div style="display: inline-block; background-color: #f0f0ff; border: 2px solid #4f46e5; padding: 16px 36px; letter-spacing: 10px; font-size: 28px; color: #4f46e5; font-weight: bold; font-family: 'Courier New', Courier, monospace; border-radius: 8px;">{{ $otp }}</div>
                            </div>

                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #92400e; border-radius: 0 6px 6px 0;">
                                This code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.
                            </div>

                            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Do not share this code with anyone. Vortex will never ask for your OTP.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
                            Vortex Ticketing System
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
