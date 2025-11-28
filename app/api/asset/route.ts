import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    // Get the user_id from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get all cookies from the incoming request to forward to backend
    const cookies = request.cookies;
    const cookieHeader = cookies.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('Fetching assets for user:', userId);

    // Fetch assets from the backend
    const response = await fetch(`${API_URL}/api/assets/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for authentication
        ...(cookieHeader && { 'Cookie': cookieHeader })
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Backend asset fetch failed:', response.status, response.statusText);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - please log in' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch assets from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get all cookies from the incoming request to forward to backend
    const cookies = request.cookies;
    const cookieHeader = cookies.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('Creating asset:', body);

    const response = await fetch(`${API_URL}/api/assets/`, {
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
      console.error('Backend asset creation failed:', response.status, text);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

