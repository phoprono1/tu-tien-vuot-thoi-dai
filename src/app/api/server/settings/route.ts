import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID } from '@/lib/appwrite';

const SERVER_SETTINGS_COLLECTION = 'server_settings';

export async function GET() {
    try {
        // Get server settings
        const result = await databases.listDocuments(
            DATABASE_ID,
            SERVER_SETTINGS_COLLECTION
        );

        // Return default settings if none exist
        if (result.documents.length === 0) {
            return NextResponse.json({
                cultivationSpeedMultiplier: 5.0, // Default x5 boost
                eventName: '',
                eventDescription: '',
                eventActive: true,
                eventEndTime: null
            });
        }

        const settings = result.documents[0];
        return NextResponse.json(settings);

    } catch (error) {
        console.error('Error fetching server settings:', error);
        // Return default values if collection doesn't exist
        return NextResponse.json({
            cultivationSpeedMultiplier: 5.0,
            eventName: '',
            eventDescription: '',
            eventActive: true,
            eventEndTime: null
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate data
        const {
            cultivationSpeedMultiplier = 5.0,
            eventName = '',
            eventDescription = '',
            eventActive = true,
            eventEndTime = null
        } = data;

        // Ensure speed multiplier is reasonable (1x to 50x)
        const safeMultiplier = Math.max(1, Math.min(50, cultivationSpeedMultiplier));

        // Get existing settings
        const existing = await databases.listDocuments(
            DATABASE_ID,
            SERVER_SETTINGS_COLLECTION
        );

        const settingsData = {
            cultivationSpeedMultiplier: safeMultiplier,
            eventName,
            eventDescription,
            eventActive,
            eventEndTime,
            lastUpdated: new Date().toISOString()
        };

        let result;
        if (existing.documents.length > 0) {
            // Update existing settings
            result = await databases.updateDocument(
                DATABASE_ID,
                SERVER_SETTINGS_COLLECTION,
                existing.documents[0].$id,
                settingsData
            );
        } else {
            // Create new settings
            result = await databases.createDocument(
                DATABASE_ID,
                SERVER_SETTINGS_COLLECTION,
                'unique()',
                settingsData
            );
        }

        return NextResponse.json({
            success: true,
            message: `Server cultivation speed updated to ${safeMultiplier}x`,
            settings: result
        });

    } catch (error) {
        console.error('Error updating server settings:', error);
        return NextResponse.json({
            error: 'Failed to update server settings',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
