import type { Metadata } from "next";
import { CAMPUS_LEADS, UNIT_LEADS } from "../../content/team";
import TeamOrbit from "./TeamOrbit";

export const metadata: Metadata = {
  title: "The Team “2026” — ACAC",
  description: "The executives behind the AFIT Cowrywise Ambassadors Competition.",
};

export default function TeamPage() {
  const unitRows = [
    UNIT_LEADS.slice(0, 3),
    UNIT_LEADS.slice(3, 7),
    UNIT_LEADS.slice(7, 11),
  ];

  return (
    <main className="min-h-screen bg-[#F0F2F5] py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#082552] mb-4">
            The Team “2026”
          </h1>
        </div>

        {/* Section 1: Campus Leads */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[#082552] text-center mb-6">
            Campus Leads
          </h2>
          <TeamOrbit rows={[CAMPUS_LEADS]} />
        </section>

        {/* Section 2: Unit Leads */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#082552] text-center mb-6">
            Unit Leads
          </h2>
          <TeamOrbit rows={unitRows} />
        </section>
      </div>
    </main>
  );
}
