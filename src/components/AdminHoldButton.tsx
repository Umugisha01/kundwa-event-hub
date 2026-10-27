import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminHoldButtonProps {
  className?: string;
}

export function AdminHoldButton({ className = "" }: AdminHoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const navigate = useNavigate();

  const HOLD_DURATION = 5000; // 5 seconds continuous hold required

  const clearHold = () => {
    setIsHolding(false);
    setProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      clearHold();
      if ("vibrate" in navigator) {
        try {
          navigator.vibrate([60, 80, 100]);
        } catch {
          // ignore
        }
      }
      toast({
        title: "Admin Portal Unlocked",
        description: "Redirecting to Administrator Login...",
      });
      navigate("/login");
    }, HOLD_DURATION);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Do not redirect on click - inform the user of the 5-second hold requirement
    toast({
      title: "Security Shield",
      description: "Press and hold the shield for 5 seconds to unlock Administrator Login.",
    });
  };

  useEffect(() => {
    return () => clearHold();
  }, []);

  // Circular progress math (r = 14, circumference ~ 88)
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={handleStart}
        onMouseUp={clearHold}
        onMouseLeave={clearHold}
        onTouchStart={handleStart}
        onTouchEnd={clearHold}
        onTouchCancel={clearHold}
        title=""
        aria-label="Admin Portal Shield"
        className={`relative flex items-center justify-center p-2 rounded-xl select-none transition-all duration-300 ${
          isHolding
            ? "bg-primary/25 text-primary scale-110 shadow-lg shadow-primary/30"
            : "hover:scale-105 active:scale-95 opacity-70 hover:opacity-100"
        }`}
        style={{
          touchAction: "none",
        }}
      >
        {/* Circular progress SVG */}
        {isHolding && (
          <svg
            className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary/20"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="hsl(200, 95%, 65%)"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-75"
            />
          </svg>
        )}

        {/* Shield Icon */}
        <Shield
          className={`h-4 w-4 transition-transform duration-200 ${
            isHolding ? "scale-110 text-primary" : "text-slate-400 group-hover:text-white"
          }`}
        />
      </button>

      {/* Holding visual countdown tooltip */}
      {isHolding && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/95 text-secondary border border-secondary/40 shadow-xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 z-50">
          {Math.round(progress)}% ({Math.ceil(Math.max(0, 5 - (progress / 20)))}s)
        </span>
      )}
    </div>
  );
}
