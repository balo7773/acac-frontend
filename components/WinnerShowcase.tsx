'use client';
import { useEffect, useState } from 'react';

export default function WinnerShowcase() {
  const [winner, setWinner] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showEssay, setShowEssay] = useState(false);

  useEffect(() => {
    fetch('/api/public/winner')
      .then(res => res.json())
      .then(data => {
        if (data && data.full_name) {
          setWinner(data);
          // Automatically pop up the modal after a tiny delay for smooth animation
          setTimeout(() => setIsVisible(true), 500);
        }
      })
      .catch(console.error);
  }, []);

  if (!winner || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#082552]/90 backdrop-blur-md">
      {/* Main Winner Card */}
      {!showEssay ? (
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-500">
          {/* Gold Header */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-10 text-center relative">
            <button 
              onClick={() => setIsVisible(false)} 
              className="absolute top-4 right-4 text-white/60 hover:text-white font-bold text-3xl transition-colors"
            >
              &times;
            </button>
            <div className="text-7xl mb-4 drop-shadow-md">🏆</div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-yellow-900 mb-1">Meet the Champion</h2>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-sm">{winner.full_name}</h1>
          </div>

          {/* Body */}
          <div className="p-8 text-center bg-[#F7F9FC]">
            <p className="text-[#082552] font-medium mb-6">
              The competition has officially ended. 
              Congratulations to our winner for outstanding performance in the AFIT × Cowrywise Ambassadors Competition 2026!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {winner.linkedin_url && (
                <a 
                  href={winner.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-gray-200 text-[#082552] px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  View LinkedIn Profile
                </a>
              )}
              <button 
                onClick={() => setShowEssay(true)}
                className="bg-[#0067f5] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-md"
              >
                Read Winning Essay
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Essay Modal (Layered on top) */
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-[#F7F9FC] rounded-t-2xl">
            <div>
              <h3 className="text-xl font-bold text-[#082552]">Winning Essay</h3>
              <p className="text-sm text-gray-500">By {winner.full_name}</p>
            </div>
            <button onClick={() => setShowEssay(false)} className="text-gray-400 hover:text-[#082552] text-3xl font-bold transition-colors">
              &times;
            </button>
          </div>
          <div className="p-8 overflow-y-auto whitespace-pre-wrap text-gray-700 leading-relaxed text-sm md:text-base">
            {winner.essay_text}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-center rounded-b-2xl">
            <button onClick={() => { setShowEssay(false); setIsVisible(false); }} className="text-sm font-bold text-[#0067f5] hover:underline">
              Close and Continue to Site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
