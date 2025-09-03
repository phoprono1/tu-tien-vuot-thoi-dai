import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SECRET_KEY } from '@/lib/admin';

export async function POST(request: NextRequest) {
    try {
        const { secretKey } = await request.json();

        if (!secretKey) {
            return NextResponse.json(
                { success: false, error: 'Secret key is required' },
                { status: 400 }
            );
        }

        if (secretKey !== ADMIN_SECRET_KEY) {
            return NextResponse.json(
                { success: false, error: 'Invalid secret key' },
                { status: 401 }
            );
        }

        // Create response with success
        const response = NextResponse.json(
            { success: true, message: 'Admin authenticated successfully' },
            { status: 200 }
        );

        // Set HTTP-only cookie for server-side validation (if needed later)
        response.cookies.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Admin auth error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const response = NextResponse.json(
            { success: true, message: 'Admin logged out successfully' },
            { status: 200 }
        );

        // Clear the admin session cookie
        response.cookies.delete('admin_session');

        return response;
    } catch (error) {
        console.error('Admin logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
