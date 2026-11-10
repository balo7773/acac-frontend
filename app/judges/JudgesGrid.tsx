"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const JUDGES = [
  {
    id: 1,
    anonymousName: "Judge 1",
    role: "External Judge",
    realName: "Oluwaseyi Orngu",
    realImage: "/judges/real-judge-1.jpeg",
    linkedin: "https://www.linkedin.com/in/oluwaseyi-xist/",
  },
  {
    id: 2,
    anonymousName: "Judge 2",
    role: "Internal Judge",
    realName: "Mubashir Najmudeen", 
    realImage: "/judges/real-judge-2.jpg", 
    linkedin: "https://www.linkedin.com/in/mubashir-najmudeen/",
  },
  {
    id: 3,
    anonymousName: "Judge 3",
    role: "Internal Judge",
    realName: "Sammuel Oke",
    realImage: "/judges/real-judge-3.jpg",
    linkedin: "#",
  },
  {
    id: 4,
    anonymousName: "Judge 4",
    role: "Internal Judge",
    realName: "Balogun Abdulmalik",
    realImage: "/judges/real-judge-4.jpg",
    linkedin: "https://www.linkedin.com/in/balo7773",
  },
];

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
  </svg>
);

export default function JudgesGrid() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPhase = async () => {
      try {
        const res = await fetch("/api/auth/public-phase");
        if (res.ok) {
          const data = await res.json();
          const currentPhase = data.current_phase || "";
          
          if (currentPhase === "stage_2_live" || currentPhase === "completed") {
            setIsRevealed(true);
          }
        }
      } catch (err) {
        console.error("Failed to check phase", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkPhase();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading panel...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {JUDGES.map((judge) => {
        const displayName = isRevealed ? judge.realName : judge.anonymousName;
        const displayImage = isRevealed ? judge.realImage : `/judges/judge-${judge.id}.jpg`;

        return (
          <div key={judge.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
            <div className="relative aspect-square w-full bg-[#082552]">
              <Image
                src={displayImage}
                alt={displayName}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                quality={90}
                className="object-cover"
              />
            </div>
            
            <div className="p-5 text-center flex-1 flex flex-col justify-center items-center">
              <h3 className="text-xl font-bold text-[#082552] mb-1">{displayName}</h3>
              <p className="text-xs font-bold text-[#0067f5] uppercase tracking-wider mb-3">
                {judge.role}
              </p>
              
              {isRevealed && judge.linkedin && (
                <a
                  href={judge.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9CA3AF] hover:text-[#0067f5] transition-colors mt-2"
                >
                  <LinkedInIcon />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
