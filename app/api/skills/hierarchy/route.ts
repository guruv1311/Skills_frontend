import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(req: NextRequest) {
    try {
        const cookies = req.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const res = await fetch(`${API_URL}/api/skills/`, {
            headers: { Cookie: cookieHeader },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch skills metadata:", res.status);
            return NextResponse.json([], { status: res.status });
        }

        const flatSkills = await res.json();

        // Transform flat list to nested structure
        const platformsMap = new Map<string, any>();

        flatSkills.forEach((skill: any) => {
            const pName = skill.platform;
            const sName = skill.segment;
            const ppName = skill.product_portfolio;
            const spName = skill.speciality_area;
            const skillId = skill.skill_id;

            if (!platformsMap.has(pName)) {
                platformsMap.set(pName, {
                    id: pName,
                    name: pName,
                    segmentsMap: new Map<string, any>(),
                });
            }
            const pObj = platformsMap.get(pName);

            if (!pObj.segmentsMap.has(sName)) {
                pObj.segmentsMap.set(sName, {
                    id: sName,
                    name: sName,
                    portfoliosMap: new Map<string, any>(),
                });
            }
            const sObj = pObj.segmentsMap.get(sName);

            if (!sObj.portfoliosMap.has(ppName)) {
                sObj.portfoliosMap.set(ppName, {
                    id: ppName,
                    name: ppName,
                    specialties: [],
                });
            }
            const ppObj = sObj.portfoliosMap.get(ppName);

            ppObj.specialties.push({
                id: spName, // Using name as ID for specialty to match frontend expectations
                name: spName,
                skill_id: skillId,
            });
        });

        // Convert Maps to Arrays
        const platforms = Array.from(platformsMap.values()).map((p: any) => ({
            id: p.id,
            name: p.name,
            segments: Array.from(p.segmentsMap.values()).map((s: any) => ({
                id: s.id,
                name: s.name,
                portfolios: Array.from(s.portfoliosMap.values()).map((pp: any) => ({
                    id: pp.id,
                    name: pp.name,
                    specialties: pp.specialties,
                })),
            })),
        }));

        return NextResponse.json({ platforms });
    } catch (err) {
        console.error("Skills hierarchy proxy error:", err);
        return NextResponse.json([], { status: 500 });
    }
}
