<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminReportMail;
use Barryvdh\DomPDF\Facade\Pdf;

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

        // Calculate summary stats based on report type
        $summaryStats = [];
        if ($reportType === 'transaction') {
            $totalRevenue = 0;
            $completedCount = 0;
            foreach ($rows as $row) {
                // Status is the last column
                $status = end($row);
                if ($status === 'Completed') {
                    $completedCount++;
                    // Total is the 4th column (index 3)
                    $totalRevenue += floatval(str_replace(['$', ',', ' '], '', $row[3] ?? 0));
                }
            }
            $summaryStats = [
                ['label' => 'Total Transactions', 'value' => count($rows)],
                ['label' => 'Completed', 'value' => $completedCount],
                ['label' => 'Total Revenue', 'value' => '$ ' . number_format($totalRevenue)],
            ];
        } elseif ($reportType === 'event-profit') {
            $totalProfit = 0;
            foreach ($rows as $row) {
                $totalProfit += floatval(str_replace(['$', ',', ' '], '', $row[6] ?? 0));
            }
            $summaryStats = [
                ['label' => 'Total Events', 'value' => count($rows)],
                ['label' => 'Total Profit', 'value' => '$ ' . number_format($totalProfit)],
            ];
        }

        // Generate PDF using dompdf
        $pdf = Pdf::loadView('reports.pdf_report', [
            'reportType' => str_replace('-', ' ', $reportType),
            'headers' => $headers,
            'rows' => $rows,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
            'dateRange' => '',
            'summaryStats' => $summaryStats,
        ]);

        $pdf->setPaper('A4', 'landscape');
        $pdfContent = $pdf->output();

        try {
            Mail::to($email)->send(new AdminReportMail($reportType, $pdfContent));
            return response()->json([
                'status' => 'success',
                'message' => 'PDF Report successfully sent to ' . $email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }
}
