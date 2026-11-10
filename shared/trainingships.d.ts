/** Types for shared/trainingships.js (the Trainingships page's content). */

export interface TrainingshipTrack {
  id: string;
  name: string;
  description: string;
}

export interface TrainingshipsConfig {
  open: boolean;
  intake: string;
  deadline: string;
  duration: string;
  format: string;
  commitment: string;
  intro: string;
  tracks: TrainingshipTrack[];
  highlights: { title: string; description: string }[];
  requirements: string[];
  faqs: { question: string; answer: string }[];
  closedMessage: string;
}

export type ApplicationStatus = "new" | "reviewing" | "shortlisted" | "accepted" | "declined";

export const DEFAULT_TRAININGSHIPS: TrainingshipsConfig;
export const CURRENT_STATUSES: string[];
export const APPLICATION_STATUSES: ApplicationStatus[];
