import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RequireAuth } from './lib/RequireAuth'
import { lazy, Suspense } from 'react'

const CartPage = lazy(() => import('./pages/CartPage').then(module => ({ default: module.CartPage })))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })))
const DropsPage = lazy(() => import('./pages/DropsPage').then(module => ({ default: module.DropsPage })))
const EventsPage = lazy(() => import('./pages/EventsPage').then(module => ({ default: module.EventsPage })))
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage').then(module => ({ default: module.LoyaltyPage })))
const NewsPage = lazy(() => import('./pages/NewsPage').then(module => ({ default: module.NewsPage })))
const ReservePage = lazy(() => import('./pages/ReservePage').then(module => ({ default: module.ReservePage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })))
const SuccessPage = lazy(() => import('./pages/SuccessPage').then(module => ({ default: module.SuccessPage })))
const TicketsPage = lazy(() => import('./pages/TicketsPage').then(module => ({ default: module.TicketsPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(module => ({ default: module.EventDetailPage })))
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage').then(module => ({ default: module.TicketDetailPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(module => ({ default: module.HistoryPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(module => ({ default: module.AchievementsPage })))
const ChatRoomPage = lazy(() => import('./pages/ChatRoomPage').then(module => ({ default: module.ChatRoomPage })))

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(module => ({ default: module.AdminLayout })))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })))
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage').then(module => ({ default: module.AdminEventsPage })))
const AdminVenuesPage = lazy(() => import('./pages/admin/AdminVenuesPage').then(module => ({ default: module.AdminVenuesPage })))
const AdminScannerPage = lazy(() => import('./pages/admin/AdminScannerPage').then(module => ({ default: module.AdminScannerPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const AdminDropsPage = lazy(() => import('./pages/admin/AdminDropsPage').then(module => ({ default: module.AdminDropsPage })))
const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage').then(module => ({ default: module.AdminNewsPage })))

import { AudioProvider } from './lib/audio'
import { PageLoader } from './components/PageLoader'
import { I18nProvider } from './lib/i18n'

export function App() {
  return (
    <I18nProvider>
    <AudioProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          
            {/* Admin Routes (Standalone Shell) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="scanner" element={<AdminScannerPage />} />
              <Route path="venues" element={<AdminVenuesPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="drops" element={<AdminDropsPage />} />
              <Route path="news" element={<AdminNewsPage />} />
            </Route>

            <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            <Route path="/chat/:eventId" element={<ChatRoomPage />} />
            <Route
              path="/reserve/:eventId"
              element={
                <RequireAuth>
                  <ReservePage />
                </RequireAuth>
              }
            />
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <CartPage />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/success"
              element={
                <RequireAuth>
                  <SuccessPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tickets"
              element={
                <RequireAuth>
                  <TicketsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/tickets/:ticketId"
              element={
                <RequireAuth>
                  <TicketDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/history"
              element={
                <RequireAuth>
                  <HistoryPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/loyalty"
              element={
                <RequireAuth>
                  <LoyaltyPage />
                </RequireAuth>
              }
            />
            <Route path="/drops" element={<DropsPage />} />
            <Route
              path="/achievements"
              element={
                <RequireAuth>
                  <AchievementsPage />
                </RequireAuth>
              }
            />
            

            <Route path="/news" element={<NewsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AudioProvider>
    </I18nProvider>
  )
}

export default App
