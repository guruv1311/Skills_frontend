import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
    try {
        // 1. Get access token from backend using cookies
        const cookies = req.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const authRes = await fetch(`${API_URL}/auth/user`, {
            headers: {
                Cookie: cookieHeader,
            },
            cache: "no-store",
        });

        if (!authRes.ok) {
            console.warn("Manager reportees proxy: Backend auth check failed");
            return new NextResponse(null, { status: 401 });
        }

        const authData = await authRes.json();
        const accessToken = authData.access_token;
        // Use hardcoded managerId as requested by user

        // Use dynamic managerId from auth data
        // Priority: user_id (CNUM) -> email -> sub (UUID)
        // console.log("Manager reportees proxy: Full Auth User:", JSON.stringify(authData.user, null, 2));
        // console.log("Manager reportees proxy: Auth data", authData.user?.user_id);
        // const managerId = authData.user?.user_id ;
        //   if (!accessToken) {
        //     console.warn("Manager reportees proxy: No access token returned");
        // Use dynamic managerId from auth data
        // Priority: identities.uid (CNUM) -> user_id -> email -> sub (UUID)
        let managerId = authData.user?.user_id;

        if (!managerId && authData.user?.identities?.[0]?.idpUserInfo?.attributes?.uid) {
            managerId = authData.user.identities[0].idpUserInfo.attributes.uid;
        }

        if (!managerId) {
            managerId = authData.user?.email || authData.user?.sub;
        }

        console.log("Manager reportees proxy: Extracted managerId:", managerId);

        if (!accessToken || !managerId) {
            console.warn("Manager reportees proxy: No access token or user ID returned");
            return new NextResponse(null, { status: 401 });
        }

        // 2. Fetch Reportees from Backend API
        // Using the correct endpoint provided by user: 
        // /api/team/manager/{managerId}/reportees?include_skills=true&...
        //const backendUrl = `${API_URL}/api/team/manager/060170744/reportees?include_skills=true&include_projects=true&include_assets=true&include_certifications=true&include_eminence=false`;
        //const backendUrl = `${API_URL}/api/team/manager/${managerId}/reportees?include_skills=true&include_projects=true&include_assets=true&include_certifications=true&include_eminence=false`;
        // Using the correct endpoint provided by user


        // const managerId = "060170744";
        //const backendUrl = `${API_URL}/api/team/manager/003SED744/reportees?include_skills=true&include_projects=true&include_assets=true&include_certifications=true&include_eminence=true`;
        const backendUrl = `${API_URL}/api/team/manager/${managerId}/reportees?include_skills=true&include_projects=true&include_assets=true&include_certifications=true&include_eminence=false`;

        // const backendUrl = `${API_URL}/api/team/manager/${encodeURIComponent(managerId)}/reportees?include_skills=true&include_projects=true&include_assets=true&include_certifications=true&include_eminence=false`;
        console.log(`[Proxy] Fetching reportees from backend: ${backendUrl}`);

        const backendRes = await fetch(backendUrl, {
            headers: {
                Cookie: cookieHeader, // Pass cookies for auth
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!backendRes.ok) {
            console.warn(`Backend reportees fetch failed: ${backendRes.status}`);
            // Return detailed error for debugging
            return NextResponse.json({
                error: `Backend API failed with status ${backendRes.status}`,
                managerId: managerId,
                backendUrl: backendUrl
            }, { status: backendRes.status });
        }

        const backendData = await backendRes.json();
        const reporteesRaw = backendData.reportees || [];

        // 3. Map backend data to ReporteeDetail interface
        // 3. Map backend data to ReporteeDetail interface
        // 3. Map backend data to ReporteeDetail interface
        const reportees = [];

        // Use sequential loop to avoid overwhelming the backend connection pool (max 15 connections)
        for (const r of reporteesRaw) {
            // Fetch detailed skills to get IDs (missing in team endpoint)
            let detailedSkills = r.skills || [];
            try {
                const skillsRes = await fetch(`${API_URL}/api/user-skills/${r.user_id}`, {
                    headers: {
                        Cookie: cookieHeader,
                        Accept: "application/json",
                    },
                    cache: "no-store",
                });
                if (skillsRes.ok) {
                    const skillsData = await skillsRes.json();
                    // Merge ID from detailed skills into basic skills from team endpoint
                    detailedSkills = skillsData.map((s: any) => ({
                        id: s.id,
                        platform: s.platform,
                        segment: s.segment,
                        proficiency_level: s.proficiency_level,
                        skill_type: s.skill_type,
                        yoe: s.yoe,
                        status: s.status,
                        submission_date: s.date
                    }));
                }
            } catch (e) {
                console.error(`Failed to fetch skills for ${r.user_id}`, e);
            }

            reportees.push({
                userId: r.user_id,
                name: r.name,
                email: r.email,
                designation: r.user_type,
                phone: null,
                managerName: null,
                unit: null,
                avatarDataUrl: null,
                skills: detailedSkills,
                projects: r.projects || [],
                assets: r.assets || [],
                certifications: r.certifications || [],
                professional_eminence: r.professional_eminence || [],
                skills_count: r.skills_count || 0,
                projects_count: r.projects_count || 0,
                assets_count: r.assets_count || 0,
                certifications_count: r.certifications_count || 0,
                eminence_count: r.eminence_count || 0
            });
        }

        return NextResponse.json(reportees, { status: 200 });

    } catch (err) {
        console.error("Manager reportees proxy error:", err);
        return new NextResponse(null, { status: 500 });
    }
}
