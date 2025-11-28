import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(request: NextRequest) {
    try {
        console.log('Initiating login - redirecting to backend');

        // Get all cookies from the incoming request to maintain session
        const cookies = request.cookies;
        const cookieHeader = cookies.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        const loginUrl = `${API_URL}/auth/login`;

        console.log('Redirecting to backend login:', loginUrl);

        // Create a response that redirects to backend login
        const response = NextResponse.redirect(loginUrl, 307);

        // Forward cookies to maintain session state
        if (cookieHeader) {
            response.headers.set('Cookie', cookieHeader);
        }

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.redirect(
            new URL("/login?error=login_failed", request.url)
        );
    }
}


