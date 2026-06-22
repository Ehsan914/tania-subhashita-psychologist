import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSiteData } from '../../context/SiteDataContext';

export default function GallerySection() {
  const { gallery } = useSiteData();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (gallery.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [gallery.length]);

  if (gallery.length === 0) return null;

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-[10px] tracking-[0.3em] font-semibold text-[#1C4751] uppercase block mb-2">
          Comfortable Atmosphere
        </span>
        <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751]">
          Our Healing Spaces
        </h2>
      </div>
      <div className="relative w-full max-w-4xl mx-auto aspect-video sm:aspect-21/9 overflow-hidden rounded-xs shadow-lg border border-[#1C4751]/10 bg-[#EFE5C8]">
        <AnimatePresence>
          <motion.img
            key={currentIndex}
            src={gallery[currentIndex]?.url}
            alt={gallery[currentIndex]?.altText || `Gallery space ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        </AnimatePresence>
        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {gallery.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex ? 'bg-[#E4B24C] w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
