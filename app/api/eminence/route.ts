import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        const cookies = request.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        console.log('Fetching professional eminence for user:', userId);

        const response = await fetch(`${API_URL}/api/professional-eminence/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Backend eminence fetch failed:', response.status, response.statusText);
            if (response.status === 401) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.json(
                { error: 'Failed to fetch eminence data' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error fetching eminence:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const cookies = request.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        console.log('Creating professional eminence:', body);

        const response = await fetch(`${API_URL}/api/professional-eminence/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Backend eminence creation failed:', response.status, text);
            return NextResponse.json(
                { error: `Backend error: ${response.status} ${text}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Error creating eminence:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
