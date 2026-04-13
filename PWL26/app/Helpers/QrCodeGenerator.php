<?php

namespace App\Helpers;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;

class QrCodeGenerator
{
    /**
     * 
     * 
     * @param string 
     * @param string 
     * @return string 
     */
    
    public static function generateForTicket(string $uniqueCode, string $prefix = 'ticket'): string
    {
        $svgContent = QrCode::format('svg')
                        ->size(200)
                        ->margin(1)
                        ->generate($uniqueCode);
                        
        $filename = 'qrcodes/' . $prefix . '_' . substr(md5($uniqueCode), 0, 10) . '.svg';
        
        // Store in storage/app/public/qrcodes/
        Storage::disk('public')->put($filename, $svgContent);
        
        return $filename; // this path is relative to storage/app/public
    }
}
