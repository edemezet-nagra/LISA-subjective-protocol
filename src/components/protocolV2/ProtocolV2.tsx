// Copyright (c) 2026 Nagravision SARL
import { useProtocolV2 } from "@/hooks/useProtocolV2";
import { ImageDisplay } from "../shared/ImageDisplay";
import { GrayScreen } from "../shared/GrayScreen";
import { MaskingCanvasV2 } from "./MaskingCanvasV2";
import { SetupScreen } from "../shared/SetupScreen";
import { TrainingIntro } from "../shared/TrainingIntro";
import { RatingSlider } from "../shared/RatingSlider";
import { Timer } from "../shared/Timer";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import { UserInfo } from "@/types/protocolV2";
import { useNavVisibility } from "@/contexts/NavVisibilityContext";

export function ProtocolV2() {
  const {
    phase,
    mode,
    currentImagePair,
    globalScore,
    setGlobalScore,
    timeRemaining,
    canProceed,
    currentImageIndex,
    startProtocol,
    startTraining,
    handleTrainingIntroComplete,
    handleMaskingComplete,
    setUserInfo,
  } = useProtocolV2();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const { setNavHidden } = useNavVisibility();

  useEffect(() => {
    setNavHidden(phase !== "setup" && phase !== "complete");
  }, [phase, setNavHidden]);

  const tempUserInfo = useRef<UserInfo | null>(null);

  const showTimer = false;

  const hideCursor =
    (phase === "original" ||
      phase === "gray" ||
      phase === "pre-original" ||
      phase === "altered") &&
    !isSidebarHovered;

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.key === "f" || e.key === "F") && !isInput) {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  const onSetupSetUserInfo = (info: UserInfo) => {
    tempUserInfo.current = info;
    setUserInfo(info);
  };

  const onSetupStart = (options?: { noDuplicates: boolean }) => {
    if (tempUserInfo.current) {
      startProtocol({
        userInfo: tempUserInfo.current,
        noDuplicates: options?.noDuplicates ?? false,
      });
    }
  };

  const onSetupStartTraining = () => {
    if (tempUserInfo.current) {
      startTraining(tempUserInfo.current);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-screen bg-black overflow-hidden select-none",
        hideCursor && "cursor-none",
      )}
    >
      {/* Global Timer Overlay */}
      {showTimer && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-50">
          <Timer seconds={Math.ceil(timeRemaining / 1000)} />
        </div>
      )}

      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 text-white/20 hover:text-white z-50 transition-colors"
      >
        {isFullscreen ? <Minimize /> : <Maximize />}
      </button>

      {/* --- PHASES --- */}

      {phase === "setup" && (
        <div className="w-full h-full bg-background text-foreground overflow-y-auto">
          {/* @ts-ignore - compatible types */}
          <SetupScreen
            onStart={onSetupStart}
            onStartTraining={onSetupStartTraining}
            currentIndex={currentImageIndex}
            setUserInfo={onSetupSetUserInfo}
            title="Local Impairment Scale Annotator (LISA)"
            subtitle="Image Local Quality Assessment with Masking"
          />
        </div>
      )}

      {phase === "training-intro" && (
        <div className="w-full h-full bg-background text-foreground overflow-y-auto">
          <TrainingIntro onComplete={handleTrainingIntroComplete} />
        </div>
      )}

      {(phase === "pre-original" || phase === "gray") && <GrayScreen />}

      {phase === "original" && currentImagePair && (
        <div className="w-full h-full flex flex-row">
          <div className="flex-1 relative bg-black/5 flex items-center justify-center p-0">
            <ImageDisplay
              src={currentImagePair.originalUrl}
              alt={
                mode === "training"
                  ? "Original Image (Training)"
                  : "Original Image"
              }
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div
            className="w-80 border-l border-border bg-card p-6 flex flex-col transition-transform duration-300 ease-in-out z-20 translate-x-0"
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
              Original Image
            </h2>
            <div className="text-center mb-6">
              <div className="text-4xl font-mono font-bold text-primary tabular-nums">
                {timeRemaining > 0 ? (
                  <>
                    {Math.floor(timeRemaining / 60000)}:
                    {Math.floor((timeRemaining % 60000) / 1000)
                      .toString()
                      .padStart(2, "0")}
                  </>
                ) : (
                  "0:00"
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                Time Remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === "altered" && currentImagePair && (
        <div className="w-full h-full flex flex-row">
          <div className="flex-1 relative bg-black/5 flex items-center justify-center p-0">
            <ImageDisplay
              src={currentImagePair.alteredUrl}
              alt={
                mode === "training"
                  ? "Altered Image (Training)"
                  : "Altered Image"
              }
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div
            className="w-80 border-l border-border bg-card p-6 flex flex-col transition-transform duration-300 ease-in-out z-20 translate-x-0"
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
              Altered Image
            </h2>
            <div className="text-center mb-6">
              <div className="text-4xl font-mono font-bold text-primary tabular-nums">
                {timeRemaining > 0 ? (
                  <>
                    {Math.floor(timeRemaining / 60000)}:
                    {Math.floor((timeRemaining % 60000) / 1000)
                      .toString()
                      .padStart(2, "0")}
                  </>
                ) : (
                  "0:00"
                )}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                Observation Time
              </p>
            </div>
            <RatingSlider
              value={globalScore}
              onChange={setGlobalScore}
              disabled={canProceed}
            />
          </div>
        </div>
      )}

      {phase === "masking" && currentImagePair && (
        <MaskingCanvasV2
          imageUrl={currentImagePair.alteredUrl}
          timeRemaining={timeRemaining}
          onComplete={handleMaskingComplete}
        />
      )}

      {phase === "complete" && (
        <div className="w-full h-full flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Session Complete (LISA)</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your participation.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 hover:underline"
            >
              Return to Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
