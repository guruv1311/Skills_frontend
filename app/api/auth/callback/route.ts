import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const error = searchParams.get('error');

        console.log('Callback received - error:', error);

        // If there's an error from OAuth provider or backend
        if (error) {
            console.error('OAuth/Auth error:', error);
            return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
        }

    
        console.log('No error in callback, redirecting to home');
        return NextResponse.redirect(new URL("/", request.url));

    } catch (error) {
        console.error('Error in auth callback:', error);
        return NextResponse.redirect(
            new URL("/login?error=callback_failed", request.url)
        );
    }
}
