import HeroSection from "./components/HeroSection";
import ThreeStages from "./components/ThreeStages";
import GlowLayer from "./components/GlowLayer";
import QuoteCards from "./components/QuoteCards";

export default function Home() {
  return (
    <main>
      <div className="relative overflow-hidden">
        <GlowLayer />
        <HeroSection />
      </div>
      <div className="pb-16 pt-6">
        <QuoteCards />
      </div>
      <ThreeStages />
    </main>
  );
}
