import { useEffect, useState } from "react";
import { ArrowRight, Check, HelpCircle, X } from "lucide-react";

export type TourStep = {
  title: string;
  description: string;
  targetId: string;
  badge: string;
};

const tourSteps: TourStep[] = [
  {
    title: "1. Upload & Parse Graph JSON",
    description: "Start by dropping a versioned Zod-validated graph JSON file. ONSOUR automatically parses node states (θ ∈ [-1, 1]) and directed edge weights.",
    targetId: "lab-upload-card",
    badge: "Data Ingestion",
  },
  {
    title: "2. Epsilon Governance Barrier",
    description: "Adjust the dispersion threshold (ε). The thermal governor continuously monitors system order and decides whether to accept or atomically rollback candidate states.",
    targetId: "lab-controls-card",
    badge: "Thermodynamic Governor",
  },
  {
    title: "3. Database Persistence & Export",
    description: "Save dispersion analysis records directly to MySQL with full provenance tracking (engine version, numeric mode, logical epoch) or export JSON/CSV.",
    targetId: "lab-persistence-card",
    badge: "Authoritative Replay",
  },
  {
    title: "4. Obsidian-Inspired Graph Explorer",
    description: "Inspect nodes in real time, apply regex cluster rules, toggle local graph depth focus, and export high-resolution PNG or SVG vectors.",
    targetId: "lab-explorer-card",
    badge: "Topological Field",
  },
];

const TOUR_STORAGE_KEY = "onsour_live_lab_tour_completed_v1";

export function LiveDispersionTour({ isOpenManually, onCloseManual }: { isOpenManually?: boolean; onCloseManual?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpenManually) {
      setIsOpen(true);
      setCurrentStepIndex(0);
      return;
    }
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpenManually]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    if (onCloseManual) onCloseManual();
  };

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStepIndex];

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Interactive Live Dispersion Lab Tour">
      <div className="tour-backdrop" onClick={handleClose} />
      <div className="tour-modal">
        <div className="tour-header">
          <span className="tour-badge">{step.badge}</span>
          <button type="button" className="tour-close" onClick={handleClose} aria-label="Close interactive tour">
            <X size={16} />
          </button>
        </div>
        <div className="tour-body">
          <span className="mono-label">STEP {currentStepIndex + 1} OF {tourSteps.length}</span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
        <div className="tour-progress-bar">
          {tourSteps.map((_, idx) => (
            <span key={idx} className={`tour-dot ${idx === currentStepIndex ? "is-active" : idx < currentStepIndex ? "is-completed" : ""}`} />
          ))}
        </div>
        <div className="tour-footer">
          <button type="button" className="tour-button-secondary" onClick={handlePrev} disabled={currentStepIndex === 0}>
            Back
          </button>
          <div className="tour-footer-right">
            <button type="button" className="tour-button-skip" onClick={handleClose}>
              Skip tour
            </button>
            <button type="button" className="tour-button-primary" onClick={handleNext}>
              {currentStepIndex === tourSteps.length - 1 ? "Got it, let's explore" : "Next step"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
