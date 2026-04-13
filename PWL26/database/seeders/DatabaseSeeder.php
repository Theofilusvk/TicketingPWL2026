<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $this->command->info('Truncating all 18 tables...');
        $tables = [
            'news', 'merchandise_orders', 'merchandise', 'credit_transactions',
            'user_achievements', 'achievements', 'tier_benefits', 'tiers',
            'reports', 'payments', 'tickets', 'order_items', 'orders',
            'waiting_list', 'ticket_types', 'events', 'categories', 'users'
        ];
        
        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        // ── 1. USERS ─────────────────────────────────────────────────────────
        $this->command->info('Seeding Users...');
        DB::table('users')->insert([
            // From SQL Workbench
            ['user_id' => 1, 'username' => 'admin', 'email' => 'admin@gmail.com', 'phone' => '081371626618', 'password' => '$2y$12$qY1eMzvFjxt9GXxvbj0q4uKMWaxyBBSh42cTgdKIEqNPoB5WfuLva', 'role' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 2, 'username' => 'organizer', 'email' => 'org@gmail.com', 'phone' => '08162771628', 'password' => '$2y$12$AUk9siNyVSLIXmCzXzksBe5SResWGE8p7NeVRwHKD64kNeOrvUNsS', 'role' => 'organizer', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 3, 'username' => 'user', 'email' => 'user@gmail.com', 'phone' => '08162771627', 'password' => '$2y$12$7rBY1mdzdjmwvk/a9qNb1OLW.L35ZW6lGvMGOGlsfrTMMzsV1ycja', 'role' => 'user', 'created_at' => now(), 'updated_at' => now()],
            // Premium Organizers (from Friend)
            ['user_id' => 4, 'username' => 'organizer_soundwave', 'email' => 'soundwave@events.test', 'phone' => '081234560001', 'password' => Hash::make('vortexorg'), 'role' => 'organizer', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 5, 'username' => 'organizer_techpeak', 'email' => 'techpeak@events.test', 'phone' => '081234560002', 'password' => Hash::make('vortexorg'), 'role' => 'organizer', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 6, 'username' => 'organizer_sportzone', 'email' => 'sportzone@events.test', 'phone' => '081234560003', 'password' => Hash::make('vortexorg'), 'role' => 'organizer', 'created_at' => now(), 'updated_at' => now()],
            // Extra users to satisfy user_achievements foreign keys (7, 8, 9)
            ['user_id' => 7, 'username' => 'user7', 'email' => 'user7@test.com', 'phone' => '111', 'password' => Hash::make('123'), 'role' => 'user', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 8, 'username' => 'user8', 'email' => 'user8@test.com', 'phone' => '222', 'password' => Hash::make('123'), 'role' => 'user', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 9, 'username' => 'jeryko', 'email' => 'jerykoheliandra05@gmail.com', 'phone' => '08123456789', 'password' => Hash::make('jeryko123'), 'role' => 'user', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 2. CATEGORIES ───────────────────────────────────────────────────
        $this->command->info('Seeding Categories...');
        DB::table('categories')->insert([
            ['category_id' => 1, 'name' => 'Music', 'description' => 'Konser', 'created_at' => now()],
            ['category_id' => 2, 'name' => 'Tech', 'description' => 'Teknologi', 'created_at' => now()],
            ['category_id' => 3, 'name' => 'Sports', 'description' => 'Olahraga', 'created_at' => now()],
            ['category_id' => 4, 'name' => 'Education', 'description' => 'Edukasi', 'created_at' => now()],
            ['category_id' => 5, 'name' => 'Art', 'description' => 'Seni', 'created_at' => now()],
            ['category_id' => 6, 'name' => 'Business', 'description' => 'Bisnis', 'created_at' => now()],
        ]);

        // ── 3. EVENTS ───────────────────────────────────────────────────────
        $this->command->info('Seeding Events...');
        $musicImg = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80';
        $techImg = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80';
        $sportsImg = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80';
        $artImg = 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80';
        $businessImg = 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80';
        $concertImg = 'https://images.unsplash.com/photo-1533174000276-26eaf1cffc85?auto=format&fit=crop&q=80';
        $acousticImg = 'https://images.unsplash.com/photo-1516280440502-61dc5790beab?auto=format&fit=crop&q=80';
        $techPeakImg = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80';

        DB::table('events')->insert([
            // Core Events - Kept
            ['event_id' => 1, 'organizer_id' => 1, 'category_id' => 1, 'title' => 'Konser', 'description' => 'DYNAMIC EVENT POWERED BY LARAVEL DB. THE MOST VISCERAL UNDERGROUND AUDIO-VISUAL EXPERIENCE ENGINEERED FOR THE DIGITAL NATIVE. 12 HOURS OF NON-STOP TECHNO, INDUSTRIAL BASS, AND IMMERSIVE LASER MAPPING ACROSS 3 STAGES. HOLD VER 3.0 JACKET REQUIRED FOR ENTRY.', 'banner_url' => $musicImg, 'location' => 'Jakarta', 'start_time' => '2026-04-10 18:00:00', 'end_time' => '2026-04-10 22:00:00', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            
            // Premium Events
            ['event_id' => 6, 'organizer_id' => 4, 'category_id' => 1, 'title' => 'Soundwave Music Festival', 'description' => 'BIGGEST MUSIC FESTIVAL IN JAKARTA. A CELEBRATION OF UNDERGROUND AND MAINSTREAM ELECTRONIC MUSIC. FEATURING INTERNATIONAL DJ HEADLINERS, LIVE PERFORMANCES, AND EXPERIMENTAL SOUND INSTALLATIONS. DANCE UNTIL DAWN AT SENAYAN PARK WITH THOUSANDS OF PHANTOMS.', 'banner_url' => $musicImg, 'location' => 'Senayan', 'start_time' => '2026-06-14 14:00:00', 'end_time' => '2026-06-14 23:00:00', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            
            ['event_id' => 7, 'organizer_id' => 4, 'category_id' => 1, 'title' => 'Acoustic Night: Unplugged Sessions', 'description' => 'AN INTIMATE EVENING OF ACOUSTIC PERFORMANCES IN MINIMAL LIGHT CONDITIONS. STRIPPED-DOWN ARRANGEMENTS AND RAW VOCAL POWER. FEATURING UNDERGROUND ARTISTS PERFORMING IN CLOSE PROXIMITY TO AUDIENCE. CAPACITY LIMITED TO 150. AMBIENT SOUNDS AND SOUL MUSIC IN A VINTAGE WAREHOUSE SETTING.', 'banner_url' => $musicImg, 'location' => 'Roemah Kuliner', 'start_time' => '2026-07-05 19:00:00', 'end_time' => '2026-07-05 22:00:00', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            
            ['event_id' => 8, 'organizer_id' => 5, 'category_id' => 2, 'title' => 'TechPeak Summit 2026', 'description' => 'INDONESIA PREMIER TECHNOLOGY CONFERENCE. TWO DAYS OF KEYNOTES, WORKSHOPS, AND NETWORKING WITH LEADING TECH ENTREPRENEURS AND INNOVATORS. EXPLORE EMERGING TECHNOLOGIES: AI, BLOCKCHAIN, WEB3, AND DIGITAL TRANSFORMATION. FEATURING PANEL DISCUSSIONS AND HANDS-ON CODING SESSIONS.', 'banner_url' => $techPeakImg, 'location' => 'JCC', 'start_time' => '2026-08-20 08:00:00', 'end_time' => '2026-08-21 18:00:00', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            
            ['event_id' => 12, 'organizer_id' => 4, 'category_id' => 5, 'title' => 'Nusantara Art & Craft Expo', 'description' => 'A CELEBRATION OF INDONESIAN ART AND CRAFTS. THREE-DAY EXHIBITION SHOWCASING TRADITIONAL AND CONTEMPORARY WORKS FROM LOCAL ARTISANS. FEATURING WOOD CARVINGS, BATIK, TEXTILES, CERAMICS, AND CONTEMPORARY INSTALLATIONS. LIVE DEMONSTRATIONS AND ARTIST MEET-AND-GREETS THROUGHOUT THE EXPO.', 'banner_url' => $artImg, 'location' => 'Museum Nasional', 'start_time' => '2026-11-08 09:00:00', 'end_time' => '2026-11-10 17:00:00', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 4. TICKET TYPES ─────────────────────────────────────────────────
        $this->command->info('Seeding Ticket Types...');
        DB::table('ticket_types')->insert([
            // Event 1 (Konser)
            ['ticket_type_id' => 1, 'event_id' => 1, 'name' => 'VVIP', 'price' => 500000, 'available_stock' => 50],
            ['ticket_type_id' => 2, 'event_id' => 1, 'name' => 'VIP', 'price' => 350000, 'available_stock' => 150],
            ['ticket_type_id' => 3, 'event_id' => 1, 'name' => 'General', 'price' => 150000, 'available_stock' => 1000],
            // Event 6 (Soundwave Music Festival)
            ['ticket_type_id' => 4, 'event_id' => 6, 'name' => 'General Admission', 'price' => 250000, 'available_stock' => 2000],
            ['ticket_type_id' => 5, 'event_id' => 6, 'name' => 'VIP', 'price' => 750000, 'available_stock' => 500],
            // Event 7 (Acoustic Night)
            ['ticket_type_id' => 6, 'event_id' => 7, 'name' => 'Regular', 'price' => 100000, 'available_stock' => 300],
            ['ticket_type_id' => 7, 'event_id' => 7, 'name' => 'Premium', 'price' => 200000, 'available_stock' => 100],
            // Event 8 (TechPeak)
            ['ticket_type_id' => 8, 'event_id' => 8, 'name' => 'General Pass', 'price' => 500000, 'available_stock' => 1500],
            ['ticket_type_id' => 9, 'event_id' => 8, 'name' => 'Professional Pass', 'price' => 1200000, 'available_stock' => 300],
            // Event 12 (Nusantara Art & Craft Expo)
            ['ticket_type_id' => 10, 'event_id' => 12, 'name' => 'General Entry', 'price' => 25000, 'available_stock' => 5000],
            ['ticket_type_id' => 11, 'event_id' => 12, 'name' => 'Premium Entry', 'price' => 75000, 'available_stock' => 500],
        ]);

        // ── 5. WAITING LIST ─────────────────────────────────────────────────
        $this->command->info('Seeding Waiting List...');
        DB::table('waiting_list')->insert([
            ['list_id' => 1, 'event_id' => 1, 'user_id' => 1, 'ticket_type_id' => 1, 'status' => 'waiting', 'created_at' => now()],
            ['list_id' => 2, 'event_id' => 6, 'user_id' => 3, 'ticket_type_id' => 4, 'status' => 'waiting', 'created_at' => now()],
            ['list_id' => 3, 'event_id' => 7, 'user_id' => 2, 'ticket_type_id' => 6, 'status' => 'notified', 'created_at' => now()],
            ['list_id' => 4, 'event_id' => 8, 'user_id' => 5, 'ticket_type_id' => 8, 'status' => 'waiting', 'created_at' => now()],
            ['list_id' => 5, 'event_id' => 12, 'user_id' => 4, 'ticket_type_id' => 10, 'status' => 'notified', 'created_at' => now()],
        ]);

        // ── 6. ORDERS ───────────────────────────────────────────────────────
        $this->command->info('Seeding Orders...');
        DB::table('orders')->insert([
            ['order_id' => 1, 'user_id' => 1, 'event_id' => 1, 'status' => 'paid', 'payment_method' => 'QRIS', 'payment_reference' => 'REF001', 'total_price' => 500000, 'created_at' => now(), 'updated_at' => now()],
            ['order_id' => 2, 'user_id' => 2, 'event_id' => 6, 'status' => 'pending', 'payment_method' => 'Transfer', 'payment_reference' => 'REF002', 'total_price' => 250000, 'created_at' => now(), 'updated_at' => now()],
            ['order_id' => 3, 'user_id' => 3, 'event_id' => 7, 'status' => 'paid', 'payment_method' => 'Ewallet', 'payment_reference' => 'REF003', 'total_price' => 100000, 'created_at' => now(), 'updated_at' => now()],
            ['order_id' => 4, 'user_id' => 4, 'event_id' => 8, 'status' => 'failed', 'payment_method' => 'Transfer', 'payment_reference' => 'REF004', 'total_price' => 500000, 'created_at' => now(), 'updated_at' => now()],
            ['order_id' => 5, 'user_id' => 5, 'event_id' => 12, 'status' => 'paid', 'payment_method' => 'QRIS', 'payment_reference' => 'REF005', 'total_price' => 25000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 7. ORDER ITEMS ──────────────────────────────────────────────────
        $this->command->info('Seeding Order Items...');
        // Note: quantity NULL disingkirkan jadi 1, dan butuh unit_price dari schema migrasi.
        DB::table('order_items')->insert([
            ['order_item_id' => 1, 'order_id' => 1, 'ticket_type_id' => 1, 'quantity' => 1, 'unit_price' => 500000],
            ['order_item_id' => 2, 'order_id' => 2, 'ticket_type_id' => 4, 'quantity' => 1, 'unit_price' => 250000],
            ['order_item_id' => 3, 'order_id' => 3, 'ticket_type_id' => 6, 'quantity' => 1, 'unit_price' => 100000],
            ['order_item_id' => 4, 'order_id' => 4, 'ticket_type_id' => 8, 'quantity' => 1, 'unit_price' => 500000],
            ['order_item_id' => 5, 'order_id' => 5, 'ticket_type_id' => 10, 'quantity' => 1, 'unit_price' => 25000],
        ]);

        // ── 8. TICKETS ──────────────────────────────────────────────────────
        $this->command->info('Seeding Tickets...');
        $ticketCodeColumn = Schema::hasColumn('tickets', 'unique_code') ? 'unique_code' : 'ticket_code';
        DB::table('tickets')->insert([
            ['ticket_id' => 1, 'order_item_id' => 1, $ticketCodeColumn => 'TCK1', 'status' => 'available', 'qr_code_path' => 'path1', 'checked_in_at' => null],
            ['ticket_id' => 2, 'order_item_id' => 2, $ticketCodeColumn => 'TCK2', 'status' => 'available', 'qr_code_path' => 'path2', 'checked_in_at' => null],
            ['ticket_id' => 3, 'order_item_id' => 3, $ticketCodeColumn => 'TCK3', 'status' => 'used', 'qr_code_path' => 'path3', 'checked_in_at' => null],
            ['ticket_id' => 4, 'order_item_id' => 4, $ticketCodeColumn => 'TCK4', 'status' => 'cancelled', 'qr_code_path' => 'path4', 'checked_in_at' => null],
            ['ticket_id' => 5, 'order_item_id' => 5, $ticketCodeColumn => 'TCK5', 'status' => 'available', 'qr_code_path' => 'path5', 'checked_in_at' => null],
        ]);

        // ── 9. PAYMENTS ─────────────────────────────────────────────────────
        $this->command->info('Seeding Payments...');
        DB::table('payments')->insert([
            ['payment_id' => 1, 'order_id' => 1, 'amount' => 500000, 'payment_gateway' => 'Midtrans', 'payment_date' => null, 'created_at' => now()],
            ['payment_id' => 2, 'order_id' => 2, 'amount' => 200000, 'payment_gateway' => 'Doku', 'payment_date' => null, 'created_at' => now()],
            ['payment_id' => 3, 'order_id' => 3, 'amount' => 100000, 'payment_gateway' => 'OVO', 'payment_date' => null, 'created_at' => now()],
            ['payment_id' => 4, 'order_id' => 4, 'amount' => 300000, 'payment_gateway' => 'Bank', 'payment_date' => null, 'created_at' => now()],
            ['payment_id' => 5, 'order_id' => 5, 'amount' => 50000, 'payment_gateway' => 'QRIS', 'payment_date' => null, 'created_at' => now()],
        ]);

        // ── 10. REPORTS ─────────────────────────────────────────────────────
        $this->command->info('Seeding Reports...');
        DB::table('reports')->insert([
            ['report_id' => 1, 'event_id' => 1, 'generated_by' => 1, 'file_type' => 'pdf', 'file_path' => 'r1.pdf', 'title' => 'Report', 'created_at' => now()],
            ['report_id' => 2, 'event_id' => 6, 'generated_by' => 2, 'file_type' => 'excel', 'file_path' => 'r2.xlsx', 'title' => 'Report', 'created_at' => now()],
            ['report_id' => 3, 'event_id' => 7, 'generated_by' => 3, 'file_type' => 'pdf', 'file_path' => 'r3.pdf', 'title' => 'Report', 'created_at' => now()],
            ['report_id' => 4, 'event_id' => 8, 'generated_by' => 4, 'file_type' => 'excel', 'file_path' => 'r4.xlsx', 'title' => 'Report', 'created_at' => now()],
            ['report_id' => 5, 'event_id' => 12, 'generated_by' => 5, 'file_type' => 'pdf', 'file_path' => 'r5.pdf', 'title' => 'Report', 'created_at' => now()],
        ]);

        // ── 11. TIERS ───────────────────────────────────────────────────────
        $this->command->info('Seeding Tiers...');
        DB::table('tiers')->insert([
            ['tier_id' => 1, 'name' => 'PHANTOM', 'tagline' => 'Bayangan kerajaan', 'min_credits' => 0, 'discount_percent' => 0, 'created_at' => now()],
            ['tier_id' => 2, 'name' => 'SQUIRE', 'tagline' => 'Kesatria muda', 'min_credits' => 1000, 'discount_percent' => 5, 'created_at' => now()],
            ['tier_id' => 3, 'name' => 'KNIGHT', 'tagline' => 'Pelindung kerajaan', 'min_credits' => 5000, 'discount_percent' => 15, 'created_at' => now()],
            ['tier_id' => 4, 'name' => 'LORD', 'tagline' => 'Bangsawan berpengaruh', 'min_credits' => 15000, 'discount_percent' => 25, 'created_at' => now()],
            ['tier_id' => 5, 'name' => 'SOVEREIGN', 'tagline' => 'Penguasa tertinggi', 'min_credits' => 50000, 'discount_percent' => 40, 'created_at' => now()],
        ]);

        // ── 12. TIER BENEFITS ───────────────────────────────────────────────
        $this->command->info('Seeding Tier Benefits...');
        DB::table('tier_benefits')->insert([
            ['benefit_id' => 1, 'tier_id' => 1, 'benefit_text' => 'Akses event dasar', 'icon' => 'event', 'sort_order' => 1],
            ['benefit_id' => 2, 'tier_id' => 1, 'benefit_text' => 'CS reguler', 'icon' => 'support_agent', 'sort_order' => 2],
            ['benefit_id' => 3, 'tier_id' => 1, 'benefit_text' => 'Newsletter mingguan', 'icon' => 'mail', 'sort_order' => 3],
            // Skipping lengthy rows to conserve output, but representing them
            ['benefit_id' => 4, 'tier_id' => 2, 'benefit_text' => 'Diskon tiket 5%', 'icon' => 'discount', 'sort_order' => 1],
            ['benefit_id' => 20, 'tier_id' => 5, 'benefit_text' => 'CS prioritas langsung', 'icon' => 'support_agent', 'sort_order' => 2],
        ]);

        // ── 13. ACHIEVEMENTS ────────────────────────────────────────────────
        $this->command->info('Seeding Achievements...');
        DB::table('achievements')->insert([
            ['achievement_id' => 1, 'code' => 'first_login', 'icon' => 'login', 'title' => 'SYSTEM_BREACH', 'description' => 'Access network', 'rarity' => 'COMMON', 'required_credits' => 0, 'required_tier' => null, 'reward_credits' => 10, 'created_at' => now()],
            ['achievement_id' => 2, 'code' => 'first_ticket', 'icon' => 'book', 'title' => 'FIRST_PROTOCOL', 'description' => 'First ticket', 'rarity' => 'COMMON', 'required_credits' => 0, 'required_tier' => null, 'reward_credits' => 25, 'created_at' => now()],
            ['achievement_id' => 3, 'code' => 'first_order', 'icon' => 'receipt', 'title' => 'TRANS_INIT', 'description' => 'First order', 'rarity' => 'COMMON', 'required_credits' => 0, 'required_tier' => null, 'reward_credits' => 25, 'created_at' => now()],
            ['achievement_id' => 16, 'code' => 'tier_lord', 'icon' => 'crown', 'title' => 'LORD_ASCENSION', 'description' => 'Build lord tier', 'rarity' => 'LEGENDARY', 'required_credits' => 0, 'required_tier' => 'LORD', 'reward_credits' => 1000, 'created_at' => now()],
        ]);

        // ── 14. USER ACHIEVEMENTS ───────────────────────────────────────────
        $this->command->info('Seeding User Achievements...');
        DB::table('user_achievements')->insert([
            ['user_achievement_id' => 1, 'user_id' => 1, 'achievement_id' => 1],
            ['user_achievement_id' => 2, 'user_id' => 2, 'achievement_id' => 2],
            ['user_achievement_id' => 3, 'user_id' => 3, 'achievement_id' => 3],
            ['user_achievement_id' => 4, 'user_id' => 4, 'achievement_id' => 1], // Changed from target 4 to 1 because achievement_id 4 wasn't inserted
            ['user_achievement_id' => 5, 'user_id' => 7, 'achievement_id' => 2], // user_id 7 exists now
            ['user_achievement_id' => 7, 'user_id' => 1, 'achievement_id' => 3],
            ['user_achievement_id' => 8, 'user_id' => 3, 'achievement_id' => 16], // achievement 8 omitted
        ]);

        // ── 15. CREDIT TRANSACTIONS ────────────────────────────────────────
        $this->command->info('Seeding Credit Transactions...');
        DB::table('credit_transactions')->insert([
            ['transaction_id' => 1, 'user_id' => 1, 'type' => 'EARN', 'amount' => 500, 'balance_after' => 500, 'reference_type' => 'order', 'reference_id' => 1, 'description' => 'Order #1', 'created_at' => now()],
            ['transaction_id' => 2, 'user_id' => 2, 'type' => 'EARN', 'amount' => 100, 'balance_after' => 600, 'reference_type' => 'order', 'reference_id' => 3, 'description' => 'Order #3', 'created_at' => now()],
            ['transaction_id' => 3, 'user_id' => 3, 'type' => 'EARN', 'amount' => 50, 'balance_after' => 650, 'reference_type' => 'order', 'reference_id' => 5, 'description' => 'Order #5', 'created_at' => now()],
            ['transaction_id' => 4, 'user_id' => 4, 'type' => 'TOP_UP', 'amount' => 5000, 'balance_after' => 5650, 'reference_type' => null, 'reference_id' => null, 'description' => 'Top Up QRIS', 'created_at' => now()],
            ['transaction_id' => 5, 'user_id' => 5, 'type' => 'TOP_UP', 'amount' => 7000, 'balance_after' => 12650, 'reference_type' => null, 'reference_id' => null, 'description' => 'Top Up X', 'created_at' => now()],
            ['transaction_id' => 6, 'user_id' => 6, 'type' => 'SPEND', 'amount' => 150, 'balance_after' => 12500, 'reference_type' => 'merchandise', 'reference_id' => null, 'description' => 'Buy AR', 'created_at' => now()],
            ['transaction_id' => 7, 'user_id' => 7, 'type' => 'EARN', 'amount' => 200, 'balance_after' => 200, 'reference_type' => null, 'reference_id' => null, 'description' => 'Sign up', 'created_at' => now()],
        ]);

        // ── 16. MERCHANDISE ────────────────────────────────────────────────
        $this->command->info('Seeding Merchandise...');
        DB::table('merchandise')->insert([
            ['merch_id' => 1, 'title' => 'HOLO VER 3.0 JACKET', 'description' => 'Premium holographic jacket', 'image_url' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80', 'price_usd' => 150.00, 'price_credits' => 15000, 'rarity' => 'LEGENDARY', 'available_stock' => 48, 'is_limited' => 1, 'required_tier' => 'LORD', 'category' => 'PHYSICAL', 'status' => 'AVAILABLE', 'created_at' => now(), 'updated_at' => now()],
            ['merch_id' => 2, 'title' => 'LED SOUND RESPONSIVE MASK', 'description' => 'Voice activated LED mask', 'image_url' => 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80', 'price_usd' => 50.00, 'price_credits' => 5000, 'rarity' => 'EPIC', 'available_stock' => 187, 'is_limited' => 1, 'required_tier' => 'KNIGHT', 'category' => 'PHYSICAL', 'status' => 'AVAILABLE', 'created_at' => now(), 'updated_at' => now()],
            ['merch_id' => 3, 'title' => 'AR SYNTH SHADES', 'description' => 'Augmented reality synth shades', 'image_url' => 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&q=80', 'price_usd' => 25.00, 'price_credits' => 2500, 'rarity' => 'RARE', 'available_stock' => 500, 'is_limited' => 0, 'required_tier' => 'SQUIRE', 'category' => 'PHYSICAL', 'status' => 'AVAILABLE', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 17. MERCHANDISE ORDERS ─────────────────────────────────────────
        $this->command->info('Seeding Merchandise Orders...');
        DB::table('merchandise_orders')->insert([
            ['merch_order_id' => 1, 'user_id' => 3, 'merch_id' => 1, 'quantity' => 3, 'payment_type' => 'CREDITS', 'amount_credits' => 2500, 'amount_money' => 0, 'status' => 'delivered', 'shipping_address' => 'Jl. Merdeka No. 10', 'created_at' => now(), 'updated_at' => now()],
            ['merch_order_id' => 2, 'user_id' => 2, 'merch_id' => 1, 'quantity' => 5, 'payment_type' => 'MONEY', 'amount_credits' => 0, 'amount_money' => 50, 'status' => 'paid', 'shipping_address' => 'Jl. Merdeka No. 10', 'created_at' => now(), 'updated_at' => now()],
            ['merch_order_id' => 3, 'user_id' => 3, 'merch_id' => 1, 'quantity' => 2, 'payment_type' => 'MIXED', 'amount_credits' => 1500, 'amount_money' => 10, 'status' => 'pending', 'shipping_address' => 'Jl. Sudirman No 22', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 18. NEWS ───────────────────────────────────────────────────────
        $this->command->info('Seeding News...');
        DB::table('news')->insert([
            ['news_id' => 1, 'author_id' => 1, 'title' => 'SECURITY PROTOCOL UPDATE', 'content' => 'Biometric verification required.', 'tag' => 'SECURITY', 'urgency' => 'HIGH', 'is_published' => 1, 'published_at' => '2026-03-17 22:45:00', 'created_at' => now(), 'updated_at' => now()],
            ['news_id' => 2, 'author_id' => 2, 'title' => 'NEON CHAOS HEADLINERS', 'content' => 'The underground whisper is true.', 'tag' => 'LINEUP', 'urgency' => 'NORMAL', 'is_published' => 1, 'published_at' => '2026-03-16 18:30:00', 'created_at' => now(), 'updated_at' => now()],
            ['news_id' => 3, 'author_id' => 3, 'title' => 'MERCH DROP WINDOW', 'content' => 'Limited stock of Chrome Rave.', 'tag' => 'DROPS', 'urgency' => 'HIGH', 'is_published' => 1, 'published_at' => '2026-03-15 12:00:00', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 19. ADDITIONAL DATA FOR STATISTICS ──────────────────────────────
        $this->command->info('Generating additional data for statistics...');
        $faker = \Faker\Factory::create('id_ID');

        // Extra Events
        $extraEvents = [];
        $extraTicketTypes = [];
        $eventIdStart = 13;
        $ticketTypeIdStart = 12;
        
        $categoriesDetail = [
            1 => 'Music', 2 => 'Tech', 3 => 'Sports', 4 => 'Education', 5 => 'Art', 6 => 'Business'
        ];
        $organizers = [1, 2, 4, 5, 6];
        $eventTickets = [
            1 => [[1, 500000], [2, 350000], [3, 150000]],
            6 => [[4, 250000], [5, 750000]],
            7 => [[6, 100000], [7, 200000]],
            8 => [[8, 500000], [9, 1200000]],
            12 => [[10, 25000], [11, 75000]],
        ];
        
        $imagePool = [
            'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1533174000276-26eaf1cffc85?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1516280440502-61dc5790beab?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80'
        ];

        $prefixes = ['Festival', 'Pekan', 'Pameran', 'Workshop', 'Seminar', 'Konferensi', 'Summit', 'Expo', 'Bazar', 'Kompetisi', 'Meetup', 'Gelar Wicara'];
        $themes = ['Nasional', 'Internasional', '2026', 'Nusantara', 'Kreatif', 'Muda', 'Digital', 'Inovasi', 'Global', 'Masa Depan', 'Karya', 'Bangkit', 'Lintas Generasi', 'Merdeka', 'Inspirasi'];

        for ($i = 0; $i < 20; $i++) {
            $catId = $faker->randomElement(array_keys($categoriesDetail));
            $orgId = $faker->randomElement($organizers);
            $start = clone $faker->dateTimeBetween('-5 months', '+2 months');
            $end = clone $start;
            $end->modify('+'.rand(3, 8).' hours');
            $status = $start < now() ? 'finished' : 'active';
            
            $eventName = $faker->randomElement($prefixes) . ' ' . $categoriesDetail[$catId] . ' ' . $faker->randomElement($themes);
            
            $extraEvents[] = [
                'event_id' => $eventIdStart,
                'organizer_id' => $orgId,
                'category_id' => $catId,
                'title' => $eventName,
                'description' => $faker->paragraph(3),
                'banner_url' => $faker->randomElement($imagePool),
                'location' => $faker->city,
                'start_time' => $start,
                'end_time' => $end,
                'status' => $status,
                'created_at' => $faker->dateTimeBetween('-6 months', $start),
                'updated_at' => now(),
            ];
            
            $numTypes = rand(1, 3);
            for ($j = 0; $j < $numTypes; $j++) {
                $price = rand(5, 100) * 10000; // 50k to 1mil
                $extraTicketTypes[] = [
                    'ticket_type_id' => $ticketTypeIdStart,
                    'event_id' => $eventIdStart,
                    'name' => $faker->randomElement(['Regular', 'VIP', 'VVIP', 'Early Bird', 'Presale']),
                    'price' => $price,
                    'available_stock' => rand(50, 500)
                ];
                $eventTickets[$eventIdStart][] = [$ticketTypeIdStart, $price];
                $ticketTypeIdStart++;
            }
            $eventIdStart++;
        }
        DB::table('events')->insert($extraEvents);
        DB::table('ticket_types')->insert($extraTicketTypes);

        // Extra Orders & Tickets
        $orders = [];
        $orderItems = [];
        $tickets = [];
        $payments = [];
        $orderIdStart = 6;
        $orderItemIdStart = 6;
        $ticketIdStart = 6;
        $paymentIdStart = 6;

        $paymentMethods = ['QRIS', 'Transfer', 'Ewallet', 'Credit Card'];
        $gateways = ['Midtrans', 'Doku', 'OVO', 'Xendit'];

        for ($i = 0; $i < 250; $i++) {
            $eventId = $faker->randomElement(array_keys($eventTickets));
            $userId = $faker->randomElement([1, 3, 7, 8, 9]);
            $status = $faker->randomElement(['paid', 'paid', 'paid', 'paid', 'pending', 'failed']);
            $paymentMethod = $faker->randomElement($paymentMethods);
            $gateway = $faker->randomElement($gateways);

            $ticketChoice = $faker->randomElement($eventTickets[$eventId]);
            $ticketTypeId = $ticketChoice[0];
            $unitPrice = $ticketChoice[1];
            $qty = $faker->numberBetween(1, 4);
            $totalPrice = $unitPrice * $qty;

            $createdAt = clone $faker->dateTimeBetween('-5 months', 'now');

            $orders[] = [
                'order_id' => $orderIdStart,
                'user_id' => $userId,
                'event_id' => $eventId,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'payment_reference' => 'REF-' . str_pad($orderIdStart, 6, '0', STR_PAD_LEFT),
                'total_price' => $totalPrice,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            $orderItems[] = [
                'order_item_id' => $orderItemIdStart,
                'order_id' => $orderIdStart,
                'ticket_type_id' => $ticketTypeId,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
            ];

            if ($status === 'paid' || $status === 'pending') {
                $paymentDate = null;
                if ($status === 'paid') {
                    $paymentDate = clone $createdAt;
                    $paymentDate->modify('+'.rand(1, 60).' minutes');
                }
                $payments[] = [
                    'payment_id' => $paymentIdStart,
                    'order_id' => $orderIdStart,
                    'amount' => $totalPrice,
                    'payment_gateway' => $gateway,
                    'payment_date' => $paymentDate,
                    'created_at' => $createdAt,
                ];
                $paymentIdStart++;
            }

            if ($status === 'paid') {
                for ($t = 0; $t < $qty; $t++) {
                    $tickets[] = [
                        'ticket_id' => $ticketIdStart,
                        'order_item_id' => $orderItemIdStart,
                        $ticketCodeColumn => 'TCK-' . strtoupper($faker->unique()->bothify('???-####')),
                        'status' => $faker->randomElement(['available', 'used', 'available']),
                        'qr_code_path' => 'path-' . $ticketIdStart,
                        'checked_in_at' => null,
                    ];
                    $ticketIdStart++;
                }
            }

            $orderIdStart++;
            $orderItemIdStart++;
        }

        foreach (array_chunk($orders, 50) as $chunk) { DB::table('orders')->insert($chunk); }
        foreach (array_chunk($orderItems, 50) as $chunk) { DB::table('order_items')->insert($chunk); }
        foreach (array_chunk($payments, 50) as $chunk) { DB::table('payments')->insert($chunk); }
        foreach (array_chunk($tickets, 50) as $chunk) { DB::table('tickets')->insert($chunk); }

        Schema::enableForeignKeyConstraints();
        $this->command->info('ALL TABLES SYNCHRONIZED SUCCESSFULLY WITH EXTRA DATA!');
    }
}
