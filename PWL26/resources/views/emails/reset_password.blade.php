<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VORTEX SECURITY PROTOCOL</title>
    <style>
        body {
            background-color: #050505;
            color: #d4d4d4;
            font-family: 'Courier New', Courier, monospace;
            padding: 30px;
            margin: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #cbff00;
            padding: 20px;
            background-color: #0a0a0a;
            position: relative;
        }
        .header {
            border-bottom: 1px dashed #cbff00;
            padding-bottom: 15px;
            margin-bottom: 25px;
            text-align: center;
        }
        .title {
            color: #cbff00;
            font-size: 24px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
        }
        .subtitle {
            color: #666;
            font-size: 12px;
            letter-spacing: 4px;
            margin-top: 5px;
        }
        .content {
            margin-bottom: 30px;
        }
        .alert {
            background-color: #111111;
            border-left: 4px solid #cbff00;
            padding: 10px 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #d4d4d4;
        }
        .button-wrapper {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            display: inline-block;
            background-color: #cbff00;
            color: #050505;
            text-decoration: none;
            padding: 12px 30px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
            border: none;
        }
        .text-neon {
            color: #cbff00;
        }
    </style>
</head>
<body style="background-color: #050505; color: #d4d4d4; font-family: 'Courier New', Courier, monospace; padding: 20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="20" style="border: 1px solid #cbff00; background-color: #0a0a0a; margin: 0 auto; text-align: left;">
                    <tr>
                        <td style="border-bottom: 1px dashed #cbff00; padding-bottom: 15px; text-align: center;">
                            <h1 style="color: #cbff00; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin: 0; font-family: 'Courier New', Courier, monospace;">VORTEX NODE</h1>
                            <div style="color: #888888; font-size: 12px; letter-spacing: 4px; margin-top: 5px; font-family: 'Courier New', Courier, monospace;">SECURITY INTERVENTION TRIGGERED</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 25px; padding-bottom: 30px; color: #d4d4d4; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.6;">
                            <p style="color: #d4d4d4; margin-top: 0;">USER IDENTIFIER RECOGNIZED.</p>
                            <p style="color: #d4d4d4;">We received an automated request to reset the <span style="color: #cbff00; font-weight: bold;">SECURITY KEY</span> associated with your credentials on the Vortex network.</p>
                            
                            <div style="background-color: #1a1a1a; border-left: 4px solid #cbff00; padding: 10px 15px; margin: 20px 0; font-size: 14px; color: #d4d4d4;">
                                <strong style="color: #cbff00;">WARNING:</strong> If you did not initiate this system override, ignore this transmission. Your current security key remains active.
                            </div>

                            <p style="color: #d4d4d4;">To establish a new security key and regain access to the network, initialize the override protocol below:</p>

                            <div style="text-align: center; margin: 35px 0;">
                                <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #cbff00; color: #050505; text-decoration: none; padding: 12px 30px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; font-family: 'Courier New', Courier, monospace;">INITIALIZE OVERRIDE</a>
                            </div>

                            <p style="font-size: 12px; color: #888888; overflow-wrap: break-word; text-align: center;">
                                Or manually access the node via:<br>
                                <a href="{{ $resetUrl }}" style="color: #888888; text-decoration: underline;">{{ $resetUrl }}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px dashed #444444; padding-top: 15px; font-size: 11px; color: #666666; text-align: center; font-family: 'Courier New', Courier, monospace;">
                            TRANSMISSION SECURED VIA VORTEX PROTOCOL<br>
                            NODE_77-X // LATENCY: 12MS // ENCRYPTION: ACTIVE
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
