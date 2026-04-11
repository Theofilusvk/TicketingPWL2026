<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminReportMail;

class AdminReportController extends Controller
{
    public function sendEmailReport(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'report_type' => 'required|string',
            'headers' => 'required|array',
            'rows' => 'required|array',
        ]);

        $email = $request->email;
        $reportType = $request->report_type;
        $headers = $request->input('headers');
        $rows = $request->rows;

        // Generate CSV content in memory
        $output = fopen('php://temp', 'r+');
        
        // Add UTF-8 BOM for Excel compatibility
        fputs($output, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF)));

        // Put Headers
        fputcsv($output, $headers);

        // Put Rows
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }

        // Read content
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        try {
            Mail::to($email)->send(new AdminReportMail($reportType, $csvContent));
            return response()->json([
                'status' => 'success',
                'message' => 'Report successfully sent to ' . $email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }
}
