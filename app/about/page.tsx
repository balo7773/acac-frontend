import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About the Competition — ACAC",
  description: "Students propose economic policy. Judges push back. The best policy wins.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] py-16 px-5">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#082552]">
            About the Competition
          </h1>
          <p className="text-xl md:text-2xl text-[#0067f5] font-medium leading-snug">
            Students propose economic policy. Judges push back. The best policy wins.
          </p>
        </div>

        {/* Section 1: The Mission */}
        <section className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#082552] mb-4">The Mission</h2>
          <p className="text-[#4B5563] leading-relaxed md:text-lg">
            The AFIT × Cowrywise Ambassadors Competition (ACAC) 2026 bridges academic theory and real-world financial strategy. Participants step into the role of policy-makers — proposing and defending real economic decisions, not just discussing them in the abstract. The goal isn't to reward the loudest opinion; it's to reward the thinking that survives scrutiny.
          </p>
        </section>

        {/* Section 2: Mechanics & Prize */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#082552] mb-5">The Format</h3>
            <p className="text-sm text-[#4B5563] mb-4 font-medium">The competition runs in three stages:</p>
            <ul className="space-y-4 text-sm text-[#4B5563]">
              <li className="leading-relaxed">
                <strong className="text-[#082552] block mb-1">Essay</strong>
                Participants take on the role of Special Adviser to the President on economy and finance, proposing a policy and defending its real-world consequences.
              </li>
              <li className="leading-relaxed">
                <strong className="text-[#082552] block mb-1">Defense</strong>
                A live, timed response to a question generated from their own essay.
              </li>
              <li className="leading-relaxed">
                <strong className="text-[#082552] block mb-1">Final</strong>
                Top finalists present and field questions from a judging panel in a live session.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#082552] mb-5">The Prize & AI Scoring</h3>
            <p className="text-sm text-[#4B5563] leading-relaxed mb-5">
              A cash prize goes to the overall winner, with the amount communicated during registration. 
            </p>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              Essays are reviewed with AI assistance (DeepSeek and Gemma models) to support consistency across a large pool of submissions — but every score is reviewed, verified, and finalized by human judges. <strong className="text-[#082552]">AI informs; it doesn't decide.</strong>
            </p>
          </div>
        </section>

        {/* Section 3: The Team Behind the Platform */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#082552] text-center mb-8">The Team Behind the Platform</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Balogun Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
              <div className="relative aspect-square w-full bg-[#082552]">
                {/* Use next/image to prevent pixelation */}
                <Image 
                  src="/host.jpg" 
                  alt="Balogun Abdulmalik" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={95}
                  className="object-cover object-top" 
                />
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col text-center">
                <h3 className="text-xl font-bold text-[#082552]">Balogun Abdulmalik</h3>
                <p className="text-[#0067f5] font-bold text-xs uppercase tracking-wider mb-4">Host & Lead Developer</p>
                <p className="text-[#4B5563] text-sm leading-relaxed">
                  This platform was architected, designed, developed, and funded by Balogun Abdulmalik to bring the ACAC vision to life — from the AI-augmented scoring backend to the judging interface.
                </p>
              </div>
            </div>

            {/* Mubashir Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
              <div className="relative aspect-square w-full bg-[#082552]">
                {/* Use next/image to prevent pixelation */}
                <Image 
                  src="/cohost.jpg" 
                  alt="Mubashir Najmudeen" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={95}
                  className="object-cover object-top" 
                />
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col text-center">
                <h3 className="text-xl font-bold text-[#082552]">Mubashir Najmudeen</h3>
                <p className="text-[#0067f5] font-bold text-xs uppercase tracking-wider mb-4">Co-Host</p>
                <p className="text-[#4B5563] text-sm leading-relaxed">
                  Mubashir Najmudeen helped organize the competition's outreach and supported it throughout, playing a key role in bringing ACAC to life.
                </p>
              </div>
            </div>

          </div>
        </section>

        </div>
    </main>
  );
}
