import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'
import { Query } from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Chi phí nâng cấp guild theo level
const UPGRADE_COSTS = {
    1: 0,           // Level 1 (start)
    2: 100000,      // 100k linh thạch
    3: 250000,      // 250k linh thạch
    4: 500000,      // 500k linh thạch
    5: 1000000,     // 1M linh thạch
    6: 2000000,     // 2M linh thạch
    7: 5000000,     // 5M linh thạch
    8: 10000000,    // 10M linh thạch
    9: 25000000,    // 25M linh thạch
    10: 50000000,   // 50M linh thạch (max level)
};

// Lợi ích mỗi level guild
const GUILD_BENEFITS = {
    1: { maxMembers: 10, dailyReward: 1000, description: "Bang phái cơ bản" },
    2: { maxMembers: 15, dailyReward: 2000, description: "Bang phái mở rộng" },
    3: { maxMembers: 20, dailyReward: 3500, description: "Bang phái phát triển" },
    4: { maxMembers: 30, dailyReward: 5500, description: "Bang phái hưng thịnh" },
    5: { maxMembers: 40, dailyReward: 8000, description: "Bang phái lớn mạnh" },
    6: { maxMembers: 50, dailyReward: 12000, description: "Bang phái uy danh" },
    7: { maxMembers: 75, dailyReward: 18000, description: "Bang phái danh tiếng" },
    8: { maxMembers: 100, dailyReward: 25000, description: "Bang phái quyền lực" },
    9: { maxMembers: 150, dailyReward: 35000, description: "Bang phái thống trị" },
    10: { maxMembers: 200, dailyReward: 50000, description: "Bang phái tối thượng" },
};

export async function POST(request: NextRequest) {
    try {
        const { characterId, guildId } = await request.json();

        if (!characterId || !guildId) {
            return NextResponse.json(
                { error: 'Thiếu character ID hoặc guild ID' },
                { status: 400 }
            );
        }

        // Kiểm tra membership và quyền
        const membershipResponse = await databases.listDocuments(
            DATABASE_ID,
            'guild_members',
            [
                Query.equal('characterId', characterId),
                Query.equal('guildId', guildId)
            ]
        );

        if (membershipResponse.documents.length === 0) {
            return NextResponse.json(
                { error: 'Bạn không thuộc bang phái này' },
                { status: 403 }
            );
        }

        const membership = membershipResponse.documents[0];

        if (membership.role !== 'master') {
            return NextResponse.json(
                { error: 'Chỉ có Tông Chủ mới có thể nâng cấp bang phái' },
                { status: 403 }
            );
        }

        // Lấy thông tin guild hiện tại
        const guild = await databases.getDocument(DATABASE_ID, 'guilds', guildId);
        const currentLevel = guild.level || 1;
        const currentFund = guild.treasuryFunds || 0;
        const nextLevel = currentLevel + 1;

        if (nextLevel > 10) {
            return NextResponse.json(
                { error: 'Bang phái đã đạt cấp độ tối đa (10)' },
                { status: 400 }
            );
        }

        const upgradeCost = UPGRADE_COSTS[nextLevel as keyof typeof UPGRADE_COSTS];

        if (currentFund < upgradeCost) {
            return NextResponse.json(
                {
                    error: `Không đủ linh thạch chung. Cần: ${upgradeCost.toLocaleString()}, có: ${currentFund.toLocaleString()}`,
                    required: upgradeCost,
                    current: currentFund,
                    missing: upgradeCost - currentFund
                },
                { status: 400 }
            );
        }

        // Thực hiện nâng cấp
        const newFund = currentFund - upgradeCost;
        const newBenefits = GUILD_BENEFITS[nextLevel as keyof typeof GUILD_BENEFITS];

        await databases.updateDocument(
            DATABASE_ID,
            'guilds',
            guildId,
            {
                level: nextLevel,
                treasuryFunds: newFund,
                maxMembers: newBenefits.maxMembers,
                dailyReward: newBenefits.dailyReward
            }
        );

        return NextResponse.json({
            success: true,
            newLevel: nextLevel,
            newFund: newFund,
            upgradeCost: upgradeCost,
            newBenefits: newBenefits,
            message: `🎉 Bang phái nâng cấp thành công lên cấp ${nextLevel}!`
        });

    } catch (error) {
        console.error('Error upgrading guild:', error);
        return NextResponse.json(
            { error: 'Không thể nâng cấp bang phái' },
            { status: 500 }
        );
    }
}

// GET để xem thông tin nâng cấp
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const guildId = url.searchParams.get('guildId');

        if (!guildId) {
            return NextResponse.json(
                { error: 'Thiếu guild ID' },
                { status: 400 }
            );
        }

        const guild = await databases.getDocument(DATABASE_ID, 'guilds', guildId);
        const currentLevel = guild.level || 1;
        const currentFund = guild.treasuryFunds || 0;
        const nextLevel = currentLevel + 1;

        if (nextLevel > 10) {
            return NextResponse.json({
                currentLevel,
                currentFund,
                maxLevel: true,
                benefits: GUILD_BENEFITS[currentLevel as keyof typeof GUILD_BENEFITS]
            });
        }

        const upgradeCost = UPGRADE_COSTS[nextLevel as keyof typeof UPGRADE_COSTS];
        const nextBenefits = GUILD_BENEFITS[nextLevel as keyof typeof GUILD_BENEFITS];

        return NextResponse.json({
            currentLevel,
            currentFund,
            nextLevel,
            upgradeCost,
            canUpgrade: currentFund >= upgradeCost,
            currentBenefits: GUILD_BENEFITS[currentLevel as keyof typeof GUILD_BENEFITS],
            nextBenefits,
            allLevels: GUILD_BENEFITS
        });

    } catch (error) {
        console.error('Error getting upgrade info:', error);
        return NextResponse.json(
            { error: 'Không thể lấy thông tin nâng cấp' },
            { status: 500 }
        );
    }
}
