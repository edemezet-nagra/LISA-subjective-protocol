// Copyright (c) 2026 Nagravision SARL
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Info } from "lucide-react";
import { useState } from "react";
import { UserInfo } from "@/types/protocolV1";
// @ts-ignore
import protocolConfig from "../../../protocol.config.js";

interface SetupScreenProps {
  onStart: (options?: { noDuplicates: boolean }) => void;
  onStartTraining: () => void;
  currentIndex: number;
  setUserInfo: (info: UserInfo) => void;
  title?: string;
  subtitle?: string;
}

export function SetupScreen({
  onStart,
  onStartTraining,
  currentIndex,
  setUserInfo,
  title = "DSIS Protocol",
  subtitle = "Image Quality Assessment",
}: SetupScreenProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [noDuplicates, setNoDuplicates] = useState(false);

  const isValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    candidateId.trim() !== "";

  const handleStart = () => {
    if (isValid) {
      setUserInfo({
        firstName,
        lastName,
        candidateId,
      });
      onStart({ noDuplicates });
    }
  };

  const handleStartTraining = () => {
    if (isValid) {
      setUserInfo({
        firstName,
        lastName,
        candidateId,
      });
      onStartTraining();
    }
  };

  const formatDuration = (ms: number) => {
    if (ms >= 60000) {
      if (ms % 60000 === 0) {
        const mins = ms / 60000;
        return `${mins} minute${mins > 1 ? "s" : ""}`;
      }
    }
    return `${ms / 1000} seconds`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          <p className="text-xl text-muted-foreground">{subtitle}</p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border space-y-4 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            <span className="font-medium">Instructions</span>
          </div>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Enter your details below.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>
                A gray screen will appear for{" "}
                <strong className="text-foreground">
                  {formatDuration(protocolConfig.durations.gray)}
                </strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>
                An original image will be displayed for{" "}
                <strong className="text-foreground">
                  {formatDuration(protocolConfig.durations.original)}
                </strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>
                A gray screen will appear for{" "}
                <strong className="text-foreground">
                  {formatDuration(protocolConfig.durations.gray)}
                </strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">5.</span>
              <span>
                The altered image will be displayed for{" "}
                <strong className="text-foreground">
                  {formatDuration(protocolConfig.durations.altered)}
                </strong>{" "}
                - rate its quality from 1 to 5
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">6.</span>
              <span>
                Draw a mask on the degraded areas (
                <strong className="text-foreground">
                  {formatDuration(protocolConfig.durations.masking)} max
                </strong>
                )
              </span>
            </li>
          </ol>
        </div>

        <div className="grid gap-4 max-w-md mx-auto text-left">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Marie"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Michu"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="candidateId">Candidate ID</Label>
            <Input
              id="candidateId"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="42"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="noDuplicates"
              checked={noDuplicates}
              onCheckedChange={(checked) => setNoDuplicates(checked as boolean)}
            />
            <Label htmlFor="noDuplicates" className="cursor-pointer">
              No Duplicates (unique images only)
            </Label>
          </div>
        </div>

        {currentIndex > 0 && (
          <p className="text-muted-foreground">
            Images evaluated:{" "}
            <span className="text-primary font-bold">{currentIndex}</span>
          </p>
        )}

        <div className="flex gap-4 w-full max-w-md mx-auto">
          <Button
            size="lg"
            className="flex-1 text-lg h-12 gap-2"
            onClick={handleStartTraining}
            disabled={!isValid}
            variant="secondary"
          >
            Start Training
          </Button>
          <Button
            size="lg"
            className="flex-1 text-lg h-12 gap-2"
            onClick={handleStart}
            disabled={!isValid}
          >
            <Play className="w-5 h-5" />
            {currentIndex > 0 ? "Resume Protocol" : "Start Protocol"}
          </Button>
        </div>
      </div>
    </div>
  );
}
