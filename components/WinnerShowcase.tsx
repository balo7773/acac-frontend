'use client';
import { useEffect, useState } from 'react';

export default function WinnerShowcase() {
  const [winner, setWinner] = useState<any>(null);
  const [showEssay, setShowEssay] = useState(false);

  useEffect(() => {
    fetch('/api/public/winner')
      .then(res => res.json())
      .then(data => {
        if (data && data.full_name) setWinner(data);
      })
      .catch(console.error);
  }, []);

  if (!winner) return null;

  return (
    <>
      <section className="py-20 px-5 bg-gradient-to-b from-[#082552] to-[#0047b3] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-yellow-400 mb-4">Meet the Champion</h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{winner.full_name}</h1>
          
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {winner.linkedin_url && (
              <a 
                href={winner.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full font-medium transition-colors"
              >
                View LinkedIn Profile
              </a>
            )}
            <button 
              onClick={() => setShowEssay(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-bold transition-colors shadow-lg"
            >
              Read Winning Essay
            </button>
          </div>
        </div>
      </section>

      {/* Essay Modal */}
      {showEssay && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-[#082552]">Winning Essay</h3>
                <p className="text-sm text-gray-500">{winner.full_name}</p>
              </div>
              <button onClick={() => setShowEssay(false)} className="text-gray-400 hover:text-gray-700 text-3xl font-bold">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
              {winner.essay_text}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
