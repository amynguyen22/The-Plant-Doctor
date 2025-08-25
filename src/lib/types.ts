export interface DiagnosisResult {
  issue: string;
  confidence: number; // 0..1
  reasons: string[];
  actions: string[];
  urgency?: "low" | "medium" | "high";
}

export interface CaseRecord {
  id: string;
  createdAt: number;
  plantName: string;
  plantType: string;
  environment: string;
  notes: string;
  imageUrl?: string; // session-only preview (not persisted)
  thumbUrl?: string; // persisted tiny thumbnail
  symptoms: string[];
  toggles: Record<string, boolean>;
  moistureLevel: number;
  lightLevel: number;
  results: DiagnosisResult[];
}