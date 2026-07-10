import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendar, FaTicket, FaWrench, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { motion } from "framer-motion";

const photos = [
  "/photos/12.jpg",
  "/photos/13.jpg",
  "/photos/14.jpg",
  "/photos/gosheni_Choir_15.jpg",
  "/photos/gosheni_Choir_16.jpg",
  "/photos/ichthus_01.jpg",
  "/photos/ichthus_02.jpg",
  "/photos/ichthus_03.jpg",
  "/photos/ichthus_04.jpg",
  "/photos/ichthus_05.jpg",
  "/photos/ichthus_06.jpg",
  "/photos/ichthus_07.jpg",
  "/photos/ichthus_08.jpg",
  "/photos/ichthus_09.jpg",
  "/photos/ichthus_10.jpg",
  "/photos/ichthus_11.jpg",
];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [carouselOffset, setCarouselOffset] = useState(135);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCarouselOffset(135);
      } else if (window.innerWidth >= 640) {
        setCarouselOffset(105);
      } else {
        setCarouselOffset(80);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  // Glitch dynamic text setup
  const words = ["Sound", "Events", "IB Group"];
  const [wordIdx, setWordIdx] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % words.length);
      }, 150);
      setTimeout(() => {
        setIsGlitching(false);
      }, 450);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">

      {/* ── Background Image ── */}
      <div className="absolute inset-0">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/14.jpg"
          alt="Event Background"
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,50%,6%)]/70 via-[hsl(220,55%,10%)]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,50%,4%)]/75 via-transparent to-[hsl(220,50%,4%)]/20" />
        {/* Gold shimmer accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
      </div>

      {/* ── Floating ambient orbs ── */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full px-6 md:px-16 lg:px-[80px] pt-24 pb-12 md:pt-32 md:pb-16 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mt-0 lg:-mt-10 xl:-mt-16">
          
          {/* Left Column (Text & CTAs) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-3xl">
            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.05] tracking-tight mb-4 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Creating{" "}
              <span className="relative inline-block">
                <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                  Unforgettable
                </span>
                {/* underline accent */}
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M0 3 Q50 6 100 3 Q150 0 200 3" stroke="hsl(200,95%,50%)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                </svg>
              </span>
              <br />
              Experiences
            </h1>

            {/* Headline Subtitle with Dynamic Glitching Text */}
            <div 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-6 leading-normal animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-white/70 font-light">with</span>{" "}
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">Kundwa</span>{" "}
              <span 
                className={`text-secondary inline-block ${isGlitching ? "glitch-active" : ""}`}
                data-text={words[wordIdx]}
              >
                {words[wordIdx]}
              </span>
            </div>

            {/* CTA buttons */}
            <div
              className="flex flex-wrap gap-4 animate-fade-in mt-6 md:mt-10"
              style={{ animationDelay: "0.3s" }}
            >
              {/* Primary gold CTA */}
              <Link to="/services">
                <button className="relative group px-7 py-3.5 rounded-2xl font-bold text-base text-[hsl(204,80%,10%)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-secondary/30 flex items-center gap-2">
                  <span className="absolute inset-0 bg-secondary transition-all duration-300 group-hover:brightness-110" />
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white blur-xl transition-opacity" />
                  <FaCalendar className="relative h-4.5 w-4.5" />
                  <span className="relative">Book a Service</span>
                </button>
              </Link>

              {/* Ticket outline CTA */}
              <Link to="/events">
                <button className="px-7 py-3.5 rounded-2xl font-bold text-base text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-secondary/50 hover:text-secondary transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
                  <FaTicket className="h-4.5 w-4.5" />
                  Buy Ticket
                </button>
              </Link>

              {/* Rent equipment */}
              <Link to="/rentals">
                <button className="px-7 py-3.5 rounded-2xl font-bold text-base text-white border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  <FaWrench className="h-4.5 w-4.5" />
                  Rent Equipment
                </button>
              </Link>
            </div>


          </div>

          {/* Right Column (3D Photo Carousel) */}
          <div 
            className="lg:col-span-5 flex flex-col items-center justify-center relative w-full overflow-visible min-h-[220px] sm:min-h-[280px] lg:min-h-[440px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* The carousel container */}
            <div 
              className="relative w-full h-[200px] sm:h-[250px] md:h-[350px] flex items-center justify-center overflow-visible"
              style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
            >
              {photos.map((src, idx) => {
                let offset = idx - activeIndex;
                const N = photos.length;
                if (offset < -N / 2) offset += N;
                if (offset > N / 2) offset -= N;

                const absOffset = Math.abs(offset);
                if (absOffset > 2) return null;

                // Stack positions & 3D styling (updated for landscape aspect ratio)
                const xOffset = offset * carouselOffset; 
                const scale = 1 - absOffset * 0.12;
                const zIndex = 10 - absOffset;
                const opacity = 1 - absOffset * 0.35;
                const rotateY = offset * -15;

                return (
                  <motion.div
                    key={src}
                    className="absolute w-[260px] h-[175px] sm:w-[320px] sm:h-[215px] md:w-[460px] md:h-[310px] rounded-[24px] md:rounded-[28px] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
                    style={{
                      originX: 0.5,
                      originY: 0.5,
                      backfaceVisibility: "hidden",
                    }}
                    animate={{
                      x: xOffset,
                      scale: scale,
                      zIndex: zIndex,
                      opacity: opacity,
                      rotateY: rotateY,
                      z: -absOffset * 40,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                    }}
                    onClick={() => {
                      if (offset !== 0) {
                        setActiveIndex(idx);
                      }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                      const threshold = 40;
                      if (info.offset.x < -threshold) {
                        handleNext();
                      } else if (info.offset.x > threshold) {
                        handlePrev();
                      }
                    }}
                  >
                    {/* Shadow overlay for inactive cards */}
                    {offset !== 0 && (
                      <div 
                        className="absolute inset-0 bg-black/55 z-10 transition-opacity duration-300"
                        style={{ opacity: absOffset * 0.4 }}
                      />
                    )}
                    <img
                      src={src}
                      alt={`Event photo ${idx}`}
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation buttons: Left & Right */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-30 px-1 md:-mx-4">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-secondary hover:text-secondary-foreground hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto shadow-lg group/btn"
                aria-label="Previous slide"
              >
                <FaChevronLeft className="h-4 w-4 transition-transform group-hover/btn:-translate-x-0.5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-secondary hover:text-secondary-foreground hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto shadow-lg group/btn"
                aria-label="Next slide"
              >
                <FaChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-8 z-20 max-w-full flex-wrap px-4">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex 
                      ? "w-6 bg-secondary" 
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>



      <style>{`
        .glitch-active {
          animation: glitchSkew 0.4s steps(2, end) infinite;
          position: relative;
        }
        .glitch-active::before,
        .glitch-active::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }
        .glitch-active::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitchAnim 0.3s infinite linear alternate-reverse;
        }
        .glitch-active::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9, 0 2px 3px rgba(0,0,0,0.3);
          clip: rect(85px, 450px, 140px, 0);
          animation: glitchAnim2 0.3s infinite linear alternate-reverse;
        }

        @keyframes glitchAnim {
          0% { clip: rect(31px, 9999px, 94px, 0); }
          10% { clip: rect(112px, 9999px, 76px, 0); }
          20% { clip: rect(85px, 9999px, 5px, 0); }
          30% { clip: rect(27px, 9999px, 115px, 0); }
          40% { clip: rect(73px, 9999px, 29px, 0); }
          50% { clip: rect(118px, 9999px, 145px, 0); }
          60% { clip: rect(9px, 9999px, 55px, 0); }
          70% { clip: rect(104px, 9999px, 82px, 0); }
          80% { clip: rect(41px, 9999px, 137px, 0); }
          90% { clip: rect(66px, 9999px, 18px, 0); }
          100% { clip: rect(13px, 9999px, 120px, 0); }
        }

        @keyframes glitchAnim2 {
          0% { clip: rect(76px, 9999px, 116px, 0); }
          11% { clip: rect(43px, 9999px, 98px, 0); }
          22% { clip: rect(122px, 9999px, 14px, 0); }
          33% { clip: rect(5px, 9999px, 83px, 0); }
          44% { clip: rect(82px, 9999px, 53px, 0); }
          55% { clip: rect(138px, 9999px, 112px, 0); }
          66% { clip: rect(19px, 9999px, 74px, 0); }
          77% { clip: rect(95px, 9999px, 122px, 0); }
          88% { clip: rect(61px, 9999px, 45px, 0); }
          100% { clip: rect(3px, 9999px, 139px, 0); }
        }

        @keyframes glitchSkew {
          0% { transform: skew(0deg); }
          20% { transform: skew(-2deg); }
          40% { transform: skew(3deg); }
          60% { transform: skew(-1deg); }
          80% { transform: skew(2deg); }
          100% { transform: skew(0deg); }
        }
      `}</style>
    </section>
  );
}
