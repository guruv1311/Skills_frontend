import { use } from "react";
import { YourLearningCredentialSummary } from "../types";

const YOURLEARNING_BASE = "https://api.yourlearning.ibm.com/v3/ibm";

// --- add near top of file (above GET) ---
type TokenCache = {
  token: string | null;
  expiresAt: number; // epoch ms
};

// very small in-memory cache (works for a single server instance; suitable for short-lived tokens)
const _ylTokenCache: TokenCache = { token: null, expiresAt: 0 };

async function getYourLearningToken(): Promise<string> {
  // if cached and not expired, return it
  const now = Date.now();
  if (_ylTokenCache.token && _ylTokenCache.expiresAt > now + 5000) {
    return _ylTokenCache.token;
  }

  // 1. Check for hardcoded token in env first
  const envToken = process.env.YOURLEARNING_BEARER_TOKEN;
  if (envToken) {
    const bearer = envToken.startsWith("Bearer ") ? envToken : `Bearer ${envToken}`;
    // Cache it indefinitely or for a long time since it's hardcoded
    _ylTokenCache.token = bearer;
    _ylTokenCache.expiresAt = now + 1000 * 60 * 60 * 24; // 24 hours
    return bearer;
  }

  const authUrl = "https://yourlearning.ibm.com/developers/api/auth/user";

  try {
    const res = await fetch(authUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    console.log("Return of value form yourlearning api: ", res);
    if (!res.ok) {
      // if endpoint fails, try env fallback or throw
      if (envToken)
        return envToken.startsWith("Bearer ") ? envToken : `Bearer ${envToken}`;
      const body = await res.text().catch(() => "<no body>");
      throw new Error(
        `YourLearning auth endpoint returned ${res.status}: ${body}`
      );
    }

    const j = await res.json();
    // try to read token from common locations
    // common result: { jwt: "..." } or { token: "..." }
    const raw = (j?.jwt ?? j?.token ?? j?.access_token ?? "") as string;
    console.log("yl response value: ", raw);
    if (!raw) {
      if (envToken)
        return envToken.startsWith("Bearer ") ? envToken : `Bearer ${envToken}`;
      throw new Error(
        "YourLearning auth response did not contain a token (jwt/token/access_token)."
      );
    }

    // normalize to "Bearer <token>"
    const bearer = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

    // set a conservative expiry (if server doesn't tell us). If the API returns expiry, use it.
    // Look for common fields like expires_in (seconds) or expiresAt in response
    let ttlSeconds = 60 * 10; // default 10 minutes
    if (typeof j.expires_in === "number")
      ttlSeconds = Math.max(30, j.expires_in - 5);
    if (typeof j.ttl === "number") ttlSeconds = j.ttl;

    _ylTokenCache.token = bearer;
    _ylTokenCache.expiresAt = Date.now() + ttlSeconds * 1000;

    return bearer;
  } catch (err) {
    // final fallback to env var
    if (envToken)
      return envToken.startsWith("Bearer ") ? envToken : `Bearer ${envToken}`;
    throw err;
  }
}

function getYourLearningAuthHeader(): string {
  const rawToken = process.env.YOURLEARNING_BEARER_TOKEN;

  if (!rawToken) {
    throw new Error("Missing YOURLEARNING_BEARER_TOKEN env var");
  }

  return rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;
}

/*
 * Fetches the main YourLearning user profile (Credly userInfo).
 */

export async function fetchYourLearningUserInfo(
  talentID: string
): Promise<any> {
  const url = `${YOURLEARNING_BASE}/credly/userInfo?learnerCNUM=${encodeURIComponent(
    talentID
  )}&detail=full`;

  //   const authHeader = getYourLearningAuthHeader();
  const authHeader = await getYourLearningToken();

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
  });

  //   console.log("YourLearning userInfo response object:", res);

  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(`YourLearning userInfo returned ${res.status}: ${body}`);
  }

  const data = await res.json();
  //   console.log(
  //     "YourLearning userInfo JSON response:",
  //     JSON.stringify(data, null, 2)
  //   );
  return data;
}

// function mapYourLearningCredentialDetail(
//   data: any
// ): YourLearningCredentialSummary {
//   return {
//     sourceId: data?.data?.sourceId ?? null,
//     credentialTypeId: data?.data?.credentialTypeId ?? null,
//     updatedTimestamp: data?.data?.updatedTimestamp ?? null,
//     isActive: Boolean(data?.data?.isActive),
//     presentationTypeId: data?.data?.presentationTypeId ?? null,
//     title: data?.data?.language?.en?.title ?? null,
//     iconUrl: data?.data?.iconUrl ?? null,
//     description: data?.data?.language?.en?.description ?? null,
//     level: data?.data?.sourceAttributes?.level ?? null,
//   };
// }
function mapYourLearningCredentialDetail(
  data: any,
  index: number
): YourLearningCredentialSummary {
  // Helper function to process the timestamp
  const getFormattedTimestamp = (
    timestampString: string | null
  ): string | null => {
    if (!timestampString) {
      return null;
    }

    // Create a Date object from the ISO 8601 string (e.g., '2025-09-24T14:19:33Z')
    const dateObj = new Date(timestampString);

    // Extract parts, ensuring two digits (padStart)
    const day = String(dateObj.getDate()).padStart(2, "0");
    // Month is 0-indexed (0=Jan, 11=Dec), so we add 1
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const originalTimestamp = data?.data?.updatedTimestamp ?? null;
  return {
    indexID: index,
    sourceId: data?.data?.sourceId ?? null,
    credentialTypeId: data?.data?.credentialTypeId ?? null,
    updatedTimestamp: getFormattedTimestamp(originalTimestamp),
    isActive: Boolean(data?.data?.isActive),
    presentationTypeId: data?.data?.presentationTypeId ?? null,
    title: data?.data?.language?.en?.title ?? null,
    iconUrl: data?.data?.iconUrl ?? null,
    description: data?.data?.language?.en?.description ?? null,
    level: data?.data?.sourceAttributes?.level ?? null,
  };
}

export async function fetchYourLearningCredentialDetail(
  badgeTemplateId: string,
  index: number
): Promise<YourLearningCredentialSummary> {
  const credentialId = `CREDLY-${badgeTemplateId}`;
  const url = `${YOURLEARNING_BASE}/credentials/${encodeURIComponent(
    credentialId
  )}?detail=full`;

  const authHeader = getYourLearningAuthHeader();

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
  });

  //   console.log(`YourLearning credential(${credentialId}) response:`, res);

  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(
      `YourLearning credential ${credentialId} returned ${res.status}: ${body}`
    );
  }

  const data = await res.json();
  //   console.log(
  //     `YourLearning credential(${credentialId}) JSON:`,
  //     JSON.stringify(data, null, 2)
  //   );
  return mapYourLearningCredentialDetail(data, index);
}

export async function fetchYourLearningWithBadges(talentID: string): Promise<{
  userInfo: any;
  badgeTemplateIds: string[];
  credentials: YourLearningCredentialSummary[];
}> {
  const userInfo = await fetchYourLearningUserInfo(talentID);

  const orgBadges: any[] = userInfo?.data?.organizationBadges ?? [];

  const badgeTemplateIds = Array.from(
    new Set(
      orgBadges
        .map((b) => b?.badge_template?.id ?? b?.batch_template?.id ?? null)
        .filter((id: string | null): id is string => !!id)
    )
  );
  //   console.log("Extracted badge template IDs:", badgeTemplateIds);
  if (badgeTemplateIds.length === 0) {
    return {
      userInfo,
      badgeTemplateIds: [],
      credentials: [],
    };
  }

  const credentialPromises = badgeTemplateIds.map((id, index) =>
    fetchYourLearningCredentialDetail(id, index).catch((err) => {
      console.error(
        `Failed to fetch credential summary for badgeTemplateId=${id}:`,
        err
      );
      return null;
    })
  );

  const credentialsRaw = await Promise.all(credentialPromises);
  const credentials = credentialsRaw.filter(
    (c): c is YourLearningCredentialSummary => c !== null
  );

  return {
    userInfo,
    badgeTemplateIds,
    credentials,
  };
}
