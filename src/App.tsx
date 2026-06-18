/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Heart,
  ShieldAlert,
  Fingerprint,
  Activity,
  Sparkles,
  Smartphone,
  Video,
  LifeBuoy,
  Wind,
  BookOpen,
  CloudRain,
  GitCommit,
  Users,
  Sunset,
  Smile,
  Moon,
  Baby,
  Flame,
  Eye,
  Clock,
  Home as HomeIcon,
  Compass,
  Award,
  Calendar,
  Search,
  Check,
  MapPin,
  Sparkle,
  ArrowRight,
  Phone,
  Mail,
  X,
  Menu,
  ChevronRight,
  Bookmark,
  Info,
  CalendarDays,
  FileText,
  User,
  HeartPulse,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import { SERVICES_LIST, STATISTICS, BLOG_POSTS, PROGRAMS_LIST, ServiceItem, BlogPost, ClientProgram } from './servicesData';

// Dynamic helper to map icon strings to Lucide components safely
function DynamicServiceIcon({ iconName, className = "w-5 h-5" }: { iconName: string; className?: string }) {
  switch (iconName) {
    case 'Brain': return <Brain className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Fingerprint': return <Fingerprint className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'SmartphoneOff': return <Smartphone className={className} />;
    case 'Sparkle': return <Sparkle className={className} />;
    case 'FlameKindling': return <Flame className={className} />;
    case 'Video': return <Video className={className} />;
    case 'LifeBuoy': return <LifeBuoy className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'CloudRain': return <CloudRain className={className} />;
    case 'GitCommit': return <GitCommit className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Sunset': return <Sunset className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Home': return <HomeIcon className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Award': return <Award className={className} />;
    default: return <Sparkles className={className} />;
  }
}

// Intersection Observer Hook for reveal animations
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []); // Only run once on mount

  return [ref, isIntersecting] as const;
}

// Reveal Wrapper Component
function Reveal({ children, className = "", delay = 0, id }: { children: React.ReactNode, className?: string, delay?: number, key?: React.Key, id?: string  }) {
  const [ref, inView] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div 
      ref={ref} 
      id = {id}
      className={`transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useIntersectionObserver({ threshold: 0.1 });

  const numPart = value.replace(/[^0-9]/g, '');
  const target = parseInt(numPart || "0", 10);
  
  const prefixMatch = value.match(/^[^0-9,.]+/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  
  const suffixMatch = value.match(/[^0-9,.]+$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';

  useEffect(() => {
    if (inView && target > 0) {
      const duration = 2000;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeProgress * target));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      requestAnimationFrame(animate);
    } else if (inView && target === 0) {
      setCount(0);
    }
  }, [inView, target]);

  return (
    <span ref={ref as any}>
      {prefix}{target > 0 ? count.toLocaleString() : value}{suffix}
    </span>
  );
}

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

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1544027993-37db48d8e6eb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&q=80&w=800",
];

function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
            src={GALLERY_IMAGES[currentIndex]}
            alt={`Gallery space ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        </AnimatePresence>
        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {GALLERY_IMAGES.map((_, index) => (
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

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    gender: "female",
    text: "Tania provided me with the most safe and comfortable space I've ever experienced in therapy. I truly feel heard.",
    role: "Client since 2021"
  },
  {
    name: "Michael R.",
    gender: "male",
    text: "Her approach is deeply empathetic. I was able to work through years of hidden trauma at my own pace.",
    role: "Client since 2022"
  },
  {
    name: "Emily W.",
    gender: "female",
    text: "The perfect balance of professionalism and human connection. I highly recommend her services to anyone seeking true healing.",
    role: "Client since 2023"
  }
];

function QuoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function FemaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="9" r="6"/>
      <path d="M12 15v7"/>
      <path d="M9 19h6"/>
    </svg>
  );
}

function MaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="14" r="6"/>
      <path d="m14.2 9.8 5.3-5.3"/>
      <path d="M15 4h4v4"/>
    </svg>
  );
}

function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <div className="space-y-8 text-center">
        <span className="text-[10px] tracking-[0.3em] font-semibold text-[#6E7C4E] uppercase block">
          Client Experiences
        </span>
        <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751] mb-8">
          Words from those we've helped
        </h2>
        
        <div className="relative h-62.5 sm:h-45 w-full flex items-center justify-center overflow-hidden perspective-[1000px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100, rotateY: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, rotateY: 30, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="absolute w-full px-4 flex flex-col items-center justify-center pointer-events-auto"
            >
              <div className="bg-[#FAF4E2] border border-[#1C4751]/10 rounded-xs p-8 shadow-sm w-full max-w-2xl transform-gpu">
                <QuoteIcon className="w-8 h-8 text-[#E4B24C] mx-auto mb-4 opacity-50" />
                <p className="font-serif-cormorant text-xl sm:text-2xl text-[#2A3A3E] italic mb-6">
                  "{TESTIMONIALS[currentIndex].text}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EFE5C8] border border-[#1C4751]/20 flex items-center justify-center text-[#1C4751]">
                    {TESTIMONIALS[currentIndex].gender === 'female' ? <FemaleIcon className="w-5 h-5" /> : <MaleIcon className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wider">{TESTIMONIALS[currentIndex].name}</div>
                    <div className="text-[#5C6A6C] text-[10px] tracking-widest uppercase">{TESTIMONIALS[currentIndex].role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-2 mt-4 relative z-20">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                index === currentIndex ? 'bg-[#6E7C4E] w-6' : 'bg-[#6E7C4E]/30 hover:bg-[#6E7C4E]/60'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    question: "What should I expect during the first session?",
    answer: "The first session is an initial consultation where we will discuss your background, what brings you to therapy, and your goals. It's a space for us to get to know each other and determine if we are a good fit for working together."
  },
  {
    question: "How much do sessions cost and do you take insurance?",
    answer: "Individual therapy sessions are $150 per 50-minute hour. Currently, I am an out-of-network provider, which means I do not directly bill insurance. However, I can provide you with a 'superbill' that you can submit to your insurance company for potential reimbursement."
  },
  {
    question: "Is what I share in therapy confidential?",
    answer: "Yes, confidentiality is a cornerstone of the therapeutic relationship. Everything discussed in our sessions is legally and ethically confidential, with a few crucial exceptions relating to safety (such as risk of harm to yourself or others)."
  },
  {
    question: "How long does a typical therapy session last?",
    answer: "A standard therapy session lasts for 50 minutes. EMDR sessions can sometimes be scheduled for 90 minutes depending on your specific needs and treatment plan."
  }
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-[10px] tracking-[0.3em] font-semibold text-[#1C4751] uppercase block mb-2">
          Common Questions
        </span>
        <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751]">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div key={index} className="border border-[#1C4751]/10 rounded bg-[#FAF4E2] overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none cursor-pointer"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-[#1C4751] pr-4">{faq.question}</span>
              <span className={`text-[#E4B24C] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 shrink-0" />
              </span>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-4 text-[#5C6A6C] text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'services' | 'programs' | 'blog' | 'contact' | 'book'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnnounceVisible, setIsAnnounceVisible] = useState(true);
  
  // Services filtering & selection
  const [servicesSearch, setServicesSearch] = useState('');
  const [servicesCategory, setServicesCategory] = useState<string>('All');
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);

  // Booking states
  const [bookingService, setBookingService] = useState<string>('psychotherapy');
  const [bookingType, setBookingType] = useState<'free' | 'full'>('free');
  const [bookingFormat, setBookingFormat] = useState<'in-person' | 'online'>('in-person');
  const [bookingDate, setBookingDate] = useState('2026-06-25');
  const [bookingTime, setBookingTime] = useState('11:00 AM');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [recentBookings, setRecentBookings] = useState<CustomBooking[]>([]);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);

  // Blog states
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [blogBookmarks, setBlogBookmarks] = useState<string[]>([]);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogActiveCategory, setBlogActiveCategory] = useState<string>('All');
  
  // Assessment checklist state
  const [checklistScore, setChecklistScore] = useState<number | null>(null);
  const [checklistResponses, setChecklistResponses] = useState<Record<number, boolean>>({});

  // Crisis hotline toggle
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  // Load existing bookings & bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tania_bookings');
    if (saved) {
      try {
        setRecentBookings(JSON.parse(saved));
      } catch (e) {
        // Safe fallback
      }
    }
    const savedBookmarks = localStorage.getItem('tania_blog_bookmarks');
    if (savedBookmarks) {
      try {
        setBlogBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        // Safe fallback
      }
    }
  }, []);

  // Save bookings helper
  const saveBookings = (updated: CustomBooking[]) => {
    localStorage.setItem('tania_bookings', JSON.stringify(updated));
    setRecentBookings(updated);
  };

  // Bookmark toggler
  const toggleBookmark = (id: string) => {
    let updated;
    if (blogBookmarks.includes(id)) {
      updated = blogBookmarks.filter(item => item !== id);
    } else {
      updated = [...blogBookmarks, id];
    }
    setBlogBookmarks(updated);
    localStorage.setItem('tania_blog_bookmarks', JSON.stringify(updated));
  };

  // Submit appointment booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
      alert("Please specify your name, email, and mobile number to confirm booking.");
      return;
    }

    const newBooking: CustomBooking = {
      id: "TS-" + Math.floor(100000 + Math.random() * 900000),
      serviceId: bookingService,
      sessionType: bookingType,
      format: bookingFormat,
      date: bookingDate,
      timeSlot: bookingTime,
      clientName,
      clientEmail,
      clientPhone,
      message: clientMessage,
      timestamp: new Date().toLocaleString(),
      status: 'confirmed'
    };

    const updated = [newBooking, ...recentBookings];
    saveBookings(updated);

    // Show custom success screen or receipt
    setBookingSuccessMessage(newBooking.id);
    
    // Reset specific inputs
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientMessage('');
  };

  // Handle assessment score calculation
  const handleAssessmentSubmit = () => {
    const questionsCount = 6;
    const positiveResponses = Object.values(checklistResponses).filter(v => v === true).length;
    setChecklistScore(positiveResponses);
  };

  const resetAssessment = () => {
    setChecklistResponses({});
    setChecklistScore(null);
  };

  // Filter blog posts
  const filteredBlogPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = blogActiveCategory === 'All' || post.category === blogActiveCategory;
    const matchesSearch = post.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(blogSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getBlogCategories = () => {
    const categories = new Set(BLOG_POSTS.map(post => post.category));
    return ['All', ...Array.from(categories)];
  };

  // Quick navigation routing
  const navigateTo = (page: 'home' | 'about' | 'services' | 'programs' | 'blog' | 'contact' | 'book') => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookFromService = (serviceId: string) => {
    setBookingService(serviceId);
    setBookingSuccessMessage(null);
    navigateTo('book');
  };

  const handleCancelBooking = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this scheduled session?")) {
      const updated = recentBookings.filter(b => b.id !== id);
      saveBookings(updated);
    }
  };

  // List of therapeutic focus categories
  const filterCategories = [
    "All",
    "Mood & Emotion",
    "Addiction & Behavior",
    "Self & Relationships",
    "Specialized Care"
  ];

  // Filter existing service plans based on search inputs
  const filteredServices = SERVICES_LIST.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(servicesSearch.toLowerCase()) || 
                          srv.description.toLowerCase().includes(servicesSearch.toLowerCase()) ||
                          srv.id.toLowerCase().includes(servicesSearch.toLowerCase());
    const matchesCategory = servicesCategory === 'All' || srv.category === servicesCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="paper-grain min-h-screen flex flex-col font-sans-mulish text-[#2A3A3E] relative selection:bg-[#E4B24C] selection:text-[#1C4751]">
      
      {/* CRISIS FLOATING ACTION BAR FOR EMERGENCY */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {showCrisisAlert && (
          <div className="bg-[#FAF4E2] border-2 border-[#1C4751] p-5 rounded shadow-xl max-w-sm text-sm animate-fade-in text-[#2A3A3E]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-red-700 tracking-wide flex items-center gap-1.5 uppercase text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Crisis Helplines (Dhaka)
              </span>
              <button 
                onClick={() => setShowCrisisAlert(false)} 
                className="text-[#5C6A6C] hover:text-black cursor-pointer"
                id="crisis-dismiss-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mb-3 text-[13px] leading-relaxed">
              If you or someone you cherish is in immediate danger of self-harm, please reach out now. Private and immediate help is open.
            </p>
            <div className="space-y-2 border-t border-[#1C4751]/12 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1C4751]">Emergency Services:</span>
                <span className="font-bold bg-[#E4B24C]/20 px-2 py-0.5 rounded text-[#1C4751]">999</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="font-semibold text-[#1C4751] text-xs">Kaan Pete Roi (Suicide Prevention):</span>
                <span className="font-bold bg-[#E4B24C]/20 px-2 py-0.5 rounded text-[#1C4751] text-xs text-right whitespace-nowrap">
                  09612-119911
                </span>
              </div>
              <p className="text-[10px] text-[#5C6A6C] text-right italic font-medium">3:00 PM to 3:00 AM Daily</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowCrisisAlert(!showCrisisAlert)}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 text-xs uppercase tracking-widest transition duration-300 transform hover:-translate-y-1 cursor-pointer"
          id="crisis-toggle-btn"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Immediate Distress?
        </button>
      </div>

      {/* ANNOUNCEMENT BANNER */}
      {isAnnounceVisible && (
        <div id="announce" className="bg-[#1C4751] text-[#FAF4E2] text-xs sm:text-sm tracking-wide py-2 px-10 text-center relative z-50">
          <p className="font-medium inline">
            <strong className="text-[#E4B24C]">First session: 20 minutes free</strong> — in-person at <span className="font-semibold underline decoration-[#E4B24C]">MIND CARE, New Eskaton</span> &amp; online via Zoom / Google Meet.
          </p>
          <button 
            onClick={() => setIsAnnounceVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF4E2]/70 hover:text-[#FAF4E2] transition-colors p-1"
            aria-label="Dismiss Announcement"
            id="announce-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STICKY HEADER */}
      <header id="header" className="sticky top-0 z-40 bg-[#FAF4E2]/90 backdrop-blur-md border-b border-[#1C4751]/10 px-4 py-3 sm:py-4 transition duration-350">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <button 
            onClick={() => navigateTo('home')} 
            className="text-left cursor-pointer group focus:outline-none"
            id="logo-brand-btn"
          >
            <span className="font-serif-cormorant text-[clamp(1.125rem,3vw,1.5rem)] font-medium tracking-wide text-[#1C4751] group-hover:text-[#4F8E99] transition duration-300 block leading-tight">
              TANIA SUBHASHITA
            </span>
            <span className="text-[clamp(0.45rem,1.5vw,0.6rem)] tracking-[0.24em] font-bold text-[#5C6A6C] block uppercase mt-0.5">
              Psychologist · Mental Health Expert
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => navigateTo('home')} 
              className={`text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer relative py-1 ${currentPage === 'home' ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id="nav-home"
            >
              Home
            </button>
            <button 
              onClick={() => navigateTo('about')} 
              className={`text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer relative py-1 ${currentPage === 'about' ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id="nav-about"
            >
              About
            </button>
            <button 
              onClick={() => navigateTo('services')} 
              className={`text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer relative py-1 ${currentPage === 'services' ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id="nav-services"
            >
              Therapies
            </button>
            <button 
              onClick={() => navigateTo('programs')} 
              className={`text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer relative py-1 ${currentPage === 'programs' ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id="nav-programs"
            >
              Programs
            </button>
            <button 
              onClick={() => navigateTo('blog')} 
              className={`text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer relative py-1 ${currentPage === 'blog' ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id="nav-blog"
            >
              Blog
            </button>
            <button 
              onClick={() => navigateTo('contact')} 
              className={`text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer relative py-1 ${currentPage === 'contact' ? 'text-[#1C4751] font-bold border-b-2 border-[#E4B24C]' : 'text-[#5C6A6C] hover:text-[#1C4751]'}`}
              id="nav-contact"
            >
              Contact
            </button>
          </nav>

          {/* Booking Button (Primary CTA) */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => {
                setBookingSuccessMessage(null);
                navigateTo('book');
              }}
              className="bg-[#E4B24C] hover:bg-[#FAF4E2] hover:text-[#C9923A] border-2 border-[#E4B24C] text-[#3A2C0A] text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded transition duration-200 shadow-sm cursor-pointer"
              id="header-cta-book"
            >
              Book Now
            </button>
          </div>

          {/* Toggle Mobile Menu */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-[#1C4751] p-1 cursor-pointer focus:outline-none"
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#FAF4E2] border-b border-[#1C4751]/12 py-6 px-6 flex flex-col gap-4 animate-fade-in shadow-lg">
            <button 
              onClick={() => navigateTo('home')} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPage === 'home' ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id="mobile-nav-home"
            >
              Home
            </button>
            <button 
              onClick={() => navigateTo('about')} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPage === 'about' ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id="mobile-nav-about"
            >
              About Subhashita
            </button>
            <button 
              onClick={() => navigateTo('services')} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPage === 'services' ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id="mobile-nav-services"
            >
              26 Healing Therapies
            </button>
            <button 
              onClick={() => navigateTo('programs')} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPage === 'programs' ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id="mobile-nav-programs"
            >
              Coping Programs
            </button>
            <button 
              onClick={() => navigateTo('blog')} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPage === 'blog' ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id="mobile-nav-blog"
            >
              Read Articles
            </button>
            <button 
              onClick={() => navigateTo('contact')} 
              className={`text-sm text-left uppercase tracking-widest font-semibold py-2 ${currentPage === 'contact' ? 'text-[#1C4751] border-l-2 border-[#E4B24C] pl-2 font-bold' : 'text-[#5C6A6C]'}`}
              id="mobile-nav-contact"
            >
              Contact Office
            </button>
            <button
              onClick={() => {
                setBookingSuccessMessage(null);
                navigateTo('book');
              }}
              className="bg-[#1C4751] text-[#FAF4E2] text-xs font-bold uppercase tracking-widest py-3 px-5 rounded text-center block mt-3"
              id="mobile-cta-book"
            >
              Book an Appointment
            </button>
          </div>
        )}
      </header>

      {/* CORE PAGES RENDER ROUTER */}
      <main className="grow">
        
        {/* ====================================
            PAGE: HOME
            ==================================== */}
        {currentPage === 'home' && (
          <div>
            {/* HERO SEGMENT */}
            <section className="relative px-4 py-12 md:py-24 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                {/* Hero Words Column */}
                <Reveal delay={100} className="space-y-6 text-left">
                  <span className="text-[10px] tracking-[0.28em] font-semibold text-[#6E7C4E] uppercase block">
                    Psychotherapy · Counselling · Dhaka Location
                  </span>
                  <h1 className="font-serif-cormorant text-5xl sm:text-6xl md:text-7xl leading-tight text-[#1C4751] font-light">
                    Reconnect <br />
                    with your <br />
                    <span className="italic font-normal text-[#6E7C4E] font-serif-cormorant">true self.</span>
                  </h1>
                  <p className="text-[#5C6A6C] max-w-md text-base sm:text-lg leading-relaxed">
                    Compassionate, evidence-based professional support for depression, anxiety, trauma, and behavioral addictions. Rebuild meaning and reclaim your personal peace in a safe, completely confidential space.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setBookingSuccessMessage(null);
                        navigateTo('book');
                      }}
                      className="bg-[#1C4751] text-[#FAF4E2] hover:bg-[#FAF4E2] hover:text-[#1C4751] border-2 border-[#1C4751] text-xs font-bold uppercase tracking-widest py-4 px-8 rounded transition duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-md text-center"
                      id="hero-book-consult"
                    >
                      Book 20-Min Free Consult
                    </button>
                    <button 
                      onClick={() => navigateTo('services')}
                      className="text-[#1C4751] hover:bg-[#1C4751]/5 border-2 border-[#1C4751] text-xs font-bold uppercase tracking-widest py-4 px-8 rounded transition duration-200 text-center flex items-center justify-center gap-2 cursor-pointer"
                      id="hero-view-healing"
                    >
                      Our services <ArrowRight className="w-4 h-4 text-[#4F8E99]" />
                    </button>
                  </div>
                </Reveal>

                {/* Hero Creative Visual Graphic Design */}
                <Reveal delay={300} className="relative h-full flex items-center justify-center mt-12 md:mt-0">
                  <div className="relative w-full aspect-4/5 max-w-sm mx-auto rounded-xs bg-linear-to-br from-[#4F8E99]/20 to-[#8F9D63]/30 bg-[#EFE5C8] overflow-hidden flex items-center justify-center border border-[#1C4751]/5">
                    
                    {/* SVG aesthetic branch accent lines */}
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

                    <div className="relative w-[62%] max-w-82.5 aspect-4/5 ml-[-6%] bg-gradient-to-br from-[#cdd2b0] via-[#9fb0a6] to-[#7c93a0] rounded-[2px] shadow-[0_24px_50px_rgba(28,71,81,0.22)] -rotate-[1.5deg] flex items-center justify-center z-10">
                      <span className="font-sans-mulish text-[0.6rem] tracking-[0.34em] text-white/70 absolute inset-0 flex items-center justify-center select-none pointer-events-none">PORTRAIT</span>
                      {/* Tape Header Effect */}
                      <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 -rotate-[3deg] w-[88px] h-[26px] bg-[#E4B24C]/60 shadow-[0_2px_6px_rgba(0,0,0,0.08)]"></span>
                    </div>

                    <div className="absolute right-[7%] bottom-[15%] max-w-[330px] w-48 text-[#FBF6E6] z-20 font-serif-cormorant text-2xl drop-shadow-[0_2px_14px_rgba(28,71,81,0.45)] leading-snug">
                      “Helping you heal, grow, and thrive — every day.”
                      <span className="block mt-3.5 font-sans-mulish text-[0.62rem] tracking-[0.28em] opacity-85 uppercase">
                        — Tania Subhashita
                      </span>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* CLINICAL STATS & IMPACT ROW (Specifically as requested) */}
            <section className="bg-[#6E7C4E] text-[#FAF4E2] py-16 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-[10px] tracking-[0.3em] font-semibold text-[#E4B24C] uppercase block mb-2">
                    Evidence of Dedicated Clinical Practice
                  </span>
                  <h2 className="font-serif-cormorant text-3xl sm:text-4xl lg:text-5xl font-light text-[#FAF4E2]">
                    Measurable Guidance & Care
                  </h2>
                  <div className="w-16 h-0.5 bg-[#E4B24C] mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {STATISTICS.map((stat, i) => (
                    <Reveal delay={i * 100} key={i}>
                      <div  
                        className="bg-[#1C4751]/20 border border-[#FAF4E2]/12 p-6 rounded text-center hover:bg-[#1C4751]/30 transition duration-300 h-full"
                      >
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

            {/* WELCOME SUMMARY SEGMENT */}
            <section id="about" className="py-20 px-4 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                
                {/* Visual frame col */}
                <Reveal delay={100} className="md:col-span-5 relative">
                  <div className="bg-[#EFE5C8] border border-[#1C4751]/13 rounded-lg p-6 max-w-xs mx-auto">
                    <div className="bg-[#FAF4E2] border border-[#1C4751]/10 rounded aspect-[3/4] flex flex-col justify-between p-6 shadow-md relative overflow-hidden transform rotate-2">
                      <div className="w-12 h-1 bg-[#6E7C4E] rounded"></div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase block text-[#5C6A6C] mb-1">Clinic Credentials</span>
                        <p className="font-serif-cormorant text-xl text-[#1C4751] font-semibold">Tania Subhashita</p>
                        <p className="text-[11px] text-[#2A3A3E] mt-1 font-medium leading-relaxed">
                          MA in Psychology &amp; Clinical Social Work (University of Dhaka). Specializing in Cognitive and Compassion-focused therapies.
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Content words col */}
                <Reveal delay={300} className="md:col-span-7 space-y-6 text-left">
                  <div className="font-script-pinyon text-4xl text-[#E4B24C] select-none block leading-none">
                    Welcome
                  </div>
                  <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751] font-light leading-tight">
                    You do not have to carry your heavy mental burdens entirely on your own.
                  </h2>
                  <p className="text-sm text-[#5C6A6C] leading-relaxed">
                    Maybe it is a heavy drop in mood that won't lift, anxiety that holds you hostage at school or work, traumatic memories that replay, or a habit that's slowly taking control of your daily decisions. From the outside, you look successful. From the inside, running this routine is exhausting.
                  </p>
                  <p className="text-sm text-[#5C6A6C] leading-relaxed">
                    I am <strong className="text-[#1C4751] font-medium">Tania Subhashita</strong>, a licensed mental health professional based in Dhaka. I offer a warm, strictly confidential, and unvarnished safe space where you can let down your guard, systematically study what hurts, and introduce evidence-based steps to rebuild.
                  </p>
                  
                  <div className="pt-4 flex flex-wrap gap-4">
                    <button 
                      onClick={() => navigateTo('about')}
                      className="bg-[#1C4751] text-[#FAF4E2] hover:bg-[#4F8E99] font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded transition duration-200 cursor-pointer"
                      id="welcome-about-cta"
                    >
                      Read My Qualifications
                    </button>
                    <button 
                      onClick={() => navigateTo('services')}
                      className="border border-[#1C4751] text-[#1C4751] hover:bg-[#1C4751] hover:text-[#FAF4E2] font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded transition duration-200 cursor-pointer"
                      id="welcome-services-cta"
                    >
                      Explore Care Services
                    </button>
                  </div>
                </Reveal>

              </div>
            </section>

            {/* FEATURED SERVICES CATEGORIES & CARDS (Selected top from services list) */}
            <section className="bg-[#EFE5C8] py-20 px-4">
              <div className="max-w-6xl mx-auto">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
                  <div className="text-left space-y-2">
                    <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                      Services Catalog
                    </span>
                    <h2 className="font-serif-cormorant text-3xl sm:text-4xl lg:text-5xl text-[#1C4751] font-light">
                      Professional Specialized Therapies
                    </h2>
                  </div>
                  <button 
                    onClick={() => navigateTo('services')}
                    className="text-[#1C4751] text-xs font-bold uppercase tracking-widest hover:underline mt-4 md:mt-0 flex items-center gap-1 cursor-pointer"
                    id="featured-services-all"
                  >
                    Browse All Services <ArrowRight className="w-4 h-4 text-[#C9923A]" />
                  </button>
                </div>

                {/* Display 8 most prominent service blocks matching user's specific items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SERVICES_LIST.slice(0, 8).map((srv, i) => (
                    <Reveal delay={i * 50} key={srv.id}>
                      <div 
                        className="bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between text-left group h-full"
                      >
                        <div>
                          <div className="w-10 h-10 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] mb-5 group-hover:bg-[#E4B24C]/20 transition-all">
                            <DynamicServiceIcon iconName={srv.iconName} className="w-5 h-5 text-[#1C4751]" />
                          </div>
                          <h3 className="font-serif-cormorant text-xl font-semibold text-[#1C4751] mb-2 leading-tight group-hover:text-[#4F8E99] transition-colors">
                            {srv.name}
                          </h3>
                          <p className="text-xs text-[#5C6A6C] leading-relaxed mb-4 line-clamp-4">
                            {srv.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[#1C4751]/5 flex justify-between items-center mt-3">
                          <span className="text-[9px] font-bold tracking-widest text-[#6E7C4E] uppercase">
                            {srv.category}
                          </span>
                          <button 
                            onClick={() => {
                              setSelectedServiceDetail(srv);
                              navigateTo('services');
                            }}
                            className="text-xs text-[#1C4751] font-bold group-hover:text-[#C9923A] transition-colors inline-flex items-center cursor-pointer"
                            id={`service-more-${srv.id}`}
                          >
                            More <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <div className="text-center mt-12 bg-[#FAF4E2] border border-[#1C4751]/10 p-6 rounded-lg max-w-2xl mx-auto text-sm text-[#2A3A3E]">
                  💡 <strong>Struggling with a very specific challenge?</strong> Our practice has tailored plans for all 26 distinct areas including OCD, Drug/Device Addiction, Teen Exam Phobia, and Partner Grief.
                  <button 
                    onClick={() => navigateTo('services')}
                    className="text-[#4F8E99] font-bold underline hover:text-[#1C4751] ml-1.5 inline-block"
                    id="find-specific-care"
                  >
                    Find your specific care dialect
                  </button>
                </div>

              </div>
            </section>

            {/* INTERACTIVE SELF-ASSESSMENT STRUGGLE CHECKLIST METRICS */}
            <section className="py-20 px-4 max-w-4xl mx-auto">
              <div className="bg-[#FAF4E2] border-2 border-[#1C4751]/12 rounded-xl p-8 shadow-sm text-left">
                <span className="text-[10px] tracking-[0.25em] font-semibold text-[#6E7C4E] uppercase block mb-2">
                  Interactive Exercise
                </span>
                <h2 className="font-serif-cormorant text-2xl sm:text-3xl text-[#1C4751] font-light mb-4">
                  Weekly Anxiety &amp; Strain Self-Audit
                </h2>
                <p className="text-xs text-[#5C6A6C] leading-relaxed mb-6">
                  Check each statement that mirrors your mental state or habits over the last seven days. This gives an indication of whether stepping into professional therapy can support you.
                </p>

                {checklistScore === null ? (
                  <div className="space-y-4">
                    {[
                      { index: 1, text: "I find myself lying awake for long periods due to running loops of stressful thoughts or future worries." },
                      { index: 2, text: "I feel unusually defensive, angry, or prone to sudden irritability with friends or coworkers." },
                      { index: 3, text: "I run to devices, gambling, food, or other quick cravings to escape heavy real-life pressures." },
                      { index: 4, text: "Anxiety and fear have forced me to avoid specific social situations, speaking up, or attending exams." },
                      { index: 5, text: "I struggle to make simple choices, regularly trapped in a cycle of overthinking and mental paralysis." },
                      { index: 6, text: "I feel persistent exhaustion that sleep doesn't seem to cure, alongside a heaviness in my chest." }
                    ].map((q) => (
                      <label key={q.index} className="flex items-start gap-3 p-3 rounded hover:bg-[#1C4751]/5 transition border border-transparent hover:border-[#1C4751]/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checklistResponses[q.index]}
                          onChange={(e) => setChecklistResponses({
                            ...checklistResponses,
                            [q.index]: e.target.checked
                          })}
                          className="mt-1 w-4.5 h-4.5 accent-[#1C4751] cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm text-[#2A3A3E] leading-relaxed select-none">
                          {q.text}
                        </span>
                      </label>
                    ))}

                    <div className="pt-6 border-t border-[#1C4751]/11 flex justify-end">
                      <button
                        onClick={handleAssessmentSubmit}
                        className="bg-[#1C4751] text-[#FAF4E2] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-[#4F8E99]"
                        id="calculate-assessment-score"
                      >
                        Calculate My Strain Score
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-20 h-20 rounded-full bg-[#1C4751]/10 flex items-center justify-center font-serif-cormorant text-[#1C4751] text-3xl font-semibold mx-auto">
                      {checklistScore}/6
                    </div>
                    
                    <div className="max-w-lg mx-auto text-left">
                      {checklistScore <= 1 ? (
                        <p className="text-sm text-[#2A3A3E] leading-relaxed">
                          🌱 <strong>Subtle Tension:</strong> You are managing stress well, but there might be tiny pockets of unaddressed anxiety. Remember, taking counseling early acts as powerful preventative wellness.
                        </p>
                      ) : checklistScore <= 3 ? (
                        <p className="text-sm text-[#2A3A3E] leading-relaxed">
                          ⚠️ <strong>Moderate Burnout Strain:</strong> You are carrying a heavy workload and emotional burden. Some coping methods are starting to show friction. A single 1-on-1 counseling consultation could provide breakthrough tools to release this pressure.
                        </p>
                      ) : (
                        <p className="text-sm text-[#2A3A3E] leading-relaxed">
                          🚨 <strong>High Strain Levels:</strong> You are wading through deep exhaustion or severe anxiety that is actively impacting personal relationships or sleep architecture. Please know that you do not have to struggle in silence. Placing yourself in safe hands can change everything.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                      <button
                        onClick={resetAssessment}
                        className="text-xs text-[#5C6A6C] hover:text-[#1C4751] uppercase tracking-widest font-bold"
                        id="reset-assessment"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          setBookingSuccessMessage(null);
                          navigateTo('book');
                        }}
                        className="bg-[#C9923A] text-white text-xs font-bold uppercase tracking-widest py-2.5 px-5 rounded"
                        id="score-book-cta"
                      >
                        Book Introductory Free Talk
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* UNBURDENED METHODOLOGY STATEMENT */}
            <section className="bg-[#1C4751] text-[#FAF4E2] py-20 px-4 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <span className="font-script-pinyon text-5xl text-[#E4B24C] select-none">
                  At your own pace
                </span>
                <blockquote className="font-serif-cormorant text-2xl sm:text-3xl italic text-[#FAF4E2] leading-relaxed">
                  &ldquo;I look beyond the surface level symptoms to heal the actual biological and environment roots — so that the recovery stays secure. Every single dialogue is a safe sanctuary, free from judgment, and bound by absolute clinical confidentiality.&rdquo;
                </blockquote>
                <div className="text-xs font-bold tracking-widest uppercase text-[#FAF4E2]/70">
                  — Tania Subhashita, Clinical Psychologist
                </div>
              </div>
            </section>

            <GallerySection />
            <TestimonialsSection />
            <FAQSection />

            {/* RECENT USER BOOKINGS PERSISTENCE BOX (Only shown if appointments exist) */}
            {recentBookings.length > 0 && (
              <section className="py-12 px-4 max-w-4xl mx-auto text-left">
                <div className="bg-[#EFE5C8] border border-[#1C4751]/12 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4 text-[#1C4751]">
                    <Calendar className="w-5 h-5" />
                    <h3 className="font-serif-cormorant text-lg font-bold">Your Scheduled Consultations ({recentBookings.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {recentBookings.map((b) => {
                      const matchedSrv = SERVICES_LIST.find(s => s.id === b.serviceId);
                      return (
                        <div key={b.id} className="bg-[#FAF4E2] p-4 rounded border border-[#1C4751]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C4751]/15 text-[#1C4751]">
                                {b.id}
                              </span>
                              <span className="font-bold text-xs text-[#2A3A3E]">
                                {matchedSrv?.name || b.serviceId}
                              </span>
                            </div>
                            <p className="text-xs text-[#5C6A6C] mt-1.5 flex items-center gap-2">
                              <CalendarDays className="w-3.5 h-3.5 text-[#6E7C4E]" /> {b.date} at {b.timeSlot}
                              <span className="bullet">·</span>
                              <span className="capitalize text-[10px] font-semibold bg-[#6E7C4E]/10 text-[#6E7C4E] px-1.5 rounded">
                                {b.format}
                              </span>
                              <span className="capitalize text-[10px] font-semibold bg-[#E4B24C]/20 text-[#C9923A] px-1.5 rounded">
                                {b.sessionType === 'free' ? '20-min intro' : '50-min Full'}
                              </span>
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-[10px] text-red-600 hover:text-red-800 uppercase tracking-wider font-extrabold cursor-pointer py-1.5 px-3 rounded hover:bg-red-50 transition border border-transparent hover:border-red-100"
                            id={`cancel-${b.id}`}
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* CALL TO ACTION BOTANICAL BACKGROUND */}
            <section className="bg-gradient-to-br from-[#1C4751] to-[#2A3A3E] text-[#FAF4E2] py-24 px-4 text-center relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                <h2 className="font-serif-cormorant text-3xl sm:text-4xl lg:text-5xl font-light text-[#FAF4E2] leading-tight">
                  Wherever you represent yourself right now, you do not have to stay trapped there.
                </h2>
                <p className="text-xs sm:text-sm text-[#FAF4E2]/70 tracking-wide">
                  The subsequent chapter of your life can start this evening. Reclaim control with zero pressure.
                </p>
                <div className="pt-4">
                  <div className="font-script-pinyon text-4xl sm:text-5xl text-[#E4B24C] block mx-auto py-2 mb-6 drop-shadow-sm">
                    Begin your emotional journey
                  </div>
                  <button
                    onClick={() => {
                      setBookingSuccessMessage(null);
                      setBookingService('psychotherapy');
                      navigateTo('book');
                    }}
                    className="bg-[#E4B24C] text-[#1C4751] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest py-4 px-8 rounded transition duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-lg inline-block"
                    id="cta-bottom"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ====================================
            PAGE: ABOUT
            ==================================== */}
        {currentPage === 'about' && (
          <div className="py-16 px-4 max-w-6xl mx-auto text-left">
            
            {/* Split top intro */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-16">
              <Reveal delay={100} className="md:col-span-5">
                <div className="relative w-full max-w-sm mx-auto rounded-xs bg-gradient-to-br from-[#4F8E99]/20 to-[#8F9D63]/30 bg-[#EFE5C8] overflow-hidden flex flex-col border border-[#1C4751]/5 shadow-md">
                  
                  {/* Floral SVG Background */}
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
                  
                  {/* Portrait Placeholder block */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none py-10">
                    <div className="relative w-[65%] max-w-[280px] aspect-[4/5] bg-gradient-to-br from-[#cdd2b0] via-[#9fb0a6] to-[#7c93a0] rounded-[2px] shadow-[0_24px_50px_rgba(28,71,81,0.22)] -rotate-[2deg] flex items-center justify-center">
                      <span className="font-sans-mulish text-[0.6rem] tracking-[0.34em] text-white/70 absolute inset-0 flex items-center justify-center select-none">PORTRAIT</span>
                      <span className="absolute -top-3.25 left-1/2 -translate-x-1/2 -rotate-3 w-22 h-6.5 bg-[#E4B24C]/60 shadow-[0_2px_6px_rgba(0,0,0,0.08)]"></span>
                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="relative z-20 bg-[#FAF4E2]/90 backdrop-blur-sm border-t border-[#1C4751]/10 p-6 self-start w-full mt-auto">
                    <p className="font-serif-cormorant text-xl text-[#1C4751] font-semibold">Tania Subhashita</p>
                    <p className="text-[10px] tracking-widest text-[#5C6A6C] uppercase font-bold mt-1">Lead mental health expert</p>
                    <div className="mt-4 pt-4 border-t border-[#1C4751]/10 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#5C6A6C]">Location:</span>
                        <strong className="text-[#1C4751]">Dhaka &amp; Online</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#5C6A6C]">Experience:</span>
                        <strong className="text-[#1C4751]">10+ Years clinical focus</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={300} className="md:col-span-7 space-y-6">
                <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                  Professional Bio
                </span>
                <h1 className="font-serif-cormorant text-4xl sm:text-5xl text-[#1C4751] font-light leading-tight">
                  Meet Tania Subhashita
                </h1>
                <p className="text-sm text-[#5C6A6C] leading-relaxed">
                  I hold my Honours and Master&apos;s degrees in Psychology from the <strong className="text-[#1C4751]">University of Dhaka</strong>, followed by a Professional Master&apos;s in Clinical Social Work from the same esteemed institution. This dual academic background empowers me to bridge psychological insights and structural social dynamics.
                </p>
                <p className="text-sm text-[#5C6A6C] leading-relaxed">
                  Over my years of private chamber practice, I have witnessed how traditional methods can sometimes feel rigid or sterile. Patients need both evidence-based scientific procedures and robust, non-judgmental human comfort.
                </p>
                <p className="text-sm text-[#2A3A3E] leading-relaxed italic border-l-4 border-[#E4B24C] pl-4 bg-[#EFE5C8]/40 py-2 rounded-r">
                  &ldquo;A mental medical chart only tracks symptoms. Therapeutic alliance heals the actual human underneath those symptoms.&rdquo;
                </p>
              </Reveal>
            </div>

            {/* Academic Credentials & Framework Badge Grid */}
            <Reveal delay={100}>
              <div className="bg-[#EFE5C8] p-8 rounded-lg mb-16 text-left">
                <h3 className="font-serif-cormorant text-2xl text-[#1C4751] font-semibold mb-6">Verified Training &amp; Accreditations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                    <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                      <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> CBT (Cognitive Therapy)
                    </div>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed">
                      Licensed tools for breaking repetitive thinking traps, automatic panic triggers, school exam stress, and trauma.
                    </p>
                  </div>

                <div className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                  <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> DBT (Dialectical Behavior)
                  </div>
                  <p className="text-xs text-[#5C6A6C] leading-relaxed">
                    Designed for emotional dysregulation, self-harm impulses, suicidal thoughts, and bipolar mood stabilization.
                  </p>
                </div>

                <div className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                  <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> EMDR Therapy protocols
                  </div>
                  <p className="text-xs text-[#5C6A6C] leading-relaxed">
                    Specialized neuroscience-based desensitization to gently process underlying trauma (PTSD) and abuse memories.
                  </p>
                </div>

                <div className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                  <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> Addiction Interventions
                  </div>
                  <p className="text-xs text-[#5C6A6C] leading-relaxed">
                    Advanced clinical training for complex chemical drug/alcohol abuse recovery, and digital behavioral dependency loop-reset.
                  </p>
                </div>

                <div className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                  <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> Mindfulness Meditation
                  </div>
                  <p className="text-xs text-[#5C6A6C] leading-relaxed">
                    Focus on emotional anchor mapping, parasympathetic somatic breathing exercises, and emotional grounding.
                  </p>
                </div>

                <div className="bg-[#FAF4E2] p-5 rounded border border-[#1C4751]/10">
                  <div className="font-bold text-[#1C4751] text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Check className="w-4.5 h-4.5 text-[#6E7C4E]" /> Family &amp; Couple Systems
                  </div>
                  <p className="text-xs text-[#5C6A6C] leading-relaxed">
                    Systemic counseling strategies focused on repairing deep relational scars, parental harmony, and sibling discord.
                  </p>
                </div>

              </div>
            </div>
            </Reveal>

            {/* Methodology workflow */}
            <Reveal delay={200}>
              <div className="space-y-8 max-w-3xl mx-auto">
                <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block text-center">
                  My Staged Methodology
                </span>
                <h2 className="font-serif-cormorant text-3xl font-light text-[#1C4751] text-center">
                  Three Pillars of Enduring Healing
                </h2>

              <div className="space-y-6 mt-8">
                <div className="p-6 bg-[#FAF4E2] border border-[#1C4751]/10 rounded flex gap-4">
                  <div className="text-3xl font-serif-cormorant font-bold text-[#E4B24C]">01/</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C4751] uppercase tracking-wider mb-1">Empathetic Grounding</h4>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed">
                      We start by establishing a safe container. Your trauma, chemical battles, shame, or grief is handled with absolute confidentiality and infinite human patience.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-[#FAF4E2] border border-[#1C4751]/10 rounded flex gap-4">
                  <div className="text-3xl font-serif-cormorant font-bold text-[#E4B24C]">02/</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C4751] uppercase tracking-wider mb-1">Tailored Re-Patterning</h4>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed">
                      Instead of standard cookie-cutter advice, we build a personalized recovery schema. We map your specific cognitive distortions and utilize clinical worksheets to dismantle them.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-[#FAF4E2] border border-[#1C4751]/10 rounded flex gap-4">
                  <div className="text-3xl font-serif-cormorant font-bold text-[#E4B24C]">03/</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C4751] uppercase tracking-wider mb-1">Autonomous Sovereignty</h4>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed">
                      The goal of therapy is for you to eventually become your own therapist. We secure relapse protocols so that you feel fully confident self-regulating through all future storms.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </Reveal>

          </div>
        )}

        {/* ====================================
            PAGE: SERVICES / THERAPIES LISTING
            ==================================== */}
        {currentPage === 'services' && (
          <div className="py-16 px-4 max-w-6xl mx-auto text-left">
            
            <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
              <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                Practice Focus Areas
              </span>
              <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">
                All Care Services
              </h1>
              <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
                Filter or search across my clinical competencies. Click on any block to expand full details, treatment plans, and instant appointment booking options.
              </p>
            </Reveal>

            {/* EXPANDED SYSTEMIC FOCUS DRAWER PILL / PREVIEW IF SELECTED */}
            {selectedServiceDetail && (
              <Reveal className="bg-[#1C4751] text-[#FAF4E2] p-8 rounded-xl mb-12 shadow-md text-left relative overflow-hidden"
                id="selected-service-drawer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none">
                  <DynamicServiceIcon iconName={selectedServiceDetail.iconName} className="w-full h-full text-white" />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] tracking-widest text-[#E4B24C] uppercase font-extrabold px-2 py-0.5 rounded bg-[#E4B24C]/15">
                      {selectedServiceDetail.category}
                    </span>
                    <h2 className="font-serif-cormorant text-3xl sm:text-4xl text-[#FAF4E2] font-semibold mt-2">
                      {selectedServiceDetail.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedServiceDetail(null)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition text-[#FAF4E2]"
                    id="close-selected-service"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm sm:text-base text-[#FAF4E2]/90 leading-relaxed max-w-3xl mb-6">
                  {selectedServiceDetail.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#2H3B44]/30 p-5 rounded border border-white/5 mb-6 text-xs text-[#FAF4E2]/85">
                  <div>
                    <h4 className="font-bold text-[#E4B24C] uppercase tracking-wider mb-2">What we target in therapy sessions:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E4B24C] shrink-0 mt-0.5" /> Initial diagnostics &amp; cognitive distortion mapping.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E4B24C] shrink-0 mt-0.5" /> Somatic regulation protocols &amp; distress containment plans.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#E4B24C] shrink-0 mt-0.5" /> Direct Homework sheets to build practical physical habits.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#E4B24C] uppercase tracking-wider mb-2">Clinic Delivery:</h4>
                    <p className="mb-2">Available both in-person at <strong className="text-[#E4B24C]">MIND CARE (New Eskaton, Dhaka)</strong> or via highly secure zoom tele-consultation.</p>
                    <p>Includes a personalized recovery template and ongoing email support between sessions.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleBookFromService(selectedServiceDetail.id)}
                    className="bg-[#E4B24C] text-[#3A2C0A] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded transition duration-200 cursor-pointer"
                    id={`book-specific-btn-${selectedServiceDetail.id}`}
                  >
                    Select &amp; Book an Appointment
                  </button>
                  <button
                    onClick={() => setSelectedServiceDetail(null)}
                    className="text-xs text-[#FAF4E2]/80 hover:text-white border border-white/20 hover:border-white px-5 py-3.5 rounded transition cursor-pointer"
                    id="close-drawer-bottom"
                  >
                    Keep Browsing Other Areas
                  </button>
                </div>
              </Reveal>
            )}

            {/* Search and Category Filtering Row */}
            <Reveal delay={200} className="bg-[#EFE5C8]/80 p-5 rounded-lg border border-[#1C4751]/10 mb-12 flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search text input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#5C6A6C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Query (e.g. anxiety, ocd, anger)..."
                  value={servicesSearch}
                  onChange={(e) => setServicesSearch(e.target.value)}
                  className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 pl-10 pr-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]"
                  id="service-search-input"
                />
                {servicesSearch && (
                  <button 
                    onClick={() => setServicesSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setServicesCategory(cat)}
                    className={`text-xs px-4 py-2 rounded transition duration-150 cursor-pointer ${servicesCategory === cat ? 'bg-[#1C4751] text-[#FAF4E2] font-semibold' : 'bg-[#FAF4E2] text-[#5C6A6C] border border-[#1C4751]/10 hover:bg-[#EFE5C8]'}`}
                    id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Reset filter options */}
              {(servicesSearch || servicesCategory !== 'All') && (
                <button
                  onClick={() => {
                    setServicesSearch('');
                    setServicesCategory('All');
                  }}
                  className="text-xs text-[#1C4751] underline font-semibold hover:text-[#4F8E99]"
                  id="reset-all-filters"
                >
                  Clear search
                </button>
              )}
            </Reveal>

            {/* Actual Services Grid Layout (26 total items) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((srv, i) => (
                <Reveal delay={i * 50} key={srv.id} className="h-full">
                  <div 
                    className="bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left group hover:border-[#1C4751]/50 h-full"
                  >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751]">
                        <DynamicServiceIcon iconName={srv.iconName} className="w-5 h-5 text-[#1C4751]" />
                      </div>
                      <span className="text-[8px] tracking-widest font-extrabold text-[#5C6A6C] uppercase bg-[#EFE5C8] px-2 py-0.5 rounded">
                        {srv.category}
                      </span>
                    </div>

                    <h3 className="font-serif-cormorant text-xl font-bold text-[#1C4751] mb-2 group-hover:text-[#4F8E99] transition-colors leading-tight">
                      {srv.name}
                    </h3>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed mb-4 line-clamp-3">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1C4751]/5 flex justify-between items-center mt-3">
                    <button
                      onClick={() => setSelectedServiceDetail(srv)}
                      className="text-xs font-semibold text-[#1C4751] hover:underline cursor-pointer"
                      id={`read-more-${srv.id}`}
                    >
                      Read treatment schema
                    </button>
                    <button 
                      onClick={() => handleBookFromService(srv.id)}
                      className="bg-[#EFE5C8] hover:bg-[#E4B24C] hover:text-[#3A2C0A] text-[#1C4751] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded transition-colors duration-150 cursor-pointer"
                      id={`book-srv-${srv.id}`}
                    >
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
        )}

        {/* ====================================
            PAGE: PROGRAMS LISTING (Staged Care)
            ==================================== */}
        {currentPage === 'programs' && (
          <div className="py-16 px-4 max-w-5xl mx-auto text-left">
            
            <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
              <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                Structured Care Frameworks
              </span>
              <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">
                Comprehensive Healing Programs
              </h1>
              <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
                For deeper struggles, consistent staged guidance achieves far greater results than standalone drop-in sessions. These specific programs are structured to walk you from raw distress to total personal resilience.
              </p>
            </Reveal>

            {/* Programs Stack */}
            <div className="space-y-10">
              {PROGRAMS_LIST.map((prog, i) => (
                <Reveal delay={i * 100} key={prog.id} className="h-full">
                  <div className="bg-[#FAF4E2] border-2 border-[#1C4751]/12 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 hover:border-[#1C4751]/40 transition duration-300">
                  {/* Left program details */}
                  <div className="md:w-3/5 space-y-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#E4B24C] uppercase bg-[#C9923A]/10 px-2.5 py-1 rounded">
                      {prog.duration}
                    </span>
                    <h2 className="font-serif-cormorant text-2xl sm:text-3xl font-semibold text-[#1C4751] leading-tight">
                      {prog.title}
                    </h2>
                    <p className="text-xs font-bold text-[#6E7C4E] uppercase tracking-widest italic">
                      {prog.subtitle}
                    </p>
                    <p className="text-xs text-[#5C6A6C] leading-relaxed">
                      {prog.description}
                    </p>
                    
                    <div className="pt-2">
                      <p className="text-xs font-bold text-[#1C4751] uppercase mb-1">Suitable For:</p>
                      <p className="text-xs text-[#2A3A3E] leading-relaxed font-semibold">
                        {prog.suitability}
                      </p>
                    </div>
                  </div>

                  {/* Right curriculum mapping */}
                  <div className="md:w-2/5 md:border-l border-[#1C4751]/10 md:pl-8 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C4751] mb-3">
                        Staged Curricular Milestones:
                      </h4>
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
                        // Match nearest appropriate service type
                        let targetSrv = 'psychotherapy';
                        if (prog.id === 'anxiety-panic') targetSrv = 'anxiety-disorder';
                        if (prog.id === 'addiction-reset') targetSrv = 'drug-addiction';
                        if (prog.id === 'student-peak-mind') targetSrv = 'exam-phobia';
                        
                        setBookingService(targetSrv);
                        setBookingType('full');
                        setClientMessage(`I am registering interest for the: ${prog.title}`);
                        setBookingSuccessMessage(null);
                        navigateTo('book');
                      }}
                      className="bg-[#1C4751] hover:bg-[#4F8E99] text-[#FAF4E2] text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-lg text-center cursor-pointer transition duration-200 mt-6 md:mt-0"
                      id={`reg-prog-${prog.id}`}
                    >
                      Register &amp; Book Initial Evaluation
                    </button>
                  </div>
                </div>
                </Reveal>
              ))}
            </div>

          </div>
        )}

        {/* ====================================
            PAGE: BLOG / ARTICLES
            ==================================== */}
        {currentPage === 'blog' && (
          <div className="py-16 px-4 max-w-5xl mx-auto text-left">
            
            <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
              <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                Educating the Mind
              </span>
              <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">
                Clinical Mental Wellness Articles
              </h1>
              <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
                A selection of short, unhurried, evidence-based articles detailing cognitive restructures, neural anxiety hacks, and behavioral addiction escape pathways.
              </p>
            </Reveal>

            {selectedBlogPost ? (
              /* DETAILED BLOG VIEW MODE */
              <Reveal className="bg-[#FAF4E2] border border-[#1C4751]/12 p-8 rounded-xl space-y-6 shadow-sm max-w-3xl mx-auto">
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  className="text-xs text-[#1C4751] font-bold hover:underline mb-4 flex items-center gap-1.5 focus:outline-none"
                  id="back-to-all-blogs"
                >
                  ← Back to all articles
                </button>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[9px] font-bold tracking-widest text-white bg-[#1C4751] px-2 py-0.5 rounded uppercase">
                      {selectedBlogPost.category}
                    </span>
                    <span className="text-xs text-[#5C6A6C]">{selectedBlogPost.date}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-[#5C6A6C] font-semibold">{selectedBlogPost.readTime}</span>
                  </div>

                  <h1 className="font-serif-cormorant text-3xl sm:text-4xl text-[#1C4751] font-semibold tracking-normal leading-tight">
                    {selectedBlogPost.title}
                  </h1>
                </div>

                <div className="prose prose-sm prose-[#1C4751] text-sm text-[#2A3A3E] leading-relaxed max-w-none space-y-4 pt-6 border-t border-[#1C4751]/10 whitespace-pre-wrap">
                  {selectedBlogPost.content}
                </div>

                <div className="mt-8 pt-8 border-t border-[#1C4751]/10 flex justify-between items-center bg-[#EFE5C8]/30 p-4 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-[#1C4751]">Struggling with issues explained here?</p>
                    <p className="text-xs text-[#5C6A6C]">Get guided support tailored for your specific biological response.</p>
                  </div>
                  <button
                    onClick={() => {
                      let targetId = 'psychotherapy';
                      if (selectedBlogPost.id === 'cbt-steps') targetId = 'psychotherapy';
                      if (selectedBlogPost.id === 'overcome-procrastination') targetId = 'procrastination';
                      if (selectedBlogPost.id === 'trauma-healing') targetId = 'trauma';
                      
                      setBookingService(targetId);
                      setBookingSuccessMessage(null);
                      navigateTo('book');
                    }}
                    className="bg-[#1C4751] hover:bg-[#4F8E99] text-[#FAF4E2] text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 rounded transition"
                    id="book-from-blog"
                  >
                    Discuss in Session
                  </button>
                </div>
              </Reveal>
            ) : (
              /* BLOG POSTS REPERTORY GRID */
              <div className="space-y-8">
                {/* Search & Filter Bar */}
                <Reveal delay={100} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#FAF4E2] p-4 rounded-lg border border-[#1C4751]/12 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {getBlogCategories().map(cat => (
                      <button
                        key={cat}
                        onClick={() => setBlogActiveCategory(cat)}
                        className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded transition ${blogActiveCategory === cat ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#1C4751] hover:bg-[#1C4751]/10'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5C6A6C]" />
                    <input 
                      type="text" 
                      placeholder="Search articles..."
                      value={blogSearchQuery}
                      onChange={(e) => setBlogSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#1C4751]/20 rounded text-xs text-[#1C4751] focus:outline-none focus:border-[#4F8E99] font-medium"
                    />
                  </div>
                </Reveal>

                {filteredBlogPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredBlogPosts.map((post, i) => (
                      <Reveal delay={i * 100} key={post.id} className="h-full">
                        <div 
                          className="bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg flex flex-col justify-between hover:border-[#1C4751]/50 transition shadow-sm text-left group h-full"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] tracking-widest font-extrabold text-[#6E7C4E] uppercase bg-[#6E7C4E]/10 px-2 py-0.5 rounded">
                                {post.category}
                              </span>
                              <button
                                onClick={() => toggleBookmark(post.id)}
                                className="text-[#5C6A6C] hover:text-[#E4B24C] cursor-pointer"
                                aria-label="Bookmark article"
                                id={`bookmark-${post.id}`}
                              >
                                <Bookmark className={`w-4 h-4 ${blogBookmarks.includes(post.id) ? 'fill-[#E4B24C] text-[#C9923A]' : 'text-gray-400'}`} />
                              </button>
                            </div>

                            <h3 className="font-serif-cormorant text-xl font-bold text-[#1C4751] group-hover:text-[#4F8E99] leading-tight mb-2 transition">
                              {post.title}
                            </h3>
                            <p className="text-xs text-[#5C6A6C] leading-relaxed mb-4 line-clamp-4">
                              {post.summary}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-[#1C4751]/5 flex justify-between items-center text-xs mt-3">
                            <span className="text-[#5C6A6C] font-semibold text-[11px]">{post.readTime}</span>
                            <button
                              onClick={() => setSelectedBlogPost(post)}
                              className="text-[#1C4751] font-bold hover:underline cursor-pointer flex items-center"
                              id={`read-article-${post.id}`}
                            >
                              Read full article →
                            </button>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#FAF4E2] border border-[#1C4751]/10 rounded-lg">
                    <p className="text-[#5C6A6C] font-medium">No articles found matching your criteria.</p>
                  </div>
                )}

              </div>
            )}

            {/* Extra bookmark summary indicator if bookmarks exist */}
            {!selectedBlogPost && blogBookmarks.length > 0 && (
              <div className="mt-12 bg-[#EFE5C8] p-4 rounded-lg flex items-center justify-between">
                <span className="text-xs text-[#1C4751] font-bold">
                  🔖 You have bookmarked {blogBookmarks.length} article(s) for quiet secondary reading.
                </span>
                <button
                  onClick={() => {
                    setBlogBookmarks([]);
                    localStorage.removeItem('tania_blog_bookmarks');
                  }}
                  className="text-[10px] uppercase font-bold text-red-700 hover:underline"
                  id="clear-bookmarks"
                >
                  Clear Bookmarks
                </button>
              </div>
            )}

          </div>
        )}

        {/* ====================================
            PAGE: CONTACT
            ==================================== */}
        {currentPage === 'contact' && (
          <div className="py-16 px-4 max-w-6xl mx-auto text-left">
            
            <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
              <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                Get In Touch
              </span>
              <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">
                Secure confidential channels
              </h1>
              <p className="text-sm text-[#5C6A6C] max-w-2xl leading-relaxed">
                Reaching out and admitting distress is the absolute hardest step. Let&apos;s talk about scheduling a consultation in our private chamber.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              
              <Reveal delay={200} className="md:col-span-5 space-y-6 bg-[#FAF4E2] border border-[#1C4751]/12 p-6 rounded-lg shadow-sm">
                
                <div className="space-y-4">
                  <h3 className="font-serif-cormorant text-2xl text-[#1C4751]">Contact Information</h3>
                  <div className="w-12 h-0.5 bg-[#E4B24C]"></div>
                </div>

                <div className="space-y-6">
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">WhatsApp / Call Reception</span>
                      <strong className="text-sm text-[#1C4751]">+880 1580 700 700</strong>
                      <p className="text-[11px] text-[#5C6A6C]">Available from 10:00 AM to 8:00 PM</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">Email Coordinates</span>
                      <strong className="text-sm text-[#1C4751]">tr.subhashita@gmail.com</strong>
                      <p className="text-[11px] text-[#5C6A6C]">Private client email inbox</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">Chamber Address</span>
                      <strong className="text-sm text-[#1C4751]">MIND CARE Clinical Office</strong>
                      <p className="text-xs text-[#5C6A6C] leading-normal mt-1">
                        Aktar Mansion, House 30, Flat 1/A, Ismail Lane, New Eskaton, Dhaka 1000
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">Telehealth Support</span>
                      <strong className="text-sm text-[#1C4751]">Zoom &amp; Google Meet</strong>
                      <p className="text-xs text-[#5C6A6C] mt-1">Convenient, encrypted video links for online clients.</p>
                    </div>
                  </div>

                </div>

              </Reveal>

              <Reveal delay={300} className="md:col-span-7 bg-[#EFE5C8] border border-[#1C4751]/12 p-8 rounded-lg shadow-sm">
                
                <h3 className="font-serif-cormorant text-2xl text-[#1C4751] mb-2">Inquire Directly</h3>
                <p className="text-xs text-[#5C6A6C] mb-6">
                  Have quick queries before scheduling? Fill in this safe introductory checklist. Everything you type goes into Tania&apos;s secure record.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault(); 
                  alert("Thank you. Your safe query has been queued successfully. Tania Subhashita will follow up personally within 24 hours.");
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                  setClientMessage('');
                }} className="space-y-4">
                  
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ehsanul Haq"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]"
                      id="contact-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Secure Email</label>
                      <input
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]"
                        id="contact-email"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Mobile Contact Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="+880 1712 XXXXXX"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]"
                        id="contact-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Briefly outline your challenge (Optional)</label>
                    <textarea
                      rows={4}
                      placeholder="A sentence or two is perfectly plenty."
                      value={clientMessage}
                      onChange={(e) => setClientMessage(e.target.value)}
                      className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]"
                      id="contact-msg"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1C4751] border-2 border-[#1C4751] text-[#FAF4E2] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded transition duration-200 cursor-pointer shadow-md"
                    id="contact-submit-btn"
                  >
                    Send Private Query
                  </button>

                </form>

              </Reveal>

            </div>

          </div>
        )}

        {/* ====================================
            PAGE: BOOK NOW / APPOINTMENT WRITER
            ==================================== */}
        {currentPage === 'book' && (
          <div className="py-16 px-4 max-w-4xl mx-auto text-left">
            
            <Reveal delay={100} className="mb-12 text-center space-y-4">
              <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">
                Appointment Desk
              </span>
              <h1 className="font-serif-cormorant text-4xl sm:text-5xl text-[#1C4751] font-light">
                Schedule a Consultation
              </h1>
              <p className="text-sm text-[#5C6A6C] max-w-xl mx-auto leading-relaxed">
                Your first introductory consultation includes <strong className="text-[#1C4751]">20 free minutes</strong> to walk you through options with absolutely zero obligation.
              </p>
            </Reveal>

            {bookingSuccessMessage ? (
              /* BOOKING CONFIRMATION SCREEN */
              <Reveal delay={200}
                className="bg-[#EFE5C8] border-2 border-[#1C4751] p-8 rounded-xl space-y-6 shadow-md text-center max-w-2xl mx-auto"
                id="booking-confirmation-panel"
              >
                <div className="w-16 h-16 rounded-full bg-[#6E7C4E]/20 text-[#6E7C4E] flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[9px] tracking-[0.25em] font-bold text-[#6E7C4E] uppercase block">
                    Session Secured Successfully
                  </span>
                  <h2 className="font-serif-cormorant text-3xl font-bold text-[#1C4751]">
                    Booking Saved!
                  </h2>
                  <p className="text-xs text-[#5C6A6C] max-w-md mx-auto">
                    Your appointment request has been synced under local records. Tania Subhashita is tracking this slot closely.
                  </p>
                </div>

                {/* Reciept details */}
                <div className="bg-[#FAF4E2] border border-[#1C4751]/12 p-5 rounded-lg text-left text-xs max-w-md mx-auto space-y-3">
                  <div className="flex justify-between pb-2 border-b border-[#1C4751]/10">
                    <span className="text-[#5C6A6C]">Confirmation Token:</span>
                    <strong className="text-[#1C4751] text-sm tracking-widest">{bookingSuccessMessage}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6A6C]">Primary Care Area:</span>
                    <strong className="text-[#1C4751]">
                      {SERVICES_LIST.find(s => s.id === bookingService)?.name || bookingService}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6A6C]">Scheduled Date:</span>
                    <strong className="text-[#1C4751]">{bookingDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6A6C]">Time Slot Selected:</span>
                    <strong className="text-[#1C4751]">{bookingTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6A6C]">Session Format:</span>
                    <strong className="text-[#1C4751] capitalize">{bookingFormat}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6A6C]">Duration Tier:</span>
                    <strong className="text-[#C9923A] capitalize">{bookingType === 'free' ? 'Introductory 20 Mins (Free)' : 'Standard 50 Mins Clinical Session'}</strong>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setBookingSuccessMessage(null);
                    }}
                    className="bg-[#1C4751] hover:bg-[#4F8E99] text-[#FAF4E2] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded"
                    id="book-another-session"
                  >
                    Schedule Another Date
                  </button>
                  <button
                    onClick={() => navigateTo('home')}
                    className="border border-[#1C4751]/20 text-[#1C4751] text-xs font-bold uppercase tracking-widest px-6 py-3 rounded"
                    id="back-home-success"
                  >
                    Return Home
                  </button>
                </div>
              </Reveal>
            ) : (
              /* DETAILED BOOKING SCHEDULER FORM */
              <Reveal delay={200}>
                <form onSubmit={handleBookingSubmit} className="bg-[#FAF4E2] border border-[#1C4751]/12 p-8 rounded-xl shadow-sm space-y-6">
                  
                  {/* Step indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#1C4751]/10">
                    
                    {/* Service selection dropdown mapping all 26 services */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">
                        Select Therapy Care Area (26 Options Available)
                      </label>
                      <select
                        value={bookingService}
                        onChange={(e) => setBookingService(e.target.value)}
                        className="w-full bg-[#EFE5C8] border border-[#1C4751]/15 px-3 py-2.5 rounded text-xs select-none focus:outline-none font-semibold text-[#1C4751]"
                        id="booking-service-select"
                      >
                        {SERVICES_LIST.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} (Care Category: {srv.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Format tier choice radio blocks */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">
                        Delivery Format
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBookingFormat('in-person')}
                          className={`text-xs py-2 px-3 rounded uppercase font-semibold transition cursor-pointer text-center ${bookingFormat === 'in-person' ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#5C6A6C]'}`}
                          id="format-in-person"
                        >
                          Chamber In-Person
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingFormat('online')}
                          className={`text-xs py-2 px-3 rounded uppercase font-semibold transition cursor-pointer text-center ${bookingFormat === 'online' ? 'bg-[#1C4751] text-[#FAF4E2]' : 'bg-[#EFE5C8] text-[#5C6A6C]'}`}
                          id="format-online"
                        >
                          Encrypted Zoom
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Staged timing & session length tier selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    {/* Select session duration tier */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">
                        Session Duration Tier
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-2 bg-[#EFE5C8]/40 hover:bg-[#EFE5C8] rounded border border-[#1C4751]/5 cursor-pointer">
                          <input
                            type="radio"
                            name="session_type"
                            checked={bookingType === 'free'}
                            onChange={() => setBookingType('free')}
                            className="accent-[#1C4751]"
                          />
                          <span className="text-[11px] font-semibold text-[#1C4751]">20-Min Intro (Free)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 bg-[#EFE5C8]/40 hover:bg-[#EFE5C8] rounded border border-[#1C4751]/5 cursor-pointer">
                        <input
                          type="radio"
                          name="session_type"
                          checked={bookingType === 'full'}
                          onChange={() => setBookingType('full')}
                          className="accent-[#1C4751]"
                        />
                        <span className="text-[11px] font-semibold text-[#1C4751]">50-Min Practice Plan</span>
                      </label>
                    </div>
                  </div>

                  {/* Date picker */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#EFE5C8]/70 border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#1C4751] font-semibold focus:outline-none"
                      min="2026-06-19"
                      id="booking-date-picker"
                    />
                  </div>

                  {/* Pre-defined convenient timeslots */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1.5">
                      Available Private Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-[#EFE5C8]/70 border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#1C4751] font-semibold focus:outline-none"
                    >
                      <option value="10:00 AM">10:00 AM - 11:00 AM (Morning Dialect)</option>
                      <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                      <option value="02:00 PM">02:00 PM - 03:00 PM (Early Afternoon)</option>
                      <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                      <option value="06:00 PM">06:00 PM - 07:00 PM (Evening Chamber)</option>
                      <option value="07:00 PM">07:00 PM - 08:00 PM</option>
                    </select>
                  </div>

                </div>

                {/* Client Personal Contact coordinates */}
                <div className="bg-[#EFE5C8]/50 p-6 rounded-lg space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C4751] border-b border-[#1C4751]/10 pb-2">
                    Private Contact Coordinates
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tanzim Rahman"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                        id="booking-name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Secure Email address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                        id="booking-email"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">WhatsApp Cell Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="+880 1XXXXXXXXX"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                        id="booking-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Brief summary of what brings you in (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Having severe panic bursts during exams, or struggling with sleep scheduling problems."
                      value={clientMessage}
                      onChange={(e) => setClientMessage(e.target.value)}
                      className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-3 py-2 rounded text-xs text-[#2A3A3E] focus:outline-none"
                      id="booking-msg"
                    ></textarea>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C4751]/12">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#5C6A6C]">
                    <ShieldAlert className="w-4 h-4 text-[#6E7C4E] mt-0.5 shrink-0" />
                    <span>Your records and information reside strictly in local container variables. Real client privacy is fully respected.</span>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1C4751] border-2 border-[#1C4751] text-[#FAF4E2] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest py-3.5 px-8 rounded transition duration-200 cursor-pointer w-full sm:w-auto text-center"
                    id="booking-submit-confirm"
                  >
                    Lock My Session Slot
                  </button>
                </div>

              </form>
              </Reveal>
            )}

          </div>
        )}

      </main>

      {/* DETAILED PROFESSIONAL SECURE FOOTER */}
      <footer className="bg-[#1C4751] text-[#FAF4E2]/80 border-t border-[#FAF4E2]/10 py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-[#FAF4E2]/10">
            <div>
              <span className="font-serif-cormorant text-2xl tracking-wide text-[#FAF4E2] block leading-tight">
                TANIA SUBHASHITA
              </span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-[#E4B24C] block uppercase mt-1">
                Psychologist · Mental Health Expert
              </span>
            </div>

            <div className="flex flex-col items-start md:items-end gap-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
                <button onClick={() => navigateTo('home')} className="hover:text-[#E4B24C] cursor-pointer" id="foot-home">Home</button>
                <button onClick={() => navigateTo('about')} className="hover:text-[#E4B24C] cursor-pointer" id="foot-about">About</button>
                <button onClick={() => navigateTo('services')} className="hover:text-[#E4B24C] cursor-pointer" id="foot-services">Therapies</button>
                <button onClick={() => navigateTo('programs')} className="hover:text-[#E4B24C] cursor-pointer" id="foot-programs">Programs</button>
                <button onClick={() => navigateTo('blog')} className="hover:text-[#E4B24C] cursor-pointer" id="foot-blog">Blog</button>
                <button onClick={() => navigateTo('contact')} className="hover:text-[#E4B24C] cursor-pointer" id="foot-contact">Contact</button>
              </div>
              
              <div className="flex items-center gap-5 text-[#FAF4E2]/60">
                <a href="#" className="hover:text-[#E4B24C] transition-colors transform hover:scale-110" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-[#E4B24C] transition-colors transform hover:scale-110" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-[#E4B24C] transition-colors transform hover:scale-110" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-6 text-xs text-[#FAF4E2]/70 leading-relaxed max-w-none">
            <div className="space-y-2 md:max-w-md text-left">
              <p>
                © 2026 Tania Subhashita · Clinical Psychologist &amp; Counselor, Dhaka. All rights reserved.
              </p>
              <p className="text-[11px] text-[#FAF4E2]/50 italic">
                Sessions are completely non-judgmental, structured securely, and governed under strict psychiatric confidentiality standards.
              </p>
            </div>
            
            <div className="space-y-1.5 md:text-right text-left">
              <p className="font-semibold text-red-400 uppercase tracking-widest text-[10px]">🚨 In Acute Medical Crisis?</p>
              <p className="text-[11px]">
                Call the Government Hotline at <strong className="text-white">999</strong>, or dial Suicide Prevention Kaan Pete Roi at <span className="text-white">09612-119911</span> (3:00 PM to 3:00 AM).
              </p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
