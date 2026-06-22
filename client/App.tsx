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
import AdminHome from './admin/AdminHome';
import AdminStatistics from './admin/AdminStatistics';
import AdminServices from './admin/AdminServices';
import AdminPrograms from './admin/AdminPrograms';
import AdminBlog from './admin/AdminBlog';
import AdminTestimonials from './admin/AdminTestimonials';
import AdminFAQ from './admin/AdminFAQ';
import AdminGallery from './admin/AdminGallery';
import AdminAbout from './admin/AdminAbout';
import AdminContact from './admin/AdminContact';
import AdminSettings from './admin/AdminSettings';
import AdminUsers from './admin/AdminUsers';
import AdminAssessment from './admin/AdminAssessment';
import AdminAppointments from './admin/AdminAppointments';
import AdminBookingSettings from './admin/AdminBookingSettings';

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
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
          <Route path="home" element={<AdminHome />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="programs" element={<AdminPrograms />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="faq" element={<AdminFAQ />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="assessment" element={<AdminAssessment />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="booking-settings" element={<AdminBookingSettings />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
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
        <Route path="contact" element={<ContactPage />} />
        <Route path="book" element={<BookPage />} />
      </Route>
    </Routes>
    </>
  );
}
