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

        console.log('Logout - forwarding cookies:', cookies.getAll().map(c => c.name).join(', '));

        // Call backend logout to clear backend session (backend supports both GET and POST)
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { 'Cookie': cookieHeader })
            },
            credentials: "include",
        });

        console.log('Backend logout response status:', response.status);

        // Parse the JSON response from backend
        let backendData: any = {};
        try {
            backendData = await response.json();
            console.log('Backend logout response:', backendData);
        } catch (e) {
            console.warn('Could not parse backend logout response as JSON');
        }

        // Create JSON response with logout info
        const nextResponse = NextResponse.json({
            message: backendData.message || "Logged out successfully",
            logout_url: backendData.logout_url || null
        });

        // Forward any Set-Cookie headers from backend
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            nextResponse.headers.set('Set-Cookie', setCookieHeaders);
        }

        // Clear all authentication cookies on the frontend with correct path
        cookies.getAll().forEach(cookie => {
            nextResponse.cookies.delete({
                name: cookie.name,
                path: '/',
            });
        });

        console.log('Cleared all cookies on logout');

        return nextResponse;
    } catch (error) {
        console.error("Logout error:", error);

        // Create error response
        const nextResponse = NextResponse.json({
            message: "Logout failed",
            logout_url: null
        }, { status: 500 });

        // Clear all cookies with correct path even on error
        request.cookies.getAll().forEach(cookie => {
            nextResponse.cookies.delete({
                name: cookie.name,
                path: '/',
            });
        });

        return nextResponse;
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}

