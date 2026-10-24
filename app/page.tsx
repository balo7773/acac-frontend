import SiteHeader from "./components/SiteHeader";
import HeroSection from "./components/HeroSection";
import BubbleLayer from "./components/BubbleLayer";
import ThreeStages from "./components/ThreeStages";
import SiteFooter from "./components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <BubbleLayer />
        <ThreeStages />
      </main>
      <SiteFooter />
    </>
  );
}
