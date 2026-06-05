// Copyright (c) 2026 Nagravision SARL
import { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Paintbrush,
  Eraser,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  PaintBucket,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { useMaskingLogic } from "@/hooks/useMaskingLogic";

export interface BaseMaskingCanvasProps {
  imageUrl: string;
  uiVisible?: boolean;
  timeRemaining: number;
  initialBrushSize?: number;
  onComplete: (maskData: string | null) => void;
  renderSidebarContent: (props: any) => ReactNode;
  canvasInteractionHandler: (props: {
    canvas: HTMLCanvasElement | null;
    e: React.MouseEvent | React.TouchEvent;
    tool: string;
    brushSize: number;
    saveToHistory: () => void;
    lastPosRef: React.MutableRefObject<{ x: number; y: number } | null>;
    getCanvasCoordinates: (e: React.MouseEvent | React.TouchEvent) => {
      x: number;
      y: number;
    };
  }) => void;
}

export function BaseMaskingCanvas({
  imageUrl,
  uiVisible = true,
  timeRemaining,
  onComplete,
  renderSidebarContent,
  canvasInteractionHandler,
  initialBrushSize = 30,
}: BaseMaskingCanvasProps) {
  const {
    containerRef,
    canvasRef,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    historyIndex,
    historyLength,
    undo,
    redo,
    saveToHistory,
    imageLoaded,
    handleClear,
    imageDimensions,
  } = useMaskingLogic({ imageUrl, uiVisible, initialBrushSize });

  const [showMask, setShowMask] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleConfirm = useCallback(() => {
    if (isConfirming) return;
    const canvas = canvasRef.current;
    if (!canvas) {
      onComplete(null);
      return;
    }
    setIsConfirming(true);

    setTimeout(() => {
      const maskData = canvas.toDataURL("image/png");
      onComplete(maskData);
    }, 50);
  }, [onComplete, canvasRef, isConfirming]);

  const [hasTimerStarted, setHasTimerStarted] = useState(false);

  useEffect(() => {
    if (timeRemaining > 0) {
      setHasTimerStarted(true);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (hasTimerStarted && timeRemaining === 0 && !isConfirming) {
      handleConfirm();
    }
  }, [timeRemaining, isConfirming, handleConfirm, hasTimerStarted]);

  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX = 0;
      let clientY = 0;

      if ("touches" in e) {
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        }
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const handleMouseDown = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if ("touches" in e) {
    }

    lastPosRef.current = null;
    canvasInteractionHandler({
      canvas: canvasRef.current,
      e,
      tool,
      brushSize,
      saveToHistory,
      lastPosRef,
      getCanvasCoordinates,
    });
  };

  const handleMouseMove = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const isTouch = "touches" in e;
    if (tool === "fill") return;
    if (isTouch || (e as React.MouseEvent).buttons === 1) {
      canvasInteractionHandler({
        canvas: canvasRef.current,
        e,
        tool,
        brushSize,
        saveToHistory,
        lastPosRef,
        getCanvasCoordinates,
      });
    } else {
      lastPosRef.current = null;
    }
  };

  const handleMouseUp = () => {
    if (tool !== "fill") {
      saveToHistory();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
      }
      if (e.key === "h" || e.key === "H") {
        setShowMask((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex flex-row overflow-hidden animate-fade-in select-none",
        isConfirming && "cursor-wait",
      )}
    >
      <div className="flex-1 relative h-full bg-black/5 flex items-center justify-center overflow-hidden">
        <div
          className="relative shadow-2xl border border-border"
          style={{
            width: imageDimensions.width || "auto",
            height: imageDimensions.height || "auto",
          }}
        >
          <img
            src={imageUrl}
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className={cn(
              "relative z-10 drawing-cursor",
              showMask ? "opacity-50" : "opacity-0",
              !imageLoaded && "opacity-0",
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            onMouseEnter={() => {
              lastPosRef.current = null;
            }}
          />
        </div>
      </div>

      <div
        className={cn(
          "w-80 border-l border-border bg-card p-6 flex flex-col gap-6 transition-transform duration-300 ease-in-out z-20",
          uiVisible ? "translate-x-0" : "translate-x-full hidden",
        )}
      >
        {renderSidebarContent({
          timeRemaining,
          tool,
          setTool,
          brushSize,
          setBrushSize,
          undo,
          redo,
          handleClear,
          showMask,
          setShowMask,
          handleConfirm,
          isConfirming,
          historyIndex,
          historyLength,
        })}
      </div>
    </div>
  );
}
