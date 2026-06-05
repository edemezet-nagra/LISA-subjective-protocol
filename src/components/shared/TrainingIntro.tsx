// Copyright (c) 2026 Nagravision SARL
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Equal } from "lucide-react";
import { useState, useEffect } from "react";

interface TrainingIntroProps {
  onComplete: () => void;
}

export function TrainingIntro({ onComplete }: TrainingIntroProps) {
  const [step, setStep] = useState(0);
  const [trainingCount, setTrainingCount] = useState<number | null>(null);

  const totalSteps = 4;

  useEffect(() => {
    fetch("/api/training-pairs")
      .then((r) => r.json())
      .then((pairs: unknown[]) => setTrainingCount(pairs.length))
      .catch(() => setTrainingCount(null));
  }, []);

  return (
    <div className="w-full h-full bg-background text-foreground overflow-y-auto">
      <div className="w-full px-8 py-10 space-y-10 animate-fade-in">
        {/* Step 0: Annotation examples - good precise, good approximate, bad */}
        {step === 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold">
                Training Annotation Guidelines
              </h1>
              <p className="text-muted-foreground text-2xl">
                Learn what makes a good vs. bad annotation before starting the
                protocol.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Good precise annotation */}
              <div className="rounded-2xl border-2 border-green-500/50 bg-card p-6 space-y-5">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="/training/good_precise.png"
                    alt="Good precise annotation"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Placeholder good_precise.png</div>';
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                  <span className="text-xl font-semibold text-green-500">
                    Good Precise annotation
                  </span>
                </div>
                <p className="text-lg text-muted-foreground text-center">
                  The mask closely follows the boundaries of the degraded area.
                  This level of precision is ideal.
                </p>
              </div>

              {/* Good approximate annotation */}
              <div className="rounded-2xl border-2 border-green-500/50 bg-card p-6 space-y-5">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="/training/good_approximate.png"
                    alt="Good approximate annotation"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Placeholder good_approximate.png</div>';
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                  <span className="text-xl font-semibold text-green-500">
                    Good Approximate annotation
                  </span>
                </div>
                <p className="text-lg text-muted-foreground text-center">
                  The mask roughly covers the degraded area. Not pixel-perfect,
                  but still acceptable.
                </p>
              </div>

              {/* Bad annotation */}
              <div className="rounded-2xl border-2 border-red-500/50 bg-card p-6 space-y-5">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="/training/bad_annotation.png"
                    alt="Bad annotation"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Placeholder bad_annotation.png</div>';
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 justify-center">
                  <XCircle className="w-9 h-9 text-red-500" />
                  <span className="text-xl font-semibold text-red-500">
                    Bad Incorrect annotation
                  </span>
                </div>
                <p className="text-lg text-muted-foreground text-center">
                  The mask does not cover the degraded area or is completely
                  misplaced. This is unacceptable.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => setStep(1)} className="gap-2">
                Next <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Mask equivalence - unpainted pixels = imperceptible */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold">
                Training Mask Interpretation
              </h1>
              <p className="text-muted-foreground text-2xl">
                Unpainted pixels in the mask are considered imperceptible.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              {/* Mask without certain pixels colored */}
              <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-5 max-w-2xl flex-1">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="/training/mask_without_pixels.png"
                    alt="Mask without certain pixels colored"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Placeholder mask_without_pixels.png</div>';
                    }}
                  />
                </div>
                <p className="text-lg text-muted-foreground text-center font-medium">
                  Mask with some areas left unpainted
                </p>
              </div>

              {/* Equals sign */}
              <div className="flex items-center justify-center">
                <Equal className="w-20 h-20 text-primary" />
              </div>

              {/* Same mask with those pixels as imperceptible */}
              <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-5 max-w-2xl flex-1">
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src="/training/mask_with_pixels.png"
                    alt="Same mask with imperceptible pixels"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Placeholder mask_with_pixels.png</div>';
                    }}
                  />
                </div>
                <p className="text-lg text-muted-foreground text-center font-medium">
                  Same mask unpainted pixels = imperceptible (score 5)
                </p>
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-8 max-w-4xl mx-auto">
              <p className="text-center text-xl text-muted-foreground">
                You don't need to paint every pixel. Any area you leave{" "}
                <strong className="text-foreground">unpainted</strong> is
                interpreted as
                <strong className="text-foreground"> imperceptible</strong>{" "}
                (quality score 5 no visible degradation).
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button size="lg" onClick={() => setStep(2)} className="gap-2">
                Next <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tools tutorial video */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold">Training Tools Tutorial</h1>
              <p className="text-muted-foreground text-2xl">
                Watch this video to learn how to use the annotation tools.
              </p>
            </div>

            <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden border-2 border-border bg-black">
              <video
                controls
                className="w-full aspect-video"
                src="/training/tools_tutorial.mp4"
              >
                <source src="/training/tools_tutorial.mp4" type="video/mp4" />
                <source src="/training/tools_tutorial.webm" type="video/webm" />
                Your browser does not support the video element.
              </video>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              If the video does not load, please ask the supervisor for
              assistance.
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button size="lg" onClick={() => setStep(3)} className="gap-2">
                Next <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Ready to start training practice */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold">Training Practice</h1>
              <p className="text-muted-foreground text-2xl">
                You are now ready to practice on test images.
              </p>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-10 max-w-4xl mx-auto text-center space-y-8">
              <p className="text-3xl text-foreground">
                You will now annotate{" "}
                <strong>
                  {trainingCount ?? "..."} test image
                  {trainingCount !== 1 ? "s" : ""}
                </strong>{" "}
                to get familiar with the process.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mt-4">
                <p className="text-lg text-primary font-medium">
                  These images are representative of the types of altered images
                  in the full dataset.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button size="lg" onClick={onComplete} className="gap-2">
                Start Training Practice <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === step
                  ? "bg-primary"
                  : i < step
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
