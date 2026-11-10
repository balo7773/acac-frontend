"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { VerdictCard } from "./PortalStates";

type Verdict = { status: string; reason?: string };

export default function VerdictReveal({ verdict, pno }: { verdict: Verdict | null, pno: number }) {
  const [hasRevealed, setHasRevealed] = useState(false);
  const [phase, setPhase] = useState<"idle" | "cycling" | "done">("idle");
  const [currentLight, setCurrentLight] = useState<"red" | "green">("green");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tickAudio = useRef<HTMLAudioElement | null>(null);
  const passAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

  // Determine if this candidate passed based on their backend status
  // TODO: Adjust "advanced" to match your exact backend string (e.g. "passed", "finalist", "advanced")
  const isPass = verdict?.status === "qualified";

  useEffect(() => {
    tickAudio.current = new Audio("/sounds/tick.mp3");
    passAudio.current = new Audio("/sounds/pass.mp3");
    failAudio.current = new Audio("/sounds/fail.mp3");
    if (tickAudio.current) tickAudio.current.volume = 0.5;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Trigger Confetti if they passed
  useEffect(() => {
    if (phase === "done" && isPass) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [phase, isPass]);

  const startReveal = () => {
    setPhase("cycling");
    setCurrentLight("green");
    let tick = 0;
    const totalTicks = 8;
    const speed = 800;

    if (timerRef.current) clearInterval(timerRef.current);

    if (tickAudio.current) {
      tickAudio.current.currentTime = 0;
      tickAudio.current.play().catch(() => {});
    }

    timerRef.current = setInterval(() => {
      tick++;
      if (tick >= totalTicks) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (tickAudio.current) {
          tickAudio.current.pause();
          tickAudio.current.currentTime = 0;
        }
        
        setPhase("done");
        setCurrentLight(isPass ? "green" : "red");

        if (isPass && passAudio.current) {
          passAudio.current.play().catch(() => {});
        } else if (!isPass && failAudio.current) {
          failAudio.current.play().catch(() => {});
        }
        return;
      }

      if (tickAudio.current) {
        tickAudio.current.currentTime = 0;
        tickAudio.current.play().catch(() => {});
      }
      setCurrentLight((prev) => (prev === "green" ? "red" : "green"));
    }, speed);
  };

  if (phase === "done") {
    return (
      <div className="animate-[fade-in_1s_ease-out]">
        <VerdictCard verdict={verdict} pno={pno} />
      </div>
    );
  }

  return (
    <>
      {/* The Trigger Card */}
      <div className={`max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-lg text-center transition-all duration-500 ${phase === 'cycling' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <h2 className="text-2xl font-bold text-[#082552] mb-2">Results are in!</h2>
        <p className="text-[#6B7280] mb-6">The judges have finalized their scores for the essay stage.</p>
        <button
          onClick={() => { setHasRevealed(true); startReveal(); }}
          className="px-8 py-3.5 bg-[#0067f5] text-white font-bold rounded-full hover:bg-[#0055cc] transition-colors shadow-md text-lg"
        >
          Reveal Your Result
        </button>
      </div>

      {/* The Animation Overlay */}
      {phase === "cycling" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-500">
          <div className="flex flex-col items-center justify-center space-y-12">
            <div
              className={`w-48 h-48 rounded-full transition-all duration-[700ms] ease-in-out shadow-[0_0_100px_rgba(0,0,0,0.8)] ${
                currentLight === "green" 
                  ? "bg-green-500 shadow-green-500/50 scale-[1.3]" 
                  : "bg-red-600 shadow-red-600/50 scale-[0.7]"
              }`}
            />
            <p className="text-white text-xl font-mono tracking-widest animate-pulse">
              REVEALING...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
