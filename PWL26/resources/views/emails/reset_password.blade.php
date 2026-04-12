<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vortex Password Reset</title>
</head>
<body style="background-color: #f4f4f5; color: #333; font-family: Arial, Helvetica, sans-serif; padding: 20px; margin: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="24" style="border: 1px solid #e5e7eb; background-color: #ffffff; margin: 0 auto; text-align: left; border-radius: 8px;">
                    <tr>
                        <td style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; text-align: center;">
                            <h1 style="color: #4f46e5; font-size: 22px; letter-spacing: 1px; margin: 0;">VORTEX</h1>
                            <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Password Reset</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 20px; padding-bottom: 24px; color: #374151; font-size: 14px; line-height: 1.7;">
                            <p style="margin-top: 0;">Hi,</p>
                            <p>We received a request to reset the password associated with your Vortex account.</p>

                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #92400e; border-radius: 0 6px 6px 0;">
                                <strong>Important:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
                            </div>

                            <p>Click the button below to set a new password:</p>

                            <div style="text-align: center; margin: 28px 0;">
                                <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: bold; font-size: 14px; border-radius: 8px;">Reset Password</a>
                            </div>

                            <p style="font-size: 12px; color: #9ca3af; text-align: center; word-break: break-all;">
                                Or copy this link:<br>
                                <a href="{{ $resetUrl }}" style="color: #4f46e5;">{{ $resetUrl }}</a>
                            </p>
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
