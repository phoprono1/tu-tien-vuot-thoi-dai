import { NextResponse } from 'next/server';

// Simple endpoint to get only the count
export async function GET() {
    try {
        // In a real app, this would query Redis or database
        // For now, we'll import the count from the presence API
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/chat/presence`, {
            method: 'GET',
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
                success: true,
                count: data.onlineCount
            });
        }

        return NextResponse.json({
            success: true,
            count: 0
        });

    } catch (error) {
        console.error('❌ Error getting online count:', error);
        return NextResponse.json({
            success: true,
            count: 0
        });
    }
}
