<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vortex Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; background: #fff; padding: 30px; }
        .header { border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { color: #4f46e5; font-size: 18px; letter-spacing: 1px; margin-bottom: 4px; }
        .header .meta { color: #888; font-size: 9px; letter-spacing: 0.5px; }
        table.summary { margin-bottom: 20px; width: auto; border-collapse: collapse; }
        table.summary td { padding: 10px 20px; border: 1px solid #e5e7eb; background: #f9fafb; }
        table.summary .label { color: #6b7280; font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
        table.summary .value { color: #4f46e5; font-size: 14px; font-weight: bold; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table.data thead th { background: #4f46e5; color: #fff; text-align: left; padding: 8px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
        table.data tbody td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 10px; }
        table.data tbody tr:nth-child(even) { background: #f9fafb; }
        .footer { border-top: 1px solid #e5e7eb; margin-top: 25px; padding-top: 10px; text-align: center; color: #9ca3af; font-size: 9px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>VORTEX — {{ strtoupper($reportType) }} REPORT</h1>
        <div class="meta">
            Generated: {{ $generatedAt }} &nbsp;|&nbsp; Records: {{ count($rows) }}
            @if(!empty($dateRange))
                &nbsp;|&nbsp; Period: {{ $dateRange }}
            @endif
        </div>
    </div>

    @if(!empty($summaryStats))
    <table class="summary">
        <tr>
            @foreach($summaryStats as $stat)
            <td>
                <div class="label">{{ $stat['label'] }}</div>
                <div class="value">{{ $stat['value'] }}</div>
            </td>
            @endforeach
        </tr>
    </table>
    @endif

    <table class="data">
        <thead>
            <tr>
                @foreach($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{{ $cell }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Vortex Ticketing System &mdash; Auto-generated Report
    </div>
</body>
</html>
