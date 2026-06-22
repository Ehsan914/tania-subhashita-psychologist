import { Outlet } from 'react-router-dom';
import Header from '../components/sections/Header';
import Footer from '../components/sections/Footer';
import CrisisAlert from '../components/sections/CrisisAlert';
import AnnouncementBanner from '../components/sections/AnnouncementBanner';
import { SiteDataProvider, useSiteData } from '../context/SiteDataContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAF4E2] flex flex-col items-center justify-center gap-6 selection:bg-[#E4B24C] selection:text-[#1C4751]">
      {/* Animated logo mark */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-[#1C4751]/15 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-[#1C4751] border-r-[#E4B24C] border-b-[#6E7C4E] border-l-transparent animate-spin" />
        </div>
      </div>

      {/* Brand text */}
      <div className="text-center space-y-1.5">
        <span className="font-serif-cormorant text-2xl tracking-wide text-[#1C4751] block font-medium">
          TANIA SUBHASHITA
        </span>
        <span className="text-[10px] tracking-[0.28em] font-semibold text-[#5C6A6C] uppercase block">
          Psychologist · Mental Health Expert
        </span>
      </div>

      {/* Subtle pulse bar */}
      <div className="w-32 h-0.5 bg-[#1C4751]/10 rounded-full overflow-hidden mt-2">
        <div className="h-full w-1/2 bg-linear-to-r from-[#E4B24C] to-[#6E7C4E] rounded-full animate-pulse" 
          style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} 
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

function PublicContent() {
  const { loading } = useSiteData();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="paper-grain min-h-screen flex flex-col font-sans-mulish text-[#2A3A3E] relative selection:bg-[#E4B24C] selection:text-[#1C4751]">
      <CrisisAlert />
      <AnnouncementBanner />
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function PublicLayout() {
  return (
    <SiteDataProvider>
      <PublicContent />
    </SiteDataProvider>
  );
}
