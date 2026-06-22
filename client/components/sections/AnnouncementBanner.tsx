import { useState } from 'react';
import { X } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export default function AnnouncementBanner() {
  const { siteSettings } = useSiteData();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !siteSettings?.announcementActive || !siteSettings?.announcementText) return null;

  return (
    <div id="announce" className="bg-[#1C4751] text-[#FAF4E2] text-xs sm:text-sm tracking-wide py-2 px-10 text-center relative z-50">
      <p className="font-medium inline" dangerouslySetInnerHTML={{ __html: siteSettings.announcementText }} />
      <button 
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF4E2]/70 hover:text-[#FAF4E2] transition-colors p-1"
        aria-label="Dismiss Announcement"
        id="announce-close-btn"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
