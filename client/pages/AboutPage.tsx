import { Check } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { useSiteData } from '../context/SiteDataContext';

export default function AboutPage() {
  const { about, credentials, methodologySteps } = useSiteData();

  return (
    <div className="py-16 px-4 max-w-6xl mx-auto text-left">
      {/* Split top intro */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-16">
        <Reveal delay={100} className="md:col-span-5">
          <div className="relative w-full max-w-sm mx-auto rounded-xs bg-gradient-to-br from-[#4F8E99]/20 to-[#8F9D63]/30 bg-[#EFE5C8] overflow-hidden flex flex-col border border-[#1C4751]/5 shadow-md">
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
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none py-10">
              <div className="relative w-[65%] max-w-[280px] aspect-[4/5] bg-gradient-to-br from-[#cdd2b0] via-[#9fb0a6] to-[#7c93a0] rounded-[2px] shadow-[0_24px_50px_rgba(28,71,81,0.22)] -rotate-[2deg] overflow-hidden flex items-center justify-center">
                {about?.portraitImageUrl ? (
                  <img
                    src={about.portraitImageUrl}
                    alt={about?.profileName || 'Portrait'}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-sans-mulish text-[0.6rem] tracking-[0.34em] text-white/70 absolute inset-0 flex items-center justify-center select-none">PORTRAIT</span>
                )}
                <span className="absolute -top-3.25 left-1/2 -translate-x-1/2 -rotate-3 w-22 h-6.5 bg-[#E4B24C]/60 shadow-[0_2px_6px_rgba(0,0,0,0.08)] z-10"></span>
              </div>
            </div>
            <div className="relative z-20 bg-[#FAF4E2]/90 backdrop-blur-sm border-t border-[#1C4751]/10 p-6 self-start w-full mt-auto">
              <p className="font-serif-cormorant text-xl text-[#1C4751] font-semibold">{about?.profileName || 'Tania Subhashita'}</p>
              <p className="text-[10px] tracking-widest text-[#5C6A6C] uppercase font-bold mt-1">{about?.profileRole || 'Lead mental health expert'}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={300} className="md:col-span-7 space-y-6">
          <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">{about?.tagline || 'Professional Bio'}</span>
          <h1 className="font-serif-cormorant text-4xl sm:text-5xl text-[#1C4751] font-light leading-tight">{about?.heading || 'Meet Tania Subhashita'}</h1>
          <p className="text-sm text-[#5C6A6C] leading-relaxed" dangerouslySetInnerHTML={{ __html: about?.paragraph1 || '' }} />
          <p className="text-sm text-[#5C6A6C] leading-relaxed" dangerouslySetInnerHTML={{ __html: about?.paragraph2 || '' }} />
          {about?.highlightQuote && (
            <p className="text-sm text-[#2A3A3E] leading-relaxed italic border-l-4 border-[#E4B24C] pl-4 bg-[#EFE5C8]/40 py-2 rounded-r">
              &ldquo;{about.highlightQuote}&rdquo;
            </p>
          )}
        </Reveal>
      </div>

      {/* Credentials Grid */}
      {credentials.length > 0 && (
        <Reveal delay={100}>
          <div className="bg-[#EFE5C8] p-8 rounded-lg mb-16 text-left">
            <h3 className="font-serif-cormorant text-2xl text-[#1C4751] font-semibold mb-6">Verified Training &amp; Accreditations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {credentials.map((cred) => (
                <div key={cred.id} className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                  <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> {cred.title}
                  </div>
                  <p className="text-xs text-[#5C6A6C] leading-relaxed">{cred.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Methodology */}
      {methodologySteps.length > 0 && (
        <Reveal delay={200}>
          <div className="space-y-8 max-w-3xl mx-auto">
            <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block text-center">My Staged Methodology</span>
            <h2 className="font-serif-cormorant text-3xl font-light text-[#1C4751] text-center">Three Pillars of Enduring Healing</h2>
            <div className="space-y-6 mt-8">
              {methodologySteps.map((step) => (
                <div key={step.id} className="p-6 bg-[#FAF4E2] border border-[#1C4751]/10 rounded flex gap-4">
                  <div className="text-3xl font-serif-cormorant font-bold text-[#E4B24C]">{step.stepNumber}</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C4751] uppercase tracking-wider mb-1">{step.title}</h4>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
