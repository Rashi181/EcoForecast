import React, { useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import InputsPage from "./Pages/Inputs/InputsPage";

// Marketing components
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Services from "./components/Services.jsx";
import Offer from "./components/Offer.jsx";
import Contact from "./components/Contact.jsx";
import LoginModal from "./components/LoginModal.jsx";

/* ---------------- LANDING PAGE ---------------- */

function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();

  const services = useMemo(
    () => [
      {
        title: "Comprehensive Digital Campaigns",
        desc: "Creating holistic digital strategies that convert attention into growth.",
        tone: "lavender",
      },
      {
        title: "SEO Mastery",
        desc: "Boosting your site on search engines with practical, measurable wins.",
        tone: "mint",
      },
      {
        title: "Targeted Advertisement",
        desc: "Maximizing ROI through precise targeting and clear creative direction.",
        tone: "cream",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen">
      <Navbar onOpenLogin={() => setLoginOpen(true)} />

      <main>
        <Hero />
        <Marquee text="Creative / Content Strategy / Branding /" />
        <Services items={services} />
        <Offer />
        <Contact />

        {/* Button to EcoForecast Inputs */}
        <div className="text-center py-12">
          <button
            onClick={() => navigate("/inputs")}
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            Go to EcoForecast Tool
          </button>
        </div>
      </main>

      <footer className="border-t border-black/10 bg-[#f4f1ea]">
        <div className="mx-auto max-w-6xl px-6 py-8 flex justify-between">
          <div className="text-sm text-black/70">
            © {new Date().getFullYear()} TRADEMARK®
          </div>
          <div className="text-sm text-black/70">
            Built with React + Tailwind
          </div>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

/* ---------------- OUTPUTS ---------------- */

function Outputs() {
  const navigate = useNavigate();

  return (
    <div className="p-10">
      <h2>Outputs Page</h2>
      <button onClick={() => navigate("/")}>Back Home</button>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inputs" element={<InputsPage />} />
        <Route path="/outputs" element={<Outputs />} />
      </Routes>
    </BrowserRouter>
  );
}
