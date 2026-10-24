import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProgramsPage from './pages/ProgramsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import BookPage from './pages/BookPage';
import ServicePage from './pages/ServicePage';
import NotFoundPage from './pages/NotFoundPage';

// ─── Scroll Reset ───────────────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ─── App Root ───────────────────────────────────────────────────────────────────
// Content is edited in Sanity Studio, so the site has public routes only.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServicePage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="book" element={<BookPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
