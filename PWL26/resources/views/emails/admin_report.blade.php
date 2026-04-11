<!DOCTYPE html>
<html>
<head>
    <title>Vortex Setup Admin Report</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Admin Report: {{ ucwords(str_replace('-', ' ', $reportType)) }}</h2>
    <p>Attached is the generated report data in CSV format from the Vortex Admin Dashboard.</p>
    <p>Please review the attachment for full dataset specifics.</p>
    <p>Generated at: {{ now()->format('Y-m-d H:i:s') }}</p>
    <br>
    <p>Best Regards,</p>
    <p>Vortex System Automated Delivery</p>
</body>
</html>
