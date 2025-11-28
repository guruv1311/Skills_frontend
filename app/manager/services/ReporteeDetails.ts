// app/manager/services/ReporteeDetails.ts

export interface ReporteeDetail {
  userId: string;
  name: string;
  designation: string | null;
  phone: string | null;
  managerName: string | null;
  unit: string | null;
  email: string | null;
  avatarDataUrl: string | null;
  skills?: any[];
  projects?: any[];
  assets?: any[];
  certifications?: any[];
  professional_eminence?: any[];
  skills_count?: number;
  projects_count?: number;
  assets_count?: number;
  certifications_count?: number;
  eminence_count?: number;
}

export interface ManagerStats {
  manager: any;
  summary: {
    total_reportees: number;
    reportees_in_system: number;
    total_assets: number;
    total_skills: number;
    total_projects: number;
    total_certifications: number;
    total_eminence_records: number;
    reportee_ids: string[];
  };
}

export interface ManagerCertifications {
  manager: any;
  reportee_count: number;
  total_certifications: number;
  certifications_by_reportee: any[];
  certifications_by_type: any[];
  certifications_by_category: any[];
}

/**
 * Fetches the combined profile and image data for all direct reportees of a manager.
 * Uses the Next.js proxy route /api/manager/reportees to avoid CORS and handle authentication.
 */
export const fetchAllReporteeDetails = async (): Promise<ReporteeDetail[]> => {
  try {
    const res = await fetch("/api/manager/reportees", {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Reportees API failed with status", res.status, errorData);
      return [];
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching reportee details:", err);
    return [];
  }
};

export const fetchManagerStats = async (): Promise<ManagerStats | null> => {
  try {
    const res = await fetch("/api/manager/stats", { cache: "no-store" });
    if (!res.ok) {
      console.error("Manager stats API failed:", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching manager stats:", err);
    return null;
  }
};

export const fetchManagerCertifications = async (): Promise<ManagerCertifications | null> => {
  try {
    const res = await fetch("/api/manager/certifications", { cache: "no-store" });
    if (!res.ok) {
      console.error("Manager certifications API failed:", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching manager certifications:", err);
    return null;
  }
};

export const fetchProfileCompletion = async (): Promise<number> => {
  try {
    const res = await fetch("/api/profilePercentage", { cache: "no-store" });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.percentage || 0;
  } catch (err) {
    console.error("Error fetching profile completion:", err);
    return 0;
  }
};

export interface RequestDecision {
  manager_id: string;
  user_id: string;
  submission_date: string;
  status: string;
  request_data: string;
  section_type: string;
  item_name?: string; // Added for API requirements
}

export const submitRequestDecision = async (decision: RequestDecision): Promise<boolean> => {
  try {
    const { section_type, status, request_data, item_name } = decision;
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(request_data);
    } catch (e) {
      console.error("Failed to parse request_data", e);
      return false;
    }

    const id = parsedData.id;
    if (!id) {
      console.error("No ID found in request_data");
      return false;
    }

    let url = "";
    let body: any = { status };

    switch (section_type.toLowerCase()) {
      case "skill":
        url = `/api/user-skills/${id}`;
        body.proficiency_level = parsedData.proficiency;
        break;
      case "project":
        url = `/api/projects/${id}`;
        body.project_name = item_name;
        break;
      case "asset":
        url = `/api/assets/${id}`;
        body.asset_name = item_name;
        break;
      case "certification":
        url = `/api/user-cert/${id}`;
        break;
      case "eminence":
        url = `/api/eminence/${id}`;
        break;
      default:
        console.error("Unknown section type:", section_type);
        return false;
    }

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Submit ${section_type} decision failed:`, res.status, errorData);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error submitting request decision:", err);
    return false;
  }
};

// Mock function kept for reference if needed, but currently unused
export async function fetchMockReporteeDetails(
  managerEmail: string,
  bearerToken: string
): Promise<ReporteeDetail[]> {
  return fetchAllReporteeDetails();
}

