<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ── 1. Categories ────────────────────────────────────────────────────
        $categories = [
            ['name' => 'Music',       'description' => 'Live concerts, festivals, and music showcases.'],
            ['name' => 'Technology',  'description' => 'Tech conferences, hackathons, and product launches.'],
            ['name' => 'Sports',      'description' => 'Sporting events, tournaments, and marathons.'],
            ['name' => 'Business',    'description' => 'Networking events, seminars, and business expos.'],
            ['name' => 'Arts & Craft','description' => 'Exhibitions, workshops, and cultural festivals.'],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $createdCategories[$cat['name']] = Category::firstOrCreate(
                ['name' => $cat['name']],
                ['description' => $cat['description']]
            );
        }

        // ── 2. Organizer users ───────────────────────────────────────────────
        $organizers = [
            [
                'username' => 'organizer_soundwave',
                'email'    => 'soundwave@events.test',
                'phone'    => '081234560001',
                'password' => Hash::make('password123'),
                'role'     => 'organizer',
            ],
            [
                'username' => 'organizer_techpeak',
                'email'    => 'techpeak@events.test',
                'phone'    => '081234560002',
                'password' => Hash::make('password123'),
                'role'     => 'organizer',
            ],
            [
                'username' => 'organizer_sportzone',
                'email'    => 'sportzone@events.test',
                'phone'    => '081234560003',
                'password' => Hash::make('password123'),
                'role'     => 'organizer',
            ],
        ];

        $createdOrganizers = [];
        foreach ($organizers as $org) {
            $createdOrganizers[] = User::firstOrCreate(
                ['email' => $org['email']],
                $org
            );
        }

        // ── 3. Events with ticket types ──────────────────────────────────────
        $events = [
            // Music
            [
                'organizer'   => $createdOrganizers[0],
                'category'    => $createdCategories['Music'],
                'title'       => 'Soundwave Music Festival 2026',
                'description' => 'The biggest open-air music festival of the year featuring top indie, pop, and electronic artists. Three stages, 30+ performers, food bazaar, and art installations.',
                'banner_url'  => null,
                'location'    => 'Gelora Bung Karno, Jakarta',
                'start_time'  => '2026-06-14 14:00:00',
                'end_time'    => '2026-06-14 23:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'General Admission', 'price' => 250000,  'available_stock' => 2000],
                    ['name' => 'VIP',               'price' => 750000,  'available_stock' => 500],
                    ['name' => 'Backstage Pass',    'price' => 1500000, 'available_stock' => 50],
                ],
            ],
            [
                'organizer'   => $createdOrganizers[0],
                'category'    => $createdCategories['Music'],
                'title'       => 'Acoustic Night: Unplugged Sessions',
                'description' => 'An intimate evening of acoustic performances in a cozy venue. Featuring rising local singer-songwriters and a special guest headliner.',
                'banner_url'  => null,
                'location'    => 'Roemah Kuliner, Bandung',
                'start_time'  => '2026-07-05 19:00:00',
                'end_time'    => '2026-07-05 22:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'Regular',   'price' => 100000, 'available_stock' => 300],
                    ['name' => 'Premium',   'price' => 200000, 'available_stock' => 100],
                ],
            ],

            // Technology
            [
                'organizer'   => $createdOrganizers[1],
                'category'    => $createdCategories['Technology'],
                'title'       => 'TechPeak Summit 2026',
                'description' => 'Indonesia\'s premier technology conference. Explore the latest in AI, cloud computing, cybersecurity, and product innovation through keynotes, workshops, and networking sessions.',
                'banner_url'  => null,
                'location'    => 'Jakarta Convention Center, Jakarta',
                'start_time'  => '2026-08-20 08:00:00',
                'end_time'    => '2026-08-21 18:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'General Pass',     'price' => 500000,  'available_stock' => 1500],
                    ['name' => 'Professional Pass', 'price' => 1200000, 'available_stock' => 300],
                    ['name' => 'Sponsor Package',  'price' => 5000000, 'available_stock' => 20],
                ],
            ],
            [
                'organizer'   => $createdOrganizers[1],
                'category'    => $createdCategories['Technology'],
                'title'       => 'Hackathon 48H: Build for Impact',
                'description' => 'A 48-hour hackathon challenging developers, designers, and entrepreneurs to build solutions for real-world problems. Cash prizes and mentorship from industry leaders.',
                'banner_url'  => null,
                'location'    => 'Hub Space, Sudirman, Jakarta',
                'start_time'  => '2026-09-12 08:00:00',
                'end_time'    => '2026-09-14 08:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'Participant (per team of 4)', 'price' => 0,      'available_stock' => 100],
                    ['name' => 'Sponsor Seat',               'price' => 2000000, 'available_stock' => 10],
                ],
            ],

            // Sports

            [
                'organizer'   => $createdOrganizers[2],
                'category'    => $createdCategories['Sports'],
                'title'       => 'National Badminton Open 2026',
                'description' => 'A national-level badminton tournament welcoming singles, doubles, and mixed doubles categories for both amateur and professional players.',
                'banner_url'  => null,
                'location'    => 'Istora Senayan, Jakarta',
                'start_time'  => '2026-10-03 08:00:00',
                'end_time'    => '2026-10-05 20:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'Spectator - Day Pass',  'price' => 50000,  'available_stock' => 3000],
                    ['name' => 'Spectator - Full Event', 'price' => 120000, 'available_stock' => 500],
                    ['name' => 'Athlete Registration',  'price' => 200000, 'available_stock' => 256],
                ],
            ],

            // Business
            [
                'organizer'   => $createdOrganizers[1],
                'category'    => $createdCategories['Business'],
                'title'       => 'Startup Pitch Night: Season 3',
                'description' => 'Watch emerging startups pitch their ideas to a panel of top investors and venture capitalists. Network with founders, VCs, and ecosystem players over cocktails.',
                'banner_url'  => null,
                'location'    => 'The Foundry, SCBD, Jakarta',
                'start_time'  => '2026-06-25 17:00:00',
                'end_time'    => '2026-06-25 21:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'Audience Seat',   'price' => 0,      'available_stock' => 200],
                    ['name' => 'Pitcher Slot',    'price' => 500000, 'available_stock' => 15],
                    ['name' => 'Investor Access', 'price' => 0,      'available_stock' => 50],
                ],
            ],

            // Arts & Craft
            [
                'organizer'   => $createdOrganizers[0],
                'category'    => $createdCategories['Arts & Craft'],
                'title'       => 'Nusantara Art & Craft Expo 2026',
                'description' => 'A celebration of Indonesian art and traditional crafts. Features 100+ local artisan booths, live painting demonstrations, batik workshops, and cultural performances.',
                'banner_url'  => null,
                'location'    => 'Museum Nasional, Jakarta',
                'start_time'  => '2026-11-08 09:00:00',
                'end_time'    => '2026-11-10 17:00:00',
                'status'      => 'active',
                'tickets'     => [
                    ['name' => 'General Entry',     'price' => 25000,  'available_stock' => 5000],
                    ['name' => 'Workshop Package',  'price' => 150000, 'available_stock' => 200],
                    ['name' => 'Artisan Booth Fee', 'price' => 300000, 'available_stock' => 100],
                ],
            ],

            // Finished events

        ];

        foreach ($events as $eventData) {
            $tickets = $eventData['tickets'];
            unset($eventData['tickets']);

            $event = Event::firstOrCreate(
                ['title' => $eventData['title']],
                [
                    'organizer_id' => $eventData['organizer']->user_id,
                    'category_id'  => $eventData['category']->category_id,
                    'description'  => $eventData['description'],
                    'banner_url'   => $eventData['banner_url'],
                    'location'     => $eventData['location'],
                    'start_time'   => $eventData['start_time'],
                    'end_time'     => $eventData['end_time'],
                    'status'       => $eventData['status'],
                ]
            );

            foreach ($tickets as $ticket) {
                TicketType::firstOrCreate(
                    ['event_id' => $event->event_id, 'name' => $ticket['name']],
                    [
                        'price'           => $ticket['price'],
                        'available_stock' => $ticket['available_stock'],
                    ]
                );
            }
        }

        $this->command->info('EventSeeder: seeded ' . count($events) . ' events with categories, organizers, and ticket types.');
    }
}
