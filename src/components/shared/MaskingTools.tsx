// Copyright (c) 2026 Nagravision SARL
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Paintbrush,
  Eraser,
  RotateCcw,
  PaintBucket,
  EyeOff,
  Eye,
  Undo2,
  Redo2,
} from "lucide-react";

interface MaskingToolsProps {
  tool: "brush" | "eraser" | "fill";
  setTool: (t: "brush" | "eraser" | "fill") => void;
  handleClear: () => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  showMask: boolean;
  setShowMask: (show: boolean) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
}

export function MaskingTools({
  tool,
  setTool,
  handleClear,
  undo,
  redo,
  historyIndex,
  historyLength,
  showMask,
  setShowMask,
  brushSize,
  setBrushSize,
}: MaskingToolsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant={tool === "brush" ? "default" : "secondary"}
          size="icon"
          onClick={() => setTool("brush")}
          title="Brush"
          className="w-full"
        >
          <Paintbrush className="h-5 w-5" />
        </Button>
        <Button
          variant={tool === "eraser" ? "default" : "secondary"}
          size="icon"
          onClick={() => setTool("eraser")}
          title="Eraser"
          className="w-full"
        >
          <Eraser className="h-5 w-5" />
        </Button>
        <Button
          variant={tool === "fill" ? "default" : "secondary"}
          size="icon"
          onClick={() => setTool("fill")}
          title="Fill"
          className="w-full"
        >
          <PaintBucket className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleClear}
          title="Clear All"
          className="w-full"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
          className="w-full"
        >
          <Undo2 className="h-4 w-4 mr-2" /> Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={historyIndex >= historyLength - 1}
          title="Redo"
          className="w-full"
        >
          Redo <Redo2 className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={() => setShowMask(!showMask)}
        className="w-full gap-2"
      >
        {showMask ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {showMask ? "Hide Mask" : "Show Mask"}
      </Button>

      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">
          Brush Size: {brushSize}px
        </span>
        <Slider
          value={[brushSize]}
          onValueChange={([value]) => setBrushSize(value)}
          min={5}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
}
