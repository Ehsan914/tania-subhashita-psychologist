import { QuoteIcon, FemaleIcon, MaleIcon } from '../icons';
import { useSiteData } from '../../context/SiteDataContext';
import { Reveal } from '../Reveal';

export default function TestimonialsSection() {
  const { testimonials } = useSiteData();

  if (testimonials.length === 0) return null;

  // Duplicate enough times to always fill the track for a seamless loop
  const copies = testimonials.length < 4 ? 4 : 2;
  const track = Array.from({ length: copies }, () => testimonials).flat();

  // ~8s per card so reading pace feels comfortable
  const duration = `${testimonials.length * 8}s`;

  return (
    <section className="py-24 bg-[#EFE5C8]/50 overflow-hidden">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-14">
        <Reveal>
          <div className="text-center">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-[#6E7C4E] uppercase block mb-4">
              Client Experiences
            </span>
            <h2 className="font-serif-cormorant text-4xl sm:text-5xl text-[#1C4751]">
              Words from those we've helped
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="h-px w-16 bg-[#E4B24C]/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E4B24C]/70" />
              <div className="h-px w-16 bg-[#E4B24C]/40" />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Marquee track — clipped to content width, pauses on hover */}
      <div className="max-w-6xl mx-auto overflow-hidden">
      <div
        className="flex gap-5 w-max hover:[animation-play-state:paused]"
        style={{ animation: `marquee ${duration} linear infinite` }}
      >
        {track.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="w-80 shrink-0 bg-[#FAF4E2] border border-[#1C4751]/8 rounded-2xl p-7 flex flex-col"
          >
            <QuoteIcon className="w-7 h-7 text-[#E4B24C] opacity-55 mb-4 shrink-0" />
            <p className="font-serif-cormorant text-xl text-[#2A3A3E] italic leading-relaxed flex-1 mb-6">
              "{t.text}"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-[#1C4751]/8">
              <div className="w-9 h-9 rounded-full bg-[#EFE5C8] border border-[#1C4751]/15 flex items-center justify-center text-[#1C4751] shrink-0">
                {t.gender === 'female' ? <FemaleIcon className="w-4 h-4" /> : <MaleIcon className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-bold text-[#1C4751] text-xs uppercase tracking-wider">{t.name}</div>
                <div className="text-[#5C6A6C] text-[10px] tracking-widest uppercase mt-0.5">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

    </section>
  );
}
