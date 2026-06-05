// Copyright (c) 2026 Nagravision SARL
import { useState, useRef, useCallback, useEffect } from "react";

export interface MaskingLogicProps {
  imageUrl: string;
  uiVisible?: boolean;
  initialBrushSize?: number;
}

export function useMaskingLogic({
  imageUrl,
  uiVisible = true,
  initialBrushSize = 30,
}: MaskingLogicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [brushSize, setBrushSize] = useState(initialBrushSize);
  const [tool, setTool] = useState<"brush" | "eraser" | "fill">("brush");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const lastImageUrlRef = useRef<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const MAX_HISTORY = 15;

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : nextIndex;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const imageData = history[newIndex];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas && imageData) {
      ctx.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const imageData = history[newIndex];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas && imageData) {
      ctx.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    }
  }, [saveToHistory]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    const calculateDimensions = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onerror = () => {
        console.error("Failed to load image for masking:", imageUrl);
      };

      img.onload = () => {
        if (!canvasRef.current || !containerRef.current) return;

        const isSameImage = lastImageUrlRef.current === imageUrl;
        let tempCanvas: HTMLCanvasElement | null = null;

        if (isSameImage && canvasRef.current.width > 0) {
          tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvasRef.current.width;
          tempCanvas.height = canvasRef.current.height;
          const tCtx = tempCanvas.getContext("2d");
          if (tCtx) tCtx.drawImage(canvasRef.current, 0, 0);
        }

        const container = containerRef.current;
        const sidebarWidth = uiVisible ? 0 : 0;

        const availableWidth = container.clientWidth - (uiVisible ? 320 : 0);
        const availableHeight = container.clientHeight;

        if (availableWidth <= 0 || availableHeight <= 0) {
          console.warn(
            "MaskingCanvas: Available dimensions are <= 0. Check container size.",
            {
              cw: container.clientWidth,
              ch: container.clientHeight,
              uiVisible,
              availW: availableWidth,
              availH: availableHeight,
            },
          );
          return;
        }

        const scale = Math.min(
          availableWidth / img.width,
          availableHeight / img.height,
        );

        const width = Math.max(1, Math.floor(img.width * scale));
        const height = Math.max(1, Math.floor(img.height * scale));

        if (
          canvasRef.current.width !== width ||
          canvasRef.current.height !== height
        ) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          setImageDimensions({ width, height });

          if (tempCanvas) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx)
              ctx.drawImage(
                tempCanvas,
                0,
                0,
                tempCanvas.width,
                tempCanvas.height,
                0,
                0,
                width,
                height,
              );
          } else {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx && !imageLoaded) {
              ctx.clearRect(0, 0, width, height);
              const initialData = ctx.getImageData(0, 0, width, height);
              setHistory([initialData]);
              setHistoryIndex(0);
            }
          }
        }

        if (!imageLoaded || lastImageUrlRef.current !== imageUrl) {
          lastImageUrlRef.current = imageUrl;
          setImageLoaded(true);
        }
      };

      img.src = imageUrl;
    };

    calculateDimensions();

    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculateDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", calculateDimensions);

    return () => {
      window.removeEventListener("resize", calculateDimensions);
      resizeObserver?.disconnect();
    };
  }, [imageUrl, uiVisible]);

  return {
    containerRef,
    canvasRef,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    historyIndex,
    historyLength: history.length,
    undo,
    redo,
    saveToHistory,
    imageLoaded,
    handleClear,
    imageDimensions,
  };
}
