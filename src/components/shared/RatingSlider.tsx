// Copyright (c) 2026 Nagravision SARL
import { RATING_LABELS } from "@/types/shared";
import { cn } from "@/lib/utils";

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function RatingSlider({ value, onChange, disabled }: RatingSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center space-y-8 animate-fade-in min-h-0">
      <div className="text-center">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Quality
        </h3>
        <div className="text-4xl font-bold text-primary">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {RATING_LABELS[value]}
        </div>
      </div>

      <div className="flex-1 flex row items-center gap-4 min-h-[300px]">
        {/* Vertical Slider Container */}
        <div className="h-full flex items-center py-4">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="h-full w-2 appearance-none bg-secondary rounded-full outline-none slider-vertical cursor-pointer"
            style={{ writingMode: "vertical-lr", direction: "rtl" }}
          />
        </div>

        {/* Labels */}
        <div className="flex flex-col justify-between h-full py-4 text-sm text-muted-foreground">
          {Object.entries(RATING_LABELS)
            .reverse()
            .map(([score, label]) => (
              <div
                key={score}
                className={cn(
                  "flex items-center gap-2 transition-colors cursor-pointer hover:text-primary",
                  parseInt(score) === value && "text-primary font-medium",
                )}
                onClick={() => !disabled && onChange(parseInt(score))}
              >
                <span className="text-lg font-semibold w-4">{score}</span>
                <span className="text-xs whitespace-nowrap">{label}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
