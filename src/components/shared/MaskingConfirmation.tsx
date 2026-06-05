// Copyright (c) 2026 Nagravision SARL
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaskingConfirmationProps {
  handleConfirm: () => void;
  isConfirming: boolean;
  text?: string;
  confirmText?: string;
  className?: string;
}

export function MaskingConfirmation({
  handleConfirm,
  isConfirming,
  text = "Confirm Mask",
  confirmText,
  className,
}: MaskingConfirmationProps) {

  return (
    <Button
      onClick={handleConfirm}
      className={cn("w-full h-12 text-lg font-bold gap-2", className)}
      disabled={isConfirming}
    >
      {isConfirming ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Check className="w-5 h-5" />
          {text}
        </>
      )}
    </Button>
  );
}
