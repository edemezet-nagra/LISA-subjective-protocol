// Copyright (c) 2026 Nagravision SARL
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ProtocolV2Phase,
  ProtocolV2Config,
  DEFAULT_CONFIG_V2,
  ImagePair,
  ProtocolV2Result,
  UserInfo,
} from "@/types/protocolV2";
// @ts-ignore
import protocolConfig from "../../protocol.config.js";

export function useProtocolV2(config: ProtocolV2Config = DEFAULT_CONFIG_V2) {
  const [phase, setPhase] = useState<ProtocolV2Phase>("setup");
  const [mode, setMode] = useState<"protocol" | "training">("protocol");
  const [trainingPairs, setTrainingPairs] = useState<ImagePair[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [globalScore, setGlobalScore] = useState<number>(5);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<ProtocolV2Result[]>([]);
  const [canProceed, setCanProceed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [protocolStartTime, setProtocolStartTime] = useState<number | null>(
    null,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const imageStartTimeRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number | null>(null);
  const [phaseDurations, setPhaseDurations] = useState<Record<string, number>>(
    {},
  );

  const [currentImagePair, setCurrentImagePair] = useState<ImagePair | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [noDuplicates, setNoDuplicates] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  const fetchNewPair = useCallback(
    async (
      excludeList: string[] = [],
      options?: {
        sessionId?: string | null;
        resetSession?: boolean;
        noDuplicates?: boolean;
      },
    ) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exclude: excludeList,
            sessionId: options?.sessionId ?? null,
            resetSession: options?.resetSession ?? false,
            noDuplicates: options?.noDuplicates ?? true,
          }),
        });

        const data = await response.json();

        if (data.completed) {
          return "completed";
        }

        if (!response.ok) throw new Error("Failed to fetch image pair");

        setCurrentImagePair(data);
        return true;
      } catch (error) {
        console.error("Error fetching image pair:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const recordPhaseDuration = useCallback((phaseName: string) => {
    if (phaseStartTimeRef.current) {
      const duration = Date.now() - phaseStartTimeRef.current;
      setPhaseDurations((prev) => ({
        ...prev,
        [phaseName]: duration,
      }));
    }
    phaseStartTimeRef.current = Date.now();
  }, []);

  const startTimer = useCallback((duration: number, onComplete: () => void) => {
    setTimeRemaining(duration);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    const startedAt = Date.now();

    timerRef.current = setTimeout(() => {
      setTimeRemaining(0);
      onComplete();
    }, duration);

    const interval = 100;
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, duration - elapsed);
      setTimeRemaining(remaining);
    }, interval);
  }, []);

  const stopTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);


  useEffect(() => {
    if (
      phase === "setup" ||
      phase === "complete" ||
      phase === "training-intro"
    ) {
      stopTimers();
      return;
    }

    let duration = 0;
    let nextPhase: ProtocolV2Phase | null = null;

    switch (phase) {
      case "pre-original":
        duration = protocolConfig.durations.gray;
        nextPhase = "original";
        break;
      case "original":
        duration = protocolConfig.durations.original;
        nextPhase = "gray";
        break;
      case "gray":
        duration = protocolConfig.durations.gray;
        nextPhase = "altered";
        break;
      case "altered":
        duration = protocolConfig.durations.altered;
        nextPhase = "masking";
        break;
    }

    phaseStartTimeRef.current = Date.now();

    if (duration > 0) {
      startTimer(duration, () => {
        recordPhaseDuration(phase);
        if (nextPhase) setPhase(nextPhase);
      });
    } else if (phase === "masking") {
      setCanProceed(false);
      startTimer(protocolConfig.durations.masking, () => {
        setCanProceed(true);
      });
    }

    return () => stopTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startTimer, stopTimers, recordPhaseDuration]);

  const handleMaskingComplete = useCallback(
    async (maskData: string | null) => {
      stopTimers();
      recordPhaseDuration("masking");

      if (processingRef.current) return;
      processingRef.current = true;

      try {
        if (!currentImagePair) return;

        const result: ProtocolV2Result = {
          imageId: currentImagePair.id,
          globalScore,
          maskData: maskData,
          timestamp: new Date(),
          duration: Date.now() - (imageStartTimeRef.current || Date.now()),
          phasesDuration: {
            original: phaseDurations["original"] || 0,
            gray: phaseDurations["gray"] || 0,
            altered: phaseDurations["altered"] || 0,
            masking: phaseDurations["masking"] || 0,
          },
          candidateId: userInfo?.candidateId,
        };

        const newResults = [...results, result];
        setResults(newResults);

        localStorage.setItem(
          "protocolV2_live_results",
          JSON.stringify(newResults),
        );
        localStorage.setItem(
          "protocolV2_live_status",
          JSON.stringify({
            phase: "masking-complete",
            currentImageIndex: currentImageIndex + 1,
            lastUpdate: new Date().toISOString(),
          }),
        );

        if (mode === "protocol") {
          await fetch("/api/save-result-v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              result,
              userInfo,
              imagePair: currentImagePair,
              sessionId: protocolStartTime,
            }),
          });
        }

        const currentIdx = currentImageIndex + 1;
        setCurrentImageIndex(currentIdx);

        if (mode === "training") {
          if (currentIdx < trainingPairs.length) {
            setCurrentImagePair(trainingPairs[currentIdx]);
            imageStartTimeRef.current = Date.now();
            setPhaseDurations({});
            setGlobalScore(5);
            setPhase("pre-original");
          } else {
            setMode("protocol");
            setCurrentImageIndex(0);
            setResults([]);
            setPhase("setup");
          }
        } else {
          const currentTime = Date.now();
          const elapsedTime = currentTime - (protocolStartTime || currentTime);
          const TIME_LIMIT = protocolConfig.sessionDuration;

          if (elapsedTime >= TIME_LIMIT) {
            setPhase("complete");
          } else {
            const exclude = noDuplicates ? newResults.map((r) => r.imageId) : [];
            const next = await fetchNewPair(exclude, { sessionId, noDuplicates });

            if (next === "completed") {
              setPhase("complete");
            } else if (next) {
              imageStartTimeRef.current = Date.now();
              setPhaseDurations({});
              setGlobalScore(5);
              setPhase("pre-original");
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        processingRef.current = false;
      }
    },
    [
      currentImagePair,
      currentImageIndex,
      mode,
      trainingPairs,
      results,
      userInfo,
      protocolStartTime,
      phaseDurations,
      globalScore,
      sessionId,
      noDuplicates,
      recordPhaseDuration,
      stopTimers,
      fetchNewPair,
    ],
  );

  const startProtocol = useCallback(
    async (options: { userInfo: UserInfo; noDuplicates?: boolean }) => {
      const { userInfo: user, noDuplicates: optNoDuplicates } = options;
      setUserInfo(user);
      setNoDuplicates(!!optNoDuplicates);
      const newSessionId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      setSessionId(newSessionId);
      setProtocolStartTime(Date.now());
      setCurrentImageIndex(0);
      setGlobalScore(5);
      setMode("protocol");

      try {
        const resp = await fetch(
          `/api/user-results-v2?candidateId=${encodeURIComponent(user.candidateId)}&firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}`,
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data.results && data.results.length > 0) {
            setResults(data.results);
            localStorage.setItem(
              "protocolV2_live_results",
              JSON.stringify(data.results),
            );
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (e) {
        console.error("Error loading previous v2 results:", e);
        setResults([]);
      }

      const success = await fetchNewPair([], {
        sessionId: newSessionId,
        resetSession: true,
        noDuplicates: !!optNoDuplicates,
      });
      if (success) {
        imageStartTimeRef.current = Date.now();
        setPhaseDurations({});
        setPhase("pre-original");
      }
    },
    [fetchNewPair],
  );

  const startTraining = useCallback(async (user: UserInfo) => {
    setUserInfo(user);
    setMode("training");
    setResults([]);
    setGlobalScore(5);
    setPhase("training-intro");
  }, []);

  const handleTrainingIntroComplete = useCallback(async () => {
    try {
      const response = await fetch("/api/training-pairs");
      if (!response.ok) throw new Error("Failed to fetch training pairs");
      const pairs = await response.json();

      if (pairs.length > 0) {
        setTrainingPairs(pairs);
        setCurrentImagePair(pairs[0]);
        setCurrentImageIndex(0);
        imageStartTimeRef.current = Date.now();
        setPhaseDurations({});
        setPhase("pre-original");
      }
    } catch (e) {
      console.error("Error starting training:", e);
    }
  }, []);

  const resetProtocol = useCallback(() => {
    setPhase("setup");
    setResults([]);
    setCurrentImageIndex(0);
    setProtocolStartTime(null);
    setSessionId(null);
  }, []);

  return {
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
    userInfo,
    setUserInfo,
    resetProtocol,
  };
}
