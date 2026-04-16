import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RequireAuth } from './lib/RequireAuth'
import { lazy, Suspense } from 'react'
import { useAuth } from './lib/auth'

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
const MyEventsPage = lazy(() => import('./pages/MyEventsPage').then(module => ({ default: module.MyEventsPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(module => ({ default: module.EventDetailPage })))
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage').then(module => ({ default: module.TicketDetailPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(module => ({ default: module.HistoryPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(module => ({ default: module.AchievementsPage })))
const ChatRoomPage = lazy(() => import('./pages/ChatRoomPage').then(module => ({ default: module.ChatRoomPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })))

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(module => ({ default: module.AdminLayout })))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(module => ({ default: module.AdminCategoriesPage })))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })))
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage').then(module => ({ default: module.AdminEventsPage })))
const OrganizerEventsPage = lazy(() => import('./pages/organizer/OrganizerEventsPage').then(module => ({ default: module.OrganizerEventsPage })))
const AdminVenuesPage = lazy(() => import('./pages/admin/AdminVenuesPage').then(module => ({ default: module.AdminVenuesPage })))
const AdminScannerPage = lazy(() => import('./pages/admin/AdminScannerPage').then(module => ({ default: module.AdminScannerPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const AdminDropsPage = lazy(() => import('./pages/admin/AdminDropsPage').then(module => ({ default: module.AdminDropsPage })))
const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage').then(module => ({ default: module.AdminNewsPage })))
const AdminNotificationPage = lazy(() => import('./pages/admin/AdminNotificationPage').then(module => ({ default: module.AdminNotificationPage })))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(module => ({ default: module.AdminAnalyticsPage })))
const OrganizerAnalyticsPage = lazy(() => import('./pages/organizer/OrganizerAnalyticsPage').then(module => ({ default: module.OrganizerAnalyticsPage })))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then(module => ({ default: module.AdminReportsPage })))

import { AudioProvider } from './lib/audio'
import { PageLoader } from './components/PageLoader'
import { I18nProvider } from './lib/i18n'

// Protect admin-only routes (not for organizer)
function AdminOnlyRoute({ element }: { element: React.ReactNode }) {
  const { user } = useAuth()
  
  if (user?.role === 'organizer') {
    return <Navigate to="/admin" replace />
  }
  
  return element as React.ReactElement
}

// Redirect organizer to their specific events view
function EventsRouteDispatcher() {
  const { user } = useAuth()
  if (user?.role === 'organizer') {
    return <OrganizerEventsPage />
  }
  return <AdminEventsPage />
}

// Redirect organizer to their specific analytics view
function AnalyticsRouteDispatcher() {
  const { user } = useAuth()
  if (user?.role === 'organizer') {
    return <OrganizerAnalyticsPage />
  }
  return <AdminAnalyticsPage />
}

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
              <Route path="venues" element={<AdminOnlyRoute element={<AdminVenuesPage />} />} />
              <Route path="events" element={<EventsRouteDispatcher />} />
              <Route path="categories" element={<AdminOnlyRoute element={<AdminCategoriesPage />} />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="drops" element={<AdminOnlyRoute element={<AdminDropsPage />} />} />
              <Route path="news" element={<AdminOnlyRoute element={<AdminNewsPage />} />} />
              <Route path="notifications" element={<AdminOnlyRoute element={<AdminNotificationPage />} />} />
              <Route path="analytics" element={<AnalyticsRouteDispatcher />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            <Route element={<AppShell />}>
            <Route index element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
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
              path="/my-events"
              element={
                <RequireAuth>
                  <MyEventsPage />
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
