import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";
export async function GET(request: NextRequest) {
    try {
        // Get all cookies from the incoming request
        const cookies = request.cookies;
        // Collect all cookies to forward to backend
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
        console.log('User route - forwarding cookies:', cookies.getAll().map(c => c.name).join(', '));
        // Forward the request to the backend
        const response = await fetch(`${API_URL}/auth/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Forward all cookies to the backend
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            credentials: 'include',
        });
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Backend returned non-JSON response:', response.status);
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }
        const data = await response.json();
        // If backend returns 401, pass it through
        if (response.status === 401) {
            console.log('User not authenticated');
            return NextResponse.json(data, { status: 401 });
        }
        console.log('User authenticated:', data.user?.email || 'unknown');
        // Create response with user data
        const nextResponse = NextResponse.json(data, { status: response.status });
        // Forward any Set-Cookie headers from backend to frontend
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            nextResponse.headers.set('Set-Cookie', setCookieHeader);
        }
        return nextResponse;
    } catch (error) {
        console.error('Error proxying /auth/user:', error);
        return NextResponse.json(
            { error: 'Failed to check authentication' },
            { status: 500 }
        );
    }
}
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('POST /api/auth/user - Request body:', JSON.stringify(body, null, 2));
        const cookies = request.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
        const backendUrl = `${API_URL}/api/users/`;
        console.log(`Forwarding POST request to: ${backendUrl}`);
        // Forward the request to the backend
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            body: JSON.stringify(body),
        });
        console.log(`Backend response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Backend response body: ${responseText}`);
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse backend response as JSON');
            return NextResponse.json(
                { error: 'Invalid response from backend', details: responseText },
                { status: 502 }
            );
        }
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST /api/users/:', error);
        return NextResponse.json(
            { error: 'Failed to create user', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

