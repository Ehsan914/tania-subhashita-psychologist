import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';

export default function FAQSection() {
  const { faqs } = useSiteData();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqs.length === 0) return null;

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
        {faqs.map((faq, index) => (
          <div key={faq.id} className="border border-[#1C4751]/10 rounded bg-[#FAF4E2] overflow-hidden">
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
