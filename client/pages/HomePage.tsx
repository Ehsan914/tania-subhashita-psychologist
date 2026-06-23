import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CalendarDays, ChevronRight } from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { Reveal } from '../components/Reveal';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { DynamicServiceIcon } from '../components/DynamicServiceIcon';
import GallerySection from '../components/sections/GallerySection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import FAQSection from '../components/sections/FAQSection';

interface CustomBooking {
  id: string;
  serviceId: string;
  sessionType: 'free' | 'full';
  format: 'in-person' | 'online';
  date: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message: string;
  timestamp: string;
  status: 'confirmed' | 'pending';
}

export default function HomePage() {
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<CustomBooking[]>([]);
  const [checklistScore, setChecklistScore] = useState<number | null>(null);
  const [checklistResponses, setChecklistResponses] = useState<Record<number, boolean>>({});

  // ─── All data comes from the pre-fetched site context ────────────────────────
  const {
    hero,
    statistics,
    welcome,
    services,
    assessmentQuestions,
    scoreBands,
    methodologyQuote,
    cta,
  } = useSiteData();

  useEffect(() => {
    const saved = localStorage.getItem('tania_bookings');
    if (saved) {
      try {
        setRecentBookings(JSON.parse(saved));
      } catch (e) { /* Safe fallback */ }
    }
  }, []);

  const handleCancelBooking = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this scheduled session?")) {
      const updated = recentBookings.filter(b => b.id !== id);
      localStorage.setItem('tania_bookings', JSON.stringify(updated));
      setRecentBookings(updated);
    }
  };

  const handleAssessmentSubmit = () => {
    const positiveResponses = Object.values(checklistResponses).filter(v => v === true).length;
    setChecklistScore(positiveResponses);
  };

  const resetAssessment = () => {
    setChecklistResponses({});
    setChecklistScore(null);
  };

  const getScoreBand = (score: number) => {
    return scoreBands.find(band => score >= band.minScore && score <= band.maxScore);
  };

  return (
    <div>
      {/* HERO SEGMENT */}
      <section className="relative px-4 py-12 md:py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal delay={100} className="space-y-6 text-left">
            <span className="text-[10px] tracking-[0.28em] font-semibold text-[#6E7C4E] uppercase block">
              {hero?.tagline || 'Psychotherapy · Counselling · Dhaka Location'}
            </span>
            <h1 className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl leading-tight text-[#1C4751] font-light">
              {hero?.titleLine1 || 'Reconnect'} <br />
              {hero?.titleLine2 || 'with your'} <br />
              <span className="italic font-normal text-[#6E7C4E] font-serif-cormorant">{hero?.titleLine3 || 'true self.'}</span>
            </h1>
            <p className="text-[#5C6A6C] max-w-md text-base sm:text-lg leading-relaxed">
              {hero?.description || ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/book')}
                className="bg-[#1C4751] text-[#FAF4E2] hover:bg-[#4F8E99] text-xs font-bold uppercase tracking-widest py-4 px-8 rounded transition duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md text-center"
                id="hero-book-consult"
              >
                {hero?.ctaPrimaryText || 'Book 20-Min Free Consult'}
              </button>
              <button 
                onClick={() => navigate('/services')}
                className="text-[#1C4751] hover:bg-[#1C4751]/5 border border-[#1C4751] text-xs font-bold uppercase tracking-widest py-4 px-8 rounded transition duration-200 text-center flex items-center justify-center gap-2 cursor-pointer"
                id="hero-view-healing"
              >
                {hero?.ctaSecondaryText || 'Our services'} <ArrowRight className="w-4 h-4 text-[#4F8E99]" />
              </button>
            </div>
          </Reveal>

          <Reveal delay={300} className="relative h-full flex items-center justify-center mt-12 md:mt-0">
            <div className="relative w-full aspect-4/5 max-w-sm mx-auto rounded-xs bg-linear-to-br from-[#4F8E99]/20 to-[#8F9D63]/30 bg-[#EFE5C8] overflow-hidden flex items-center justify-center border border-[#1C4751]/5">
              <svg className="absolute opacity-50 z-0" style={{bottom: '-10px', right: '-20px', width: '280px'}} viewBox="0 0 200 200" fill="none">
                <g stroke="#C9923A" strokeWidth="1.1" opacity=".8">
                  <path d="M100 200 C95 150 90 110 95 70"/>
                  <path d="M95 130 C70 120 55 110 45 95"/>
                  <path d="M95 100 C120 92 138 80 150 62"/>
                  <path d="M95 80 C75 72 62 60 55 45"/>
                </g>
                <g fill="#E4B24C" opacity=".85">
                  <circle cx="45" cy="93" r="5"/><circle cx="55" cy="43" r="5"/>
                  <circle cx="150" cy="60" r="5"/><circle cx="95" cy="68" r="6"/>
                  <circle cx="34" cy="100" r="3.5"/><circle cx="160" cy="52" r="3.5"/>
                </g>
                <g fill="#8F9D63" opacity=".8">
                  <circle cx="70" cy="118" r="4"/><circle cx="135" cy="74" r="4"/><circle cx="62" cy="58" r="4"/>
                </g>
              </svg>
              <div className="relative w-[62%] max-w-82.5 aspect-4/5 ml-[-6%] bg-gradient-to-br from-[#cdd2b0] via-[#9fb0a6] to-[#7c93a0] rounded-[2px] shadow-[0_24px_50px_rgba(28,71,81,0.22)] -rotate-[1.5deg] overflow-hidden flex items-center justify-center z-10">
                {hero?.portraitImageUrl ? (
                  <img
                    src={hero.portraitImageUrl}
                    alt={hero?.portraitAttribution || 'Portrait'}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-sans-mulish text-[0.6rem] tracking-[0.34em] text-white/70 absolute inset-0 flex items-center justify-center select-none pointer-events-none">PORTRAIT</span>
                )}
                <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 -rotate-[3deg] w-[88px] h-[26px] bg-[#E4B24C]/60 shadow-[0_2px_6px_rgba(0,0,0,0.08)] z-10"></span>
              </div>
              <div className="absolute right-[7%] bottom-[7%] max-w-[330px] w-48 text-[#FBF6E6] z-20 font-serif-cormorant text-2xl drop-shadow-[0_2px_14px_rgba(28,71,81,0.45)] text-shadow-lg/30 leading-snug">
                {hero?.portraitQuote || '\u201cHelping you heal, grow, and thrive — every day.\u201d'}
                <span className="block mt-3.5 font-sans-mulish text-[0.62rem] tracking-[0.28em] opacity-85 uppercase">
                  {hero?.portraitAttribution || '— Tania Subhashita'}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CLINICAL STATS */}
      <section className="bg-[#6E7C4E] text-[#FAF4E2] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-[#E4B24C] uppercase block mb-2">
              Evidence of Dedicated Clinical Practice
            </span>
            <h2 className="font-serif-cormorant text-3xl sm:text-4xl lg:text-5xl font-light text-[#FAF4E2]">
              Measurable Guidance &amp; Care
            </h2>
            <div className="w-16 h-0.5 bg-[#E4B24C] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, i) => (
              <Reveal delay={i * 100} key={stat.id}>
                <div className="bg-[#1C4751]/20 border border-[#FAF4E2]/12 p-6 rounded-[8px] text-center hover:bg-[#1C4751]/30 transition duration-300 h-full">
                  <div className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#E4B24C] font-semibold block mb-2">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#FAF4E2] mb-3 leading-snug">
                    {stat.label}
                  </div>
                  <p className="text-xs text-[#FAF4E2]/80 leading-relaxed max-w-[200px] mx-auto">
                    {stat.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WELCOME SUMMARY */}
      <section id="about" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <Reveal delay={100} className="md:col-span-5 relative">
            <div className="bg-[#EFE5C8] border border-[#1C4751]/13 rounded-lg p-6 max-w-xs mx-auto">
              <div className="bg-[#FAF4E2] border border-[#1C4751]/10 rounded aspect-[3/4] flex flex-col justify-between p-6 shadow-md relative overflow-hidden transform rotate-2">
                {welcome?.portraitImageUrl && (
                  <img
                    src={welcome.portraitImageUrl}
                    alt={welcome.credentialName || 'Portrait'}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                {welcome?.portraitImageUrl && (
                  <div className="absolute inset-0 bg-linear-to-t from-[#1C4751]/85 via-[#1C4751]/10 to-transparent" />
                )}
                <div className="relative z-10 w-12 h-1 bg-[#6E7C4E] rounded"></div>
                <div className="relative z-10">
                  <span className={`text-[10px] tracking-widest uppercase block mb-1 ${welcome?.portraitImageUrl ? 'text-[#FAF4E2]/70' : 'text-[#5C6A6C]'}`}>Clinic Credentials</span>
                  <p className={`font-serif-cormorant text-xl font-semibold ${welcome?.portraitImageUrl ? 'text-[#FAF4E2]' : 'text-[#1C4751]'}`}>{welcome?.credentialName || 'Tania Subhashita'}</p>
                  <p className={`text-[11px] mt-1 font-medium leading-relaxed ${welcome?.portraitImageUrl ? 'text-[#EFE5C8]/80' : 'text-[#2A3A3E]'}`} dangerouslySetInnerHTML={{ __html: welcome?.credentialTitle || '' }} />
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={300} className="md:col-span-7 space-y-6 text-left">
            <div className="font-script-pinyon text-4xl text-[#E4B24C] select-none block leading-none">{welcome?.scriptTitle || 'Welcome'}</div>
            <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751] font-light leading-tight">
              {welcome?.heading || ''}
            </h2>
            <p className="text-sm text-[#5C6A6C] leading-relaxed" dangerouslySetInnerHTML={{ __html: welcome?.paragraph1 || '' }} />
            <p className="text-sm text-[#5C6A6C] leading-relaxed" dangerouslySetInnerHTML={{ __html: welcome?.paragraph2 || '' }} />
            <div className="pt-4 flex flex-wrap gap-4">
              <button onClick={() => navigate('/about')} className="bg-[#1C4751] text-[#FAF4E2] hover:bg-[#4F8E99] font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded transition duration-200 cursor-pointer" id="welcome-about-cta">
                Read My Qualifications
              </button>
              <button onClick={() => navigate('/services')} className="border border-[#1C4751] text-[#1C4751] hover:bg-[#1C4751]/5 font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded transition duration-200 cursor-pointer" id="welcome-services-cta">
                Explore Care Services
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="bg-[#EFE5C8] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div className="text-left space-y-2">
              <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">Services Catalog</span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl lg:text-5xl text-[#1C4751] font-light">Professional Specialized Therapies</h2>
            </div>
            <button onClick={() => navigate('/services')} className="text-[#1C4751] text-xs font-bold uppercase tracking-widest hover:underline mt-4 md:mt-0 flex items-center gap-1 cursor-pointer" id="featured-services-all">
              Browse All Services <ArrowRight className="w-4 h-4 text-[#C9923A]" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 8).map((srv, i) => (
              <Reveal delay={i * 50} key={srv.id}>
                <div className="bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between text-left group h-full">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] mb-5 group-hover:bg-[#E4B24C]/20 transition-all">
                      <DynamicServiceIcon iconName={srv.iconName} className="w-5 h-5 text-[#1C4751]" />
                    </div>
                    <h3 className="font-serif-cormorant text-xl font-semibold text-[#1C4751] mb-2 leading-tight group-hover:text-[#4F8E99] transition-colors">{srv.name}</h3>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed mb-4 line-clamp-4">{srv.description}</p>
                  </div>
                  <div className="pt-4 border-t border-[#1C4751]/5 flex justify-between items-center mt-3">
                    <span className="text-[9px] font-bold tracking-widest text-[#6E7C4E] uppercase">{srv.category}</span>
                    <button onClick={() => navigate('/services', { state: { openServiceSlug: srv.slug } })} className="text-xs text-[#1C4751] font-bold group-hover:text-[#C9923A] transition-colors inline-flex items-center cursor-pointer" id={`service-more-${srv.slug}`}>
                      More <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-12 bg-[#FAF4E2] border border-[#1C4751]/10 p-6 rounded-lg max-w-2xl mx-auto text-sm text-[#2A3A3E]">
            💡 <strong>Struggling with a very specific challenge?</strong> Our practice has tailored plans for all {services.length} distinct areas including OCD, Drug/Device Addiction, Teen Exam Phobia, and Partner Grief.
            <button onClick={() => navigate('/services')} className="text-[#4F8E99] font-bold underline hover:text-[#1C4751] ml-1.5 inline-block" id="find-specific-care">
              Find your specific care dialect
            </button>
          </div>
        </div>
      </section>

      {/* SELF-ASSESSMENT */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="bg-[#FAF4E2] border-2 border-[#1C4751]/12 rounded-xl p-8 shadow-sm text-left">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-[#6E7C4E] uppercase block mb-2">Interactive Exercise</span>
          <h2 className="font-serif-cormorant text-2xl sm:text-3xl text-[#1C4751] font-light mb-4">Weekly Anxiety &amp; Strain Self-Audit</h2>
          <p className="text-xs text-[#5C6A6C] leading-relaxed mb-6">
            Check each statement that mirrors your mental state or habits over the last seven days. This gives an indication of whether stepping into professional therapy can support you.
          </p>
          {checklistScore === null ? (
            <div className="space-y-4">
              {assessmentQuestions.map((q, index) => (
                <label key={q.id} className="flex items-start gap-3 p-3 rounded hover:bg-[#1C4751]/5 transition border border-transparent hover:border-[#1C4751]/5 cursor-pointer">
                  <input type="checkbox" checked={!!checklistResponses[index]} onChange={(e) => setChecklistResponses({ ...checklistResponses, [index]: e.target.checked })} className="mt-1 w-4.5 h-4.5 accent-[#1C4751] cursor-pointer" />
                  <span className="text-xs sm:text-sm text-[#2A3A3E] leading-relaxed select-none">{q.text}</span>
                </label>
              ))}
              <div className="pt-6 border-t border-[#1C4751]/11 flex justify-end">
                <button onClick={handleAssessmentSubmit} className="bg-[#1C4751] text-[#FAF4E2] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-[#4F8E99] cursor-pointer" id="calculate-assessment-score">
                  Calculate My Strain Score
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center py-6">
              <div className="w-20 h-20 rounded-full bg-[#1C4751]/10 flex items-center justify-center font-serif-cormorant text-[#1C4751] text-3xl font-semibold mx-auto">{checklistScore}/{assessmentQuestions.length}</div>
              <div className="max-w-lg mx-auto text-left">
                {(() => {
                  const band = getScoreBand(checklistScore);
                  if (band) {
                    return (
                      <p className="text-sm text-[#2A3A3E] leading-relaxed">
                        {band.emoji} <strong>{band.label}:</strong> {band.message}
                      </p>
                    );
                  }
                  return <p className="text-sm text-[#2A3A3E] leading-relaxed">Thank you for completing the assessment.</p>;
                })()}
              </div>
              <div className="flex justify-center gap-4 pt-4">
                <button onClick={resetAssessment} className="text-xs text-[#5C6A6C] hover:text-[#1C4751] uppercase tracking-widest font-bold cursor-pointer" id="reset-assessment">Try Again</button>
                <button onClick={() => navigate('/book')} className="bg-[#C9923A] text-white text-xs font-bold uppercase tracking-widest py-2.5 px-5 rounded cursor-pointer" id="score-book-cta">Book Introductory Free Talk</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* METHODOLOGY QUOTE */}
      <section className="bg-[#1C4751] text-[#FAF4E2] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="font-script-pinyon text-5xl text-[#E4B24C] select-none">{methodologyQuote?.scriptTitle || 'At your own pace'}</span>
          <blockquote className="font-serif-cormorant text-2xl sm:text-3xl italic text-[#FAF4E2] leading-relaxed">
            {methodologyQuote?.quote || ''}
          </blockquote>
          <div className="text-xs font-bold tracking-widest uppercase text-[#FAF4E2]/70">{methodologyQuote?.attribution || ''}</div>
        </div>
      </section>

      <GallerySection />
      <TestimonialsSection />
      <FAQSection />

      {/* RECENT BOOKINGS */}
      {recentBookings.length > 0 && (
        <section className="py-12 px-4 max-w-4xl mx-auto text-left">
          <div className="bg-[#EFE5C8] border border-[#1C4751]/12 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4 text-[#1C4751]">
              <Calendar className="w-5 h-5" />
              <h3 className="font-serif-cormorant text-lg font-bold">Your Scheduled Consultations ({recentBookings.length})</h3>
            </div>
            <div className="space-y-4">
              {recentBookings.map((b) => (
                <div key={b.id} className="bg-[#FAF4E2] p-4 rounded border border-[#1C4751]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C4751]/15 text-[#1C4751]">{b.id}</span>
                      <span className="font-bold text-xs text-[#2A3A3E]">{b.serviceId}</span>
                    </div>
                    <p className="text-xs text-[#5C6A6C] mt-1.5 flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-[#6E7C4E]" /> {b.date} at {b.timeSlot}
                      <span className="bullet">·</span>
                      <span className="capitalize text-[10px] font-semibold bg-[#6E7C4E]/10 text-[#6E7C4E] px-1.5 rounded">{b.format}</span>
                      <span className="capitalize text-[10px] font-semibold bg-[#E4B24C]/20 text-[#C9923A] px-1.5 rounded">{b.sessionType === 'free' ? '20-min intro' : '60-min Full'}</span>
                    </p>
                  </div>
                  <button onClick={() => handleCancelBooking(b.id)} className="text-[10px] text-red-600 hover:text-red-800 uppercase tracking-wider font-extrabold cursor-pointer py-1.5 px-3 rounded hover:bg-red-50 transition border border-transparent hover:border-red-100" id={`cancel-${b.id}`}>
                    Cancel Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1C4751] to-[#2A3A3E] text-[#FAF4E2] py-24 px-4 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="font-serif-cormorant text-3xl sm:text-4xl lg:text-5xl font-light text-[#FAF4E2] leading-tight">
            {cta?.heading || ''}
          </h2>
          <p className="text-xs sm:text-sm text-[#FAF4E2]/70 tracking-wide">
            {cta?.subtitle || ''}
          </p>
          <div className="pt-4">
            <div className="font-script-pinyon text-4xl sm:text-5xl text-[#E4B24C] block mx-auto py-2 mb-6 drop-shadow-sm">{cta?.scriptTitle || ''}</div>
            <button onClick={() => navigate('/book')} className="bg-[#E4B24C] text-[#1C4751] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest py-4 px-8 rounded transition duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-lg inline-block" id="cta-bottom">
              {cta?.buttonText || 'Schedule Consultation'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
