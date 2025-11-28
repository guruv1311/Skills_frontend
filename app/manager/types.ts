// app/manager/types.ts

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
  team?: Array<any> | null;
  [k: string]: any;
};

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
