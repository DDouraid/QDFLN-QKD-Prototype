import { Client, Validator, ConsensusRound, LogEntry } from "./mock-data";

// Extended client data with training history
export interface ClientDetail extends Client {
  epochs: number;
  currentLoss: number;
  lossHistory: { epoch: number; loss: number }[];
  gradientHistory: { round: number; norm: number }[];
  pqcKeyId: string;
  signatureAlgo: string;
  kemAlgo: string;
  encryptedPackets: number;
}

export const mockClientDetails: ClientDetail[] = [
  {
    id: "c-001", name: "Client Alpha", status: "training", datasetSize: 12500, gradientNorm: 0.0342, noiseLevel: 0.01, lastUpdate: "2s ago", pqcStatus: "secured",
    epochs: 15, currentLoss: 0.0234, pqcKeyId: "mlkem-a3f8c1", signatureAlgo: "SPHINCS+-SHA2-128f", kemAlgo: "ML-KEM-512", encryptedPackets: 47,
    lossHistory: [
      { epoch: 1, loss: 0.89 }, { epoch: 3, loss: 0.62 }, { epoch: 5, loss: 0.41 }, { epoch: 7, loss: 0.28 },
      { epoch: 9, loss: 0.15 }, { epoch: 11, loss: 0.089 }, { epoch: 13, loss: 0.045 }, { epoch: 15, loss: 0.023 },
    ],
    gradientHistory: [
      { round: 40, norm: 0.051 }, { round: 41, norm: 0.048 }, { round: 42, norm: 0.044 }, { round: 43, norm: 0.041 },
      { round: 44, norm: 0.039 }, { round: 45, norm: 0.037 }, { round: 46, norm: 0.035 }, { round: 47, norm: 0.034 },
    ],
  },
  {
    id: "c-002", name: "Client Beta", status: "uploading", datasetSize: 8700, gradientNorm: 0.0289, noiseLevel: 0.015, lastUpdate: "5s ago", pqcStatus: "secured",
    epochs: 12, currentLoss: 0.0312, pqcKeyId: "mlkem-b7d2e9", signatureAlgo: "SPHINCS+-SHA2-128f", kemAlgo: "ML-KEM-512", encryptedPackets: 44,
    lossHistory: [
      { epoch: 1, loss: 0.92 }, { epoch: 3, loss: 0.68 }, { epoch: 5, loss: 0.49 }, { epoch: 7, loss: 0.33 },
      { epoch: 9, loss: 0.19 }, { epoch: 11, loss: 0.078 }, { epoch: 12, loss: 0.031 },
    ],
    gradientHistory: [
      { round: 40, norm: 0.042 }, { round: 41, norm: 0.039 }, { round: 42, norm: 0.037 }, { round: 43, norm: 0.034 },
      { round: 44, norm: 0.032 }, { round: 45, norm: 0.031 }, { round: 46, norm: 0.030 }, { round: 47, norm: 0.029 },
    ],
  },
  {
    id: "c-003", name: "Client Gamma", status: "idle", datasetSize: 15200, gradientNorm: 0.0401, noiseLevel: 0.01, lastUpdate: "12s ago", pqcStatus: "secured",
    epochs: 18, currentLoss: 0.0189, pqcKeyId: "mlkem-c4a1f7", signatureAlgo: "SPHINCS+-SHA2-128f", kemAlgo: "ML-KEM-512", encryptedPackets: 46,
    lossHistory: [
      { epoch: 1, loss: 0.85 }, { epoch: 4, loss: 0.55 }, { epoch: 7, loss: 0.32 }, { epoch: 10, loss: 0.14 },
      { epoch: 13, loss: 0.062 }, { epoch: 16, loss: 0.028 }, { epoch: 18, loss: 0.019 },
    ],
    gradientHistory: [
      { round: 40, norm: 0.058 }, { round: 41, norm: 0.054 }, { round: 42, norm: 0.050 }, { round: 43, norm: 0.047 },
      { round: 44, norm: 0.044 }, { round: 45, norm: 0.042 }, { round: 46, norm: 0.041 }, { round: 47, norm: 0.040 },
    ],
  },
  {
    id: "c-004", name: "Client Delta", status: "training", datasetSize: 9300, gradientNorm: 0.0178, noiseLevel: 0.02, lastUpdate: "1s ago", pqcStatus: "handshake",
    epochs: 8, currentLoss: 0.0567, pqcKeyId: "mlkem-d5e8b3", signatureAlgo: "SPHINCS+-SHA2-128f", kemAlgo: "ML-KEM-512", encryptedPackets: 38,
    lossHistory: [
      { epoch: 1, loss: 0.91 }, { epoch: 2, loss: 0.74 }, { epoch: 4, loss: 0.45 }, { epoch: 6, loss: 0.21 }, { epoch: 8, loss: 0.057 },
    ],
    gradientHistory: [
      { round: 42, norm: 0.032 }, { round: 43, norm: 0.028 }, { round: 44, norm: 0.024 }, { round: 45, norm: 0.021 },
      { round: 46, norm: 0.019 }, { round: 47, norm: 0.018 },
    ],
  },
  {
    id: "c-005", name: "Client Epsilon", status: "error", datasetSize: 6100, gradientNorm: 0.8921, noiseLevel: 0.01, lastUpdate: "45s ago", pqcStatus: "pending",
    epochs: 3, currentLoss: 0.7823, pqcKeyId: "mlkem-e2f9a1", signatureAlgo: "SPHINCS+-SHA2-128f", kemAlgo: "ML-KEM-512", encryptedPackets: 12,
    lossHistory: [
      { epoch: 1, loss: 0.95 }, { epoch: 2, loss: 0.88 }, { epoch: 3, loss: 0.78 },
    ],
    gradientHistory: [
      { round: 44, norm: 0.12 }, { round: 45, norm: 0.34 }, { round: 46, norm: 0.67 }, { round: 47, norm: 0.89 },
    ],
  },
  {
    id: "c-006", name: "Client Zeta", status: "training", datasetSize: 11800, gradientNorm: 0.0315, noiseLevel: 0.012, lastUpdate: "3s ago", pqcStatus: "secured",
    epochs: 14, currentLoss: 0.0267, pqcKeyId: "mlkem-f1c3d8", signatureAlgo: "SPHINCS+-SHA2-128f", kemAlgo: "ML-KEM-512", encryptedPackets: 45,
    lossHistory: [
      { epoch: 1, loss: 0.87 }, { epoch: 3, loss: 0.59 }, { epoch: 6, loss: 0.34 }, { epoch: 9, loss: 0.12 },
      { epoch: 12, loss: 0.052 }, { epoch: 14, loss: 0.027 },
    ],
    gradientHistory: [
      { round: 40, norm: 0.049 }, { round: 41, norm: 0.045 }, { round: 42, norm: 0.042 }, { round: 43, norm: 0.039 },
      { round: 44, norm: 0.036 }, { round: 45, norm: 0.034 }, { round: 46, norm: 0.032 }, { round: 47, norm: 0.032 },
    ],
  },
];

// Extended validator data
export interface ValidatorDetail {
  id: string;
  name: string;
  stake: number;
  initialStake: number;
  reputation: number;
  status: "active" | "slashed" | "offline";
  gradientHash: string;
  anomaliesDetected: number;
  cosineSimilarity: number;
  suspicionCount: number;
  stakeHistory: { round: number; stake: number }[];
  reputationHistory: { round: number; reputation: number }[];
  slashEvents: { round: number; reason: string; amount: number }[];
  verifiedSignatures: number;
  aggregationsPerformed: number;
}

export const mockValidatorDetails: ValidatorDetail[] = [
  {
    id: "v-001", name: "Validator Node A", stake: 1000, initialStake: 1000, reputation: 0.95, status: "active",
    gradientHash: "a3f8c1d7e2b4f9a1c3e7b2d4", anomaliesDetected: 1, cosineSimilarity: 0.987, suspicionCount: 0,
    verifiedSignatures: 282, aggregationsPerformed: 47,
    stakeHistory: Array.from({ length: 10 }, (_, i) => ({ round: 38 + i, stake: 1000 })),
    reputationHistory: [
      { round: 38, reputation: 0.91 }, { round: 40, reputation: 0.92 }, { round: 42, reputation: 0.93 },
      { round: 44, reputation: 0.94 }, { round: 46, reputation: 0.95 }, { round: 47, reputation: 0.95 },
    ],
    slashEvents: [],
  },
  {
    id: "v-002", name: "Validator Node B", stake: 850, initialStake: 850, reputation: 0.91, status: "active",
    gradientHash: "b7d2e9f1a3c8d4e7b2f9a1c5", anomaliesDetected: 0, cosineSimilarity: 0.993, suspicionCount: 0,
    verifiedSignatures: 276, aggregationsPerformed: 46,
    stakeHistory: Array.from({ length: 10 }, (_, i) => ({ round: 38 + i, stake: 850 })),
    reputationHistory: [
      { round: 38, reputation: 0.88 }, { round: 40, reputation: 0.89 }, { round: 42, reputation: 0.90 },
      { round: 44, reputation: 0.90 }, { round: 46, reputation: 0.91 }, { round: 47, reputation: 0.91 },
    ],
    slashEvents: [],
  },
  {
    id: "v-003", name: "Validator Node C", stake: 200, initialStake: 800, reputation: 0.42, status: "slashed",
    gradientHash: "c1f4a7d8e2b5f9a1c3e7b2d6", anomaliesDetected: 7, cosineSimilarity: 0.341, suspicionCount: 4,
    verifiedSignatures: 189, aggregationsPerformed: 31,
    stakeHistory: [
      { round: 38, stake: 800 }, { round: 40, stake: 800 }, { round: 42, stake: 600 },
      { round: 44, stake: 400 }, { round: 46, stake: 200 }, { round: 47, stake: 200 },
    ],
    reputationHistory: [
      { round: 38, reputation: 0.78 }, { round: 40, reputation: 0.71 }, { round: 42, reputation: 0.62 },
      { round: 44, reputation: 0.53 }, { round: 46, reputation: 0.44 }, { round: 47, reputation: 0.42 },
    ],
    slashEvents: [
      { round: 42, reason: "Anomalous gradient hash — divergent from supermajority", amount: 200 },
      { round: 44, reason: "Repeated suspicion threshold exceeded", amount: 200 },
      { round: 46, reason: "Byzantine behavior detected — cosine similarity below threshold", amount: 200 },
    ],
  },
  {
    id: "v-004", name: "Validator Node D", stake: 920, initialStake: 950, reputation: 0.88, status: "active",
    gradientHash: "d5e8b3f1a2c7f9e1d4a7b3c8", anomaliesDetected: 2, cosineSimilarity: 0.972, suspicionCount: 1,
    verifiedSignatures: 268, aggregationsPerformed: 45,
    stakeHistory: [
      { round: 38, stake: 950 }, { round: 40, stake: 950 }, { round: 42, stake: 950 },
      { round: 44, stake: 920 }, { round: 46, stake: 920 }, { round: 47, stake: 920 },
    ],
    reputationHistory: [
      { round: 38, reputation: 0.85 }, { round: 40, reputation: 0.86 }, { round: 42, reputation: 0.87 },
      { round: 44, reputation: 0.86 }, { round: 46, reputation: 0.87 }, { round: 47, reputation: 0.88 },
    ],
    slashEvents: [
      { round: 44, reason: "Minor gradient deviation — warning slash", amount: 30 },
    ],
  },
];

// Extended blockchain data
export interface Block {
  round: number;
  timestamp: string;
  blockHash: string;
  prevHash: string;
  status: "finalized" | "disputed" | "pending";
  validatorVotes: { validatorId: string; vote: "agree" | "disagree"; hash: string }[];
  aggregationMethod: "median" | "trimmed_mean";
  supermajority: boolean;
  gradientNorm: number;
  participatingClients: number;
}

export const mockBlocks: Block[] = [
  {
    round: 47, timestamp: "2026-02-27 14:32:01", blockHash: "0xf8a3c7e1d2b4f9a1c3e7b2d4a5f8c1e7", prevHash: "0xd2b7a4f9e1c3d8b2f7a1c4e9d3b8f2a7",
    status: "finalized", supermajority: true, aggregationMethod: "trimmed_mean", gradientNorm: 0.0312, participatingClients: 5,
    validatorVotes: [
      { validatorId: "v-001", vote: "agree", hash: "a3f8c1...e7b2d4" },
      { validatorId: "v-002", vote: "agree", hash: "b7d2e9...f1a3c8" },
      { validatorId: "v-004", vote: "agree", hash: "d5e8b3...a2c7f1" },
    ],
  },
  {
    round: 46, timestamp: "2026-02-27 14:31:48", blockHash: "0xd2b7a4f9e1c3d8b2f7a1c4e9d3b8f2a7", prevHash: "0xe1c5b8d3f2a7c4e9d1b3f8a2c7e4d9b1",
    status: "finalized", supermajority: true, aggregationMethod: "median", gradientNorm: 0.0298, participatingClients: 5,
    validatorVotes: [
      { validatorId: "v-001", vote: "agree", hash: "a3f8c1...e7b2d4" },
      { validatorId: "v-002", vote: "agree", hash: "b7d2e9...f1a3c8" },
      { validatorId: "v-003", vote: "disagree", hash: "c1f4a7...d8e2b5" },
      { validatorId: "v-004", vote: "agree", hash: "d5e8b3...a2c7f1" },
    ],
  },
  {
    round: 45, timestamp: "2026-02-27 14:31:33", blockHash: "0xe1c5b8d3f2a7c4e9d1b3f8a2c7e4d9b1", prevHash: "0xa9f2e6c4d1b3f8a2c7e4d9b1f5a3c8e2",
    status: "disputed", supermajority: false, aggregationMethod: "trimmed_mean", gradientNorm: 0.0456, participatingClients: 6,
    validatorVotes: [
      { validatorId: "v-001", vote: "agree", hash: "a3f8c1...e7b2d4" },
      { validatorId: "v-002", vote: "disagree", hash: "b7d2e9...f1a3c8" },
      { validatorId: "v-003", vote: "disagree", hash: "c1f4a7...d8e2b5" },
      { validatorId: "v-004", vote: "agree", hash: "d5e8b3...a2c7f1" },
    ],
  },
  {
    round: 44, timestamp: "2026-02-27 14:31:19", blockHash: "0xa9f2e6c4d1b3f8a2c7e4d9b1f5a3c8e2", prevHash: "0xb3d8f1a7c2e4d9b1f5a3c8e2d7f1a4b9",
    status: "finalized", supermajority: true, aggregationMethod: "median", gradientNorm: 0.0321, participatingClients: 5,
    validatorVotes: [
      { validatorId: "v-001", vote: "agree", hash: "a3f8c1...e7b2d4" },
      { validatorId: "v-002", vote: "agree", hash: "b7d2e9...f1a3c8" },
      { validatorId: "v-004", vote: "agree", hash: "d5e8b3...a2c7f1" },
    ],
  },
  {
    round: 43, timestamp: "2026-02-27 14:31:04", blockHash: "0xb3d8f1a7c2e4d9b1f5a3c8e2d7f1a4b9", prevHash: "0xc7e1d2b4f9a1c3e7b2d4a5f8c1e7d3b9",
    status: "finalized", supermajority: true, aggregationMethod: "trimmed_mean", gradientNorm: 0.0289, participatingClients: 6,
    validatorVotes: [
      { validatorId: "v-001", vote: "agree", hash: "a3f8c1...e7b2d4" },
      { validatorId: "v-002", vote: "agree", hash: "b7d2e9...f1a3c8" },
      { validatorId: "v-003", vote: "agree", hash: "c1f4a7...d8e2b5" },
      { validatorId: "v-004", vote: "agree", hash: "d5e8b3...a2c7f1" },
    ],
  },
];

// Analytics time-series data
export const analyticsData = {
  consensusOverTime: Array.from({ length: 20 }, (_, i) => ({
    round: 28 + i,
    rate: Math.min(100, 85 + Math.random() * 15),
    validators: Math.floor(3 + Math.random() * 2),
  })),
  gradientNormOverTime: Array.from({ length: 20 }, (_, i) => ({
    round: 28 + i,
    avgNorm: 0.06 - (i * 0.0015) + (Math.random() * 0.005),
    maxNorm: 0.08 - (i * 0.001) + (Math.random() * 0.01),
    anomalyThreshold: 0.1,
  })),
  anomalyTimeline: Array.from({ length: 20 }, (_, i) => ({
    round: 28 + i,
    anomalies: i > 12 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 1.5),
    slashes: i === 14 || i === 16 || i === 18 ? 1 : 0,
  })),
  pqcOperations: Array.from({ length: 20 }, (_, i) => ({
    round: 28 + i,
    keyExchanges: Math.floor(5 + Math.random() * 3),
    signatures: Math.floor(10 + Math.random() * 5),
    verifications: Math.floor(10 + Math.random() * 5),
  })),
};
