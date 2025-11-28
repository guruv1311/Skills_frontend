// app/consultant/services/skillMetadataService.ts
export type Specialty = {
  id: string;
  name: string;
};

export type Portfolio = {
  id: string;
  name: string;
  specialties: Specialty[];
};

export type Segment = {
  id: string;
  name: string;
  portfolios: Portfolio[];
};

export type Platform = {
  id: string;
  name: string;
  segments: Segment[];
};

export type SkillMetadata = {
  platforms: Platform[];
};

const METADATA_URL = "/api/skills/hierarchy"; // <-- adjust to your real route

export async function fetchSkillMetadata(): Promise<SkillMetadata> {
  const res = await fetch(METADATA_URL, { method: "GET" });

  if (!res.ok) {
    throw new Error(`Failed to load skill metadata: ${res.status}`);
  }

  const data = (await res.json()) as SkillMetadata;
  return data;
}

// Helper: list segments for a platform
export function getSegmentsForPlatform(
  metadata: SkillMetadata | null,
  platformId: string
): Segment[] {
  if (!metadata || !platformId) return [];
  const platform = metadata.platforms.find((p) => p.id === platformId);
  return platform?.segments ?? [];
}

// Helper: list portfolios for a segment
export function getPortfoliosForSegment(
  metadata: SkillMetadata | null,
  platformId: string,
  segmentId: string
): Portfolio[] {
  if (!metadata || !platformId || !segmentId) return [];
  const platform = metadata.platforms.find((p) => p.id === platformId);
  const segment = platform?.segments.find((s) => s.id === segmentId);
  return segment?.portfolios ?? [];
}

// Helper: list specialties for a portfolio
export function getSpecialtiesForPortfolio(
  metadata: SkillMetadata | null,
  platformId: string,
  segmentId: string,
  portfolioId: string
): Specialty[] {
  if (!metadata || !platformId || !segmentId || !portfolioId) return [];
  const platform = metadata.platforms.find((p) => p.id === platformId);
  const segment = platform?.segments.find((s) => s.id === segmentId);
  const portfolio = segment?.portfolios.find((p) => p.id === portfolioId);
  return portfolio?.specialties ?? [];
}
