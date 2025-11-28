export type ProfileSummary = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
  designation?: string | null;
  phone?: string | null;
  manager?: string | null;
  Unit?: string | null;
  role?: string | null;
  avatar?: string | null;
  [k: string]: any;
};

export type SkillForm = {
  platformId: string;
  platformName?: string;
  segmentId: string;
  segmentName?: string;
  portfolioId: string;
  portfolioName?: string;
  specialtyId: string;
  specialtyName?: string;
  skillId?: number;
  proficiency: "beginner" | "intermediate" | "expert";
  years: string;
  status?: "draft" | "added" | "submitted";
  skillType?: "primary" | "secondary";
};

export type ProjectForm = {
  name: string;
  client: string;
  technology: string;
  role: string;
  description: string;
  isFoak: boolean;
  assetUsed: "yes" | "no" | "";
  assetName: string;
  status?: "draft" | "submitted";
  projectId: string;
  contribution: string;
  assetDescription: string;
  assetLink: string;
  estimatedHours: string;
};

export type CertificationEntry = {
  id: string;
  type: "professional" | "product" | "";
  name: string;
  issueDate: string;
  fileName: string;
  fileDataUrl?: string;
  status: "draft" | "submitted";
};

export interface AssetForm {
  name: string;
  description: string;
  usedInProject: "yes" | "no" | "";
  aiAdoption: "yes" | "no" | "";
  yourContribution: string;
  status?: "draft" | "submitted";
}

// Professional Eminence form
export interface ProfessionalEminenceForm {
  url: string;
  eminenceType:
  | "Thought Leadership"
  | "Speaking Engagements"
  | "Awards & Recognitions"
  | "Patents / Innovations"
  | "Community Contributions"
  | "";
  description: string; // limit to ~200 chars in UI
  scope: "IBM Internal" | "External" | "Both" | "";
  status?: "draft" | "submitted";
}

export interface YourLearningCredentialSummary {
  indexID: number;
  sourceId: string | null;
  credentialTypeId: string | null;
  updatedTimestamp: string | null;
  isActive: boolean;
  presentationTypeId: string | null;
  title: string | null;
  iconUrl: string | null;
  description: string | null;
  level: string | null;
}

export type PendingForm =
  | { id: string; kind: "skill"; payload: SkillForm; createdAt: string }
  | { id: string; kind: "project"; payload: ProjectForm; createdAt: string }
  | {
    id: string;
    kind: "certification";
    payload: CertificationEntry;
    createdAt: string;
  }
  | { id: string; kind: "asset"; payload: AssetForm; createdAt: string }
  | {
    id: string;
    kind: "professionalEminence";
    payload: ProfessionalEminenceForm;
    createdAt: string;
  };
