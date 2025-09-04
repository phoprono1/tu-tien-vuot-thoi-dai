import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'
import { Query } from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export async function POST(request: NextRequest) {
    try {
        const { characterId, amount } = await request.json();
        console.log('🔍 Contribution API - characterId:', characterId, 'amount:', amount);

        if (!characterId || !amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Thiếu character ID hoặc số lượng linh thạch không hợp lệ' },
                { status: 400 }
            );
        }

        // Lấy thông tin character để kiểm tra linh thạch
        const characterResponse = await databases.listDocuments(
            DATABASE_ID,
            'characters',
            [Query.equal('$id', characterId)]
        );
        console.log('📊 Character Query Result:', characterResponse);

        if (characterResponse.documents.length === 0) {
            return NextResponse.json(
                { error: 'Không tìm thấy nhân vật' },
                { status: 404 }
            );
        }

        const character = characterResponse.documents[0];
        console.log('👤 Character spiritStones:', character.spiritStones);

        if (character.spiritStones < amount) {
            return NextResponse.json(
                { error: `Không đủ linh thạch. Bạn có: ${character.spiritStones.toLocaleString()}` },
                { status: 400 }
            );
        }

        // Lấy thông tin membership của character
        const membershipResponse = await databases.listDocuments(
            DATABASE_ID,
            'guild_members',
            [Query.equal('characterId', characterId)]
        );

        if (membershipResponse.documents.length === 0) {
            return NextResponse.json(
                { error: 'Bạn chưa gia nhập bang phái nào' },
                { status: 404 }
            );
        }

        const membership = membershipResponse.documents[0];

        // Lấy thông tin guild
        const guildResponse = await databases.getDocument(
            DATABASE_ID,
            'guilds',
            membership.guildId
        );
        console.log('🏰 Guild Info:', guildResponse);
        console.log('💰 Current guild treasuryFunds:', guildResponse.treasuryFunds);

        // Trừ linh thạch từ character
        console.log('⬇️ Updating character spiritStones from', character.spiritStones, 'to', character.spiritStones - amount);
        await databases.updateDocument(
            DATABASE_ID,
            'characters',
            characterId,
            {
                spiritStones: character.spiritStones - amount
            }
        );

        // Cập nhật contribution cá nhân (1 điểm = 100 linh thạch)
        const contributionPoints = Math.floor(amount / 100);
        const newContribution = (membership.contribution || 0) + contributionPoints;

        await databases.updateDocument(
            DATABASE_ID,
            'guild_members',
            membership.$id,
            {
                contribution: newContribution
            }
        );

        // Cập nhật guild treasuryFunds (linh thạch chung)
        const newTreasuryFunds = (guildResponse.treasuryFunds || 0) + amount;
        console.log('🏦 Updating guild treasuryFunds from', (guildResponse.treasuryFunds || 0), 'to', newTreasuryFunds);

        await databases.updateDocument(
            DATABASE_ID,
            'guilds',
            membership.guildId,
            {
                treasuryFunds: newTreasuryFunds
            }
        );

        console.log('✅ Success - Contribution completed');
        return NextResponse.json({
            success: true,
            donatedAmount: amount,
            contributionPoints: contributionPoints,
            totalContribution: newContribution,
            guildTreasuryFunds: newTreasuryFunds,
            characterSpiritStones: character.spiritStones - amount,
            message: `Đã góp ${amount.toLocaleString()} linh thạch (+${contributionPoints} điểm cống hiến)`
        });
    } catch (error) {
        console.error('Error adding contribution:', error);
        return NextResponse.json(
            { error: 'Không thể thêm cống hiến' },
            { status: 500 }
        );
    }
}
