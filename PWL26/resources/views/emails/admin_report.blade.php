<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vortex Report Delivery</title>
</head>
<body style="background-color: #f4f4f5; color: #333; font-family: Arial, Helvetica, sans-serif; padding: 20px; margin: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="24" style="border: 1px solid #e5e7eb; background-color: #ffffff; margin: 0 auto; text-align: left; border-radius: 8px;">
                    <tr>
                        <td style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; text-align: center;">
                            <h1 style="color: #4f46e5; font-size: 22px; letter-spacing: 1px; margin: 0;">VORTEX</h1>
                            <div style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Report Delivery</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 20px; padding-bottom: 24px; color: #374151; font-size: 14px; line-height: 1.7;">
                            <p style="margin-top: 0;">Hi Admin,</p>
                            <p>Your requested report has been generated and is attached to this email.</p>

                            <div style="background-color: #f0f0ff; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #374151; border-radius: 0 6px 6px 0;">
                                <strong>Report Type:</strong> {{ ucwords(str_replace('-', ' ', $reportType)) }}<br>
                                <strong>Format:</strong> PDF Attachment<br>
                                <strong>Generated at:</strong> {{ now()->format('d M Y, H:i') }}
                            </div>

                            <p style="color: #6b7280; font-size: 13px;">Please open the attached PDF file for the full report data.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af; text-align: center;">
                            Vortex Ticketing System &mdash; Automated Report Delivery
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
