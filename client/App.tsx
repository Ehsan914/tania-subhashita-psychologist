import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ─── Public Pages ───────────────────────────────────────────────────────────────
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProgramsPage from './pages/ProgramsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import BookPage from './pages/BookPage';

// ─── Admin Panel ────────────────────────────────────────────────────────────────
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminAccount from './admin/AdminAccount';
import AdminContentPage from './admin/AdminContentPage';
import AdminPageEditor from './admin/AdminPageEditor';
import AdminAppointments from './admin/AdminAppointments';

// ─── Scroll Reset ───────────────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ─── Protected Route Wrapper ────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-app" style={{ display: 'grid', placeItems: 'center' }}>
        <span className="spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

// ─── App Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="home" element={<AdminPageEditor section="home" />} />
          <Route path="statistics" element={<AdminContentPage type="statistics" />} />
          <Route path="services" element={<AdminContentPage type="services" />} />
          <Route path="programs" element={<AdminContentPage type="programs" />} />
          <Route path="blog" element={<AdminContentPage type="blog" />} />
          <Route path="testimonials" element={<AdminContentPage type="testimonials" />} />
          <Route path="faq" element={<AdminContentPage type="faqs" />} />
          <Route path="gallery" element={<AdminContentPage type="gallery" />} />
          <Route path="about" element={<AdminPageEditor section="about" />} />
          <Route path="contact" element={<AdminPageEditor section="contact" />} />
          <Route path="assessment" element={<AdminContentPage type="assessment" />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="booking-settings" element={<AdminPageEditor section="booking" />} />
          <Route path="settings" element={<AdminPageEditor section="settings" />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>
      </Routes>
      </>
    );
  }

  // ─── Public Routes ──────────────────────────────────────────────────────────
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="book" element={<BookPage />} />
      </Route>
    </Routes>
    </>
  );
}
