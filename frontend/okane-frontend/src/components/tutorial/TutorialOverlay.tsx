"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorialStore, TUTORIAL_STEPS } from "@/store/tutorialStore";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 12;

export default function TutorialOverlay() {
  const { isActive, currentStep, nextStep, prevStep, skipTutorial } = useTutorialStore();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const step = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    if (!isActive) return;

    const calculatePositions = () => {
      if (!step.targetId) {
        setSpotlightRect(null);
        setTooltipPos(null);
        return;
      }

      const el = document.getElementById(step.targetId);
      if (!el) {
        setSpotlightRect(null);
        setTooltipPos(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      const spotlight: SpotlightRect = {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };
      setSpotlightRect(spotlight);

      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (step.placement) {
        case "right":
          top = spotlight.top + spotlight.height / 2 - tooltipHeight / 2;
          left = spotlight.left + spotlight.width + 16;
          break;
        case "left":
          top = spotlight.top + spotlight.height / 2 - tooltipHeight / 2;
          left = spotlight.left - tooltipWidth - 16;
          break;
        case "bottom":
          top = spotlight.top + spotlight.height + 16;
          left = spotlight.left + spotlight.width / 2 - tooltipWidth / 2;
          break;
        case "top":
          top = spotlight.top - tooltipHeight - 16;
          left = spotlight.left + spotlight.width / 2 - tooltipWidth / 2;
          break;
        default:
          top = vh / 2 - tooltipHeight / 2;
          left = vw / 2 - tooltipWidth / 2;
      }

      top = Math.max(16, Math.min(top, vh - tooltipHeight - 16));
      left = Math.max(16, Math.min(left, vw - tooltipWidth - 16));

      setTooltipPos({ top, left });
    };

    calculatePositions();
    window.addEventListener("resize", calculatePositions);
    return () => window.removeEventListener("resize", calculatePositions);
  }, [isActive, currentStep, step]);

  if (!isActive) return null;

  const isCenter = !step.targetId || step.placement === "center";
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="tutorial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: "none" }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <defs>
              <mask id="tutorial-mask">
                <rect width="100%" height="100%" fill="white" />
                {spotlightRect && (
                  <rect
                    x={spotlightRect.left}
                    y={spotlightRect.top}
                    width={spotlightRect.width}
                    height={spotlightRect.height}
                    rx={10}
                    ry={10}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#tutorial-mask)"
            />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={10}
                ry={10}
                fill="transparent"
                stroke="rgba(99,102,241,0.8)"
                strokeWidth={2}
              />
            )}
          </svg>

          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              pointerEvents: "auto",
              width: 320,
              ...(isCenter
                ? {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }
                : tooltipPos
                ? { top: tooltipPos.top, left: tooltipPos.left }
                : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }),
            }}
            className="bg-white rounded-2xl shadow-2xl p-6 border border-indigo-100"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </span>
              <button
                onClick={skipTutorial}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{step.description}</p>

            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-5 bg-indigo-500"
                        : i < currentStep
                        ? "w-1.5 bg-indigo-300"
                        : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-4 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next"}
                  {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}