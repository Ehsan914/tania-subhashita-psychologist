import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Check, X, Info, ChevronRight } from 'lucide-react';
import { useSiteData, ServiceData } from '../context/SiteDataContext';
import { Reveal } from '../components/Reveal';
import { DynamicServiceIcon } from '../components/DynamicServiceIcon';

export default function ServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { services } = useSiteData();
  const [servicesSearch, setServicesSearch] = useState('');
  const [servicesCategory, setServicesCategory] = useState<string>('All');
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceData | null>(null);

  const scrollToDrawer = () => {
    setTimeout(() => {
      const el = document.getElementById('selected-service-drawer');
      if (el) {
        const headerHeight = document.getElementById('header')?.offsetHeight ?? 72;
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 50);
  };

  useEffect(() => {
    const slug = (location.state as { openServiceSlug?: string } | null)?.openServiceSlug;
    if (slug && services.length > 0) {
      const match = services.find(s => s.slug === slug);
      if (match) {
        setSelectedServiceDetail(match);
        scrollToDrawer();
      }
    }
  }, [location.state, services]);

  const filterCategories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [services]);

  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(servicesSearch.toLowerCase()) || 
                          srv.description.toLowerCase().includes(servicesSearch.toLowerCase()) ||
                          srv.slug.toLowerCase().includes(servicesSearch.toLowerCase());
    const matchesCategory = servicesCategory === 'All' || srv.category === servicesCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookFromService = (serviceSlug: string) => {
    navigate('/book', { state: { serviceId: serviceSlug } });
  };

  return (
    <div className="py-16 px-4 max-w-6xl mx-auto text-left">
      <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
        <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">Practice Focus Areas</span>
        <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">All Care Services</h1>
        <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
          Filter or search across my clinical competencies. Click on any block to expand full details, treatment plans, and instant appointment booking options.
        </p>
      </Reveal>

      {/* Service Detail Drawer */}
      {selectedServiceDetail && (
        <Reveal className="bg-[#1C4751] text-[#FAF4E2] p-8 rounded-xl mb-12 shadow-md text-left relative overflow-hidden" id="selected-service-drawer">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none">
            <DynamicServiceIcon iconName={selectedServiceDetail.iconName} className="w-full h-full text-white" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[9px] tracking-widest text-[#E4B24C] uppercase font-extrabold px-2 py-0.5 rounded bg-[#E4B24C]/15">{selectedServiceDetail.category}</span>
              <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#FAF4E2] font-semibold mt-2">{selectedServiceDetail.name}</h2>
            </div>
            <button onClick={() => setSelectedServiceDetail(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition text-[#FAF4E2]" id="close-selected-service">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm sm:text-base text-[#FAF4E2]/90 leading-relaxed max-w-3xl mb-6">{selectedServiceDetail.description}</p>
          {(selectedServiceDetail.treatmentPoints || selectedServiceDetail.clinicNote) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded border border-white/5 mb-6 text-xs text-[#FAF4E2]/85">
              {selectedServiceDetail.treatmentPoints && (
                <div>
                  <h4 className="font-bold text-[#E4B24C] uppercase tracking-wider mb-2">What we target in therapy sessions:</h4>
                  <ul className="space-y-2">
                    {selectedServiceDetail.treatmentPoints.split('\n').filter(Boolean).map((point, i) => (
                      <li key={i} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#E4B24C] shrink-0 mt-0.5" /> {point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedServiceDetail.clinicNote && (
                <div>
                  <h4 className="font-bold text-[#E4B24C] uppercase tracking-wider mb-2">Clinic Delivery:</h4>
                  <p>{selectedServiceDetail.clinicNote}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            <button onClick={() => handleBookFromService(selectedServiceDetail.slug)} className="bg-[#E4B24C] text-[#3A2C0A] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded cursor-pointer transition" id="book-selected-service">
              Book Session for This Therapy
            </button>
            <button onClick={() => setSelectedServiceDetail(null)} className="border border-[#FAF4E2]/30 text-[#FAF4E2] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded cursor-pointer hover:bg-white/5 transition" id="back-to-all-services">
              ← Back to All Services
            </button>
          </div>
        </Reveal>
      )}

      {/* Filter & Search */}
      <Reveal delay={200} className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#FAF4E2] p-4 rounded-lg border border-[#1C4751]/12 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {filterCategories.map(cat => (
            <button key={cat} onClick={() => setServicesCategory(cat)} className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded transition cursor-pointer ${servicesCategory === cat ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#1C4751] hover:bg-[#1C4751]/10'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5C6A6C]" />
          <input type="text" placeholder="Search services..." value={servicesSearch} onChange={(e) => setServicesSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-[#1C4751]/20 rounded text-xs text-[#1C4751] focus:outline-none focus:border-[#4F8E99] font-medium" />
        </div>
      </Reveal>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv, i) => (
          <Reveal delay={i * 50} key={srv.id} className="h-full">
            <div className="bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg flex flex-col justify-between hover:border-[#1C4751]/40 transition shadow-sm text-left group h-full">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751]">
                    <DynamicServiceIcon iconName={srv.iconName} className="w-5 h-5 text-[#1C4751]" />
                  </div>
                  <span className="text-[8px] tracking-widest font-extrabold text-[#5C6A6C] uppercase bg-[#EFE5C8] px-2 py-0.5 rounded">{srv.category}</span>
                </div>
                <h3 className="font-serif-cormorant text-xl font-bold text-[#1C4751] mb-2 group-hover:text-[#4F8E99] transition-colors leading-tight">{srv.name}</h3>
                <p className="text-xs text-[#5C6A6C] leading-relaxed mb-4 line-clamp-3">{srv.description}</p>
              </div>
              <div className="pt-4 border-t border-[#1C4751]/5 flex justify-between items-center mt-3">
                <button onClick={() => { setSelectedServiceDetail(srv); scrollToDrawer(); }} className="text-xs font-semibold text-[#1C4751] hover:underline cursor-pointer" id={`read-more-${srv.slug}`}>
                  Read treatment schema
                </button>
                <button onClick={() => handleBookFromService(srv.slug)} className="bg-[#EFE5C8] hover:bg-[#E4B24C] hover:text-[#3A2C0A] text-[#1C4751] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded transition-colors duration-150 cursor-pointer" id={`book-srv-${srv.slug}`}>
                  Instant Book
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-[#FAF4E2]/50 border border-dashed border-[#1C4751]/20 rounded-lg">
          <Info className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No matching care dialects found</p>
          <p className="text-xs text-gray-400 mt-1">Try clearing your filters or testing other search keywords.</p>
        </div>
      )}
    </div>
  );
}
