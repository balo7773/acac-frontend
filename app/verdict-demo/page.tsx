"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type Phase = "idle" | "cycling" | "pass" | "fail";

export default function VerdictDemoPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentLight, setCurrentLight] = useState<"red" | "green">("green");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const tickAudio = useRef<HTMLAudioElement | null>(null);
  const passAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    tickAudio.current = new Audio("/sounds/tick.mp3");
    passAudio.current = new Audio("/sounds/pass.mp3");
    failAudio.current = new Audio("/sounds/fail.mp3");
    if (tickAudio.current) tickAudio.current.volume = 0.5;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Trigger Confetti when the PASS state is reached
  useEffect(() => {
    if (phase === "pass") {
      // Fire multiple bursts for a massive celebration
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [phase]);

  const startAnimation = (outcome: "pass" | "fail") => {
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

        setPhase(outcome);
        setCurrentLight(outcome === "pass" ? "green" : "red");

        if (outcome === "pass" && passAudio.current) {
          passAudio.current.play().catch(() => {});
        } else if (outcome === "fail" && failAudio.current) {
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

  return (
    <div className="relative min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-8">
      
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-2xl font-bold text-[#082552]">Your Submission</h2>
        <p className="text-gray-500">This is your portal content. When the verdict animation plays, a dark transparent overlay will drop down over this exact screen.</p>
        <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          Essay Uploaded
        </div>
      </div>

      {(phase !== "idle") && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-500">
          
          {phase === "cycling" && (
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
          )}

          {phase === "pass" && (
            <div className="flex flex-col items-center justify-center space-y-6 animate-[fade-in_1s_ease-out] z-10">
              <div className="w-48 h-48 rounded-full bg-green-500 shadow-[0_0_150px_rgba(34,197,94,0.8)]" />
              <h2 className="text-5xl md:text-7xl font-black text-green-400 tracking-wider mt-8">
                YOU ADVANCED
              </h2>
              <p className="text-green-100 text-lg max-w-md text-center">
                Your essay has earned you a spot in the live defense stage.
              </p>
              <button
                onClick={() => setPhase("idle")}
                className="mt-8 px-8 py-3 bg-white text-[#082552] font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Reset Demo
              </button>
            </div>
          )}

          {phase === "fail" && (
            <div className="flex flex-col items-center justify-center space-y-6 animate-[shake_0.5s_ease-in-out] z-10">
              <div className="w-48 h-48 rounded-full bg-red-600 shadow-[0_0_150px_rgba(220,38,38,0.9)]" />
              <h2 className="text-6xl md:text-8xl font-black text-red-500 tracking-widest mt-8">
                ELIMINATED
              </h2>
              <p className="text-red-200 text-lg max-w-md text-center">
                Your journey in the ACAC 2026 competition ends here.
              </p>
              <button
                onClick={() => setPhase("idle")}
                className="mt-8 px-8 py-3 bg-white text-[#082552] font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Reset Demo
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "idle" && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 relative z-10">
          <button
            onClick={() => startAnimation("pass")}
            className="px-8 py-4 bg-[#22C55E] text-white font-bold rounded-full hover:bg-green-600 transition-colors shadow-lg"
          >
            Simulate PASS (Green)
          </button>
          <button
            onClick={() => startAnimation("fail")}
            className="px-8 py-4 bg-[#DC2626] text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            Simulate FAIL (Red)
          </button>
        </div>
      )}

    </div>
  );
}
