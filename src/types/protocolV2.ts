// Copyright (c) 2026 Nagravision SARL
export type ProtocolV2Phase =
  | "setup"
  | "training-intro"
  | "pre-original"
  | "original"
  | "gray"
  | "altered"
  | "masking"
  | "complete";

export interface ImagePair {
  id: string;
  originalUrl: string;
  alteredUrl: string;
  imageName: string;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  candidateId: string;
}

export interface ProtocolV2Result {
  imageId: string;
  processId: number;
  globalScore?: number;
  maskData: string | null;
  maskUrl?: string;
  timestamp: Date;
  duration: number;
  phasesDuration?: {
    original: number;
    gray: number;
    altered: number;
    masking: number;
  };
  candidateId?: string;
}

export interface ProtocolV2Config {
  originalDuration: number;
  grayDuration: number;
  alteredDuration: number;
  maskingDuration: number;
}

export const DEFAULT_CONFIG_V2: ProtocolV2Config = {
  originalDuration: 10000,
  grayDuration: 2000,
  alteredDuration: 10000,
  maskingDuration: 15000,
};
