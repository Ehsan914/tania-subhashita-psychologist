import { useNavigate } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { Reveal } from '../components/Reveal';

export default function ProgramsPage() {
  const navigate = useNavigate();
  const { programs } = useSiteData();

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto text-left">
      <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
        <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">Structured Care Frameworks</span>
        <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">Comprehensive Healing Programs</h1>
        <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
          For deeper struggles, consistent staged guidance achieves far greater results than standalone drop-in sessions. These specific programs are structured to walk you from raw distress to total personal resilience.
        </p>
      </Reveal>

      <div className="space-y-10">
        {programs.map((prog, i) => (
          <Reveal delay={i * 100} key={prog.id} className="h-full">
            <div className="bg-[#FAF4E2] border-2 border-[#1C4751]/12 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 hover:border-[#1C4751]/40 transition duration-300">
              <div className="md:w-3/5 space-y-4">
                <span className="text-[10px] font-bold tracking-widest text-[#E4B24C] uppercase bg-[#C9923A]/10 px-2.5 py-1 rounded">{prog.duration}</span>
                <h2 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-[#1C4751] leading-tight">{prog.title}</h2>
                <p className="text-xs font-bold text-[#6E7C4E] uppercase tracking-widest italic">{prog.subtitle}</p>
                <p className="text-xs text-[#5C6A6C] leading-relaxed">{prog.description}</p>
                <div className="pt-2">
                  <p className="text-xs font-bold text-[#1C4751] uppercase mb-1">Suitable For:</p>
                  <p className="text-xs text-[#2A3A3E] leading-relaxed font-semibold">{prog.suitability}</p>
                </div>
              </div>
              <div className="md:w-2/5 md:border-l border-[#1C4751]/10 md:pl-8 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C4751] mb-3">Staged Curricular Milestones:</h4>
                  <ul className="space-y-2">
                    {prog.details.map((det, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-[#5C6A6C] leading-relaxed">
                        <span className="text-[#E4B24C] font-bold mt-0.5 shrink-0">✔</span>
                        {det}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    navigate('/book', { state: { serviceId: prog.linkedServiceSlug || 'psychotherapy', sessionType: 'full', message: `I am registering interest for the: ${prog.title}` } });
                  }}
                  className="bg-[#1C4751] hover:bg-[#4F8E99] text-[#FAF4E2] text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-lg text-center cursor-pointer transition duration-200 mt-6 md:mt-0"
                  id={`reg-prog-${prog.slug}`}
                >
                  Register &amp; Book Initial Evaluation
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
