import Starfield from "./components/Starfield";
import CustomCursor from "./components/CustomCursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StoryScroll from "./components/StoryScroll";
import WhatIsVyom from "./components/WhatIsVyom";
import CreateMission from "./components/CreateMission";
import DemoMission from "./components/DemoMission";
import Capabilities from "./components/Capabilities";
import Motto from "./components/Motto";
import FinalCTA from "./components/FinalCTA";

export default function App() {
  return (
    <div className="relative min-h-screen font-body text-white antialiased">
      <Starfield />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <StoryScroll />
        <WhatIsVyom />
        <CreateMission />
        <DemoMission />
        <Capabilities />
        <Motto />
        <FinalCTA />
      </main>
    </div>
  );
}
