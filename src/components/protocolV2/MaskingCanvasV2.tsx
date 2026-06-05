// Copyright (c) 2026 Nagravision SARL
import { useState } from "react";
import { BaseMaskingCanvas } from "../shared/BaseMaskingCanvas";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { drawStroke, floodFill } from "@/lib/canvas-utils";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MaskingSidebarTimer } from "../shared/MaskingSidebarTimer";
import { MaskingTools } from "../shared/MaskingTools";
import { MaskingConfirmation } from "../shared/MaskingConfirmation";

interface MaskingCanvasV2Props {
  imageUrl: string;
  onComplete: (maskData: string | null) => void;
  timeRemaining: number;
  uiVisible?: boolean;
}

const RATING_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#3b82f6",
};

const RATING_LABELS: Record<number, string> = {
  1: "Very Annoying",
  2: "Annoying",
  3: "Slightly Annoying",
  4: "Perceptible",
  5: "Imperceptible",
};

export function MaskingCanvasV2(props: MaskingCanvasV2Props) {
  const [currentRating, setCurrentRating] = useState<number>(3);

  const handleInteraction = ({
    canvas,
    e,
    tool,
    brushSize,
    saveToHistory,
    lastPosRef,
    getCanvasCoordinates,
  }: any) => {
    const { x, y } = getCanvasCoordinates(e);
    const color = RATING_COLORS[currentRating];

    if (tool === "fill") {
      floodFill(canvas, x, y, color);
      saveToHistory();
    } else {
      drawStroke(canvas, x, y, brushSize, color, tool, lastPosRef.current);
      lastPosRef.current = { x, y };
    }
  };

  return (
    <BaseMaskingCanvas
      {...props}
      canvasInteractionHandler={handleInteraction}
      initialBrushSize={30}
      renderSidebarContent={({
        tool,
        setTool,
        handleClear,
        undo,
        redo,
        showMask,
        setShowMask,
        brushSize,
        setBrushSize,
        handleConfirm,
        isConfirming,
        historyIndex,
        historyLength,
        timeRemaining,
      }) => (
        <div className="flex flex-col h-full gap-6">
          <MaskingSidebarTimer timeRemaining={timeRemaining} unit="ms" />

          <MaskingTools
            tool={tool}
            setTool={setTool}
            handleClear={handleClear}
            undo={undo}
            redo={redo}
            historyIndex={historyIndex}
            historyLength={historyLength}
            showMask={showMask}
            setShowMask={setShowMask}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
          />

          {/* Rating Colors - List View restored */}
          <div className="mt-auto space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-300">
                Rating Color / Severity
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setCurrentRating(rating)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      currentRating === rating
                        ? "bg-white/10 border-white/50 shadow-md"
                        : "border-transparent hover:bg-white/5 opacity-70 hover:opacity-100",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full shrink-0 shadow-sm ring-1 ring-white/20",
                      )}
                      style={{ backgroundColor: RATING_COLORS[rating] }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {rating}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {RATING_LABELS[rating]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <MaskingConfirmation
              handleConfirm={handleConfirm}
              isConfirming={isConfirming}
            />
          </div>
        </div>
      )}
    />
  );
}
