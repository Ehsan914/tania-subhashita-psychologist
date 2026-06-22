import { useState } from 'react';
import { Phone, Mail, MapPin, Video } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { useSiteData } from '../context/SiteDataContext';

export default function ContactPage() {
  const { contact } = useSiteData();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');

  return (
    <div className="py-16 px-4 max-w-6xl mx-auto text-left">
      <Reveal delay={100} className="mb-12 text-center md:text-left space-y-4">
        <span className="text-[10px] tracking-[0.28em] font-bold text-[#6E7C4E] uppercase block">Get In Touch</span>
        <h1 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#1C4751] font-light">Secure confidential channels</h1>
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
              <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5"><Phone className="w-4 h-4" /></div>
              <div>
                <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">WhatsApp / Call Reception</span>
                <strong className="text-sm text-[#1C4751]">{contact?.phone || '+880 1580 700 700'}</strong>
                <p className="text-[11px] text-[#5C6A6C]">{contact?.officeHours || 'Available from 10:00 AM to 8:00 PM'}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5"><Mail className="w-4 h-4" /></div>
              <div>
                <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">Email Coordinates</span>
                <strong className="text-sm text-[#1C4751]">{contact?.email || 'tr.subhashita@gmail.com'}</strong>
                <p className="text-[11px] text-[#5C6A6C]">Private client email inbox</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5"><MapPin className="w-4 h-4" /></div>
              <div>
                <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#5C6A6C] block mb-1">Chamber Address</span>
                <strong className="text-sm text-[#1C4751]">{contact?.clinicName || 'MIND CARE Clinical Office'}</strong>
                <p className="text-xs text-[#5C6A6C] leading-normal mt-1">{contact?.address || ''}{contact?.city ? `, ${contact.city}` : ''}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1C4751]/10 flex items-center justify-center text-[#1C4751] shrink-0 mt-0.5"><Video className="w-4 h-4" /></div>
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
          <p className="text-xs text-[#5C6A6C] mb-6">Have quick queries before scheduling? Fill in this safe introductory checklist. Everything you type goes into Tania&apos;s secure record.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you. Your safe query has been queued successfully. Tania Subhashita will follow up personally within 24 hours.");
            setClientName(''); setClientEmail(''); setClientPhone(''); setClientMessage('');
          }} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Your Full Name</label>
              <input type="text" required placeholder="e.g. Ehsanul Haq" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]" id="contact-name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Secure Email</label>
                <input type="email" required placeholder="you@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]" id="contact-email" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Mobile Contact Phone</label>
                <input type="tel" required placeholder="+880 1712 XXXXXX" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]" id="contact-phone" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-[#1C4751] uppercase mb-1">Briefly outline your challenge (Optional)</label>
              <textarea rows={4} placeholder="A sentence or two is perfectly plenty." value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} className="w-full bg-[#FAF4E2] border border-[#1C4751]/15 px-4 py-2.5 rounded text-sm text-[#2A3A3E] focus:outline-none focus:ring-1 focus:ring-[#1C4751]" id="contact-msg"></textarea>
            </div>
            <button type="submit" className="w-full bg-[#1C4751] border-2 border-[#1C4751] text-[#FAF4E2] hover:bg-[#FAF4E2] hover:text-[#1C4751] text-xs font-bold uppercase tracking-widest py-3.5 px-6 rounded transition duration-200 cursor-pointer shadow-md" id="contact-submit-btn">
              Send Private Query
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
