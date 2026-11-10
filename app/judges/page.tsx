import type { Metadata } from "next";
import JudgesGrid from "./JudgesGrid";

export const metadata: Metadata = {
  title: "The Judges — ACAC",
  description: "The anonymous judging panel for the AFIT Cowrywise Ambassadors Competition.",
};

export default function JudgesPage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#082552] mb-4">
            The Judges
          </h1>
          
        </div>

        <JudgesGrid />
        
      </div>
    </main>
  );
}
