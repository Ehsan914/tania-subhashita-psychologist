import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function CrisisAlert() {
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  return (
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
  );
}
