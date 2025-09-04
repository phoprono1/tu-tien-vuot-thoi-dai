import { NextRequest, NextResponse } from "next/server";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const characterId = url.searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json(
        { error: "Missing characterId" },
        { status: 400 }
      );
    }

    // Get current character
    const character = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CHARACTERS,
      characterId
    );

    const now = new Date();
    const lastEnergyRegen = character.lastEnergyRegen
      ? new Date(character.lastEnergyRegen)
      : new Date(character.$createdAt);

    // Calculate energy regeneration since last update
    const hoursPassedSinceRegen = (now.getTime() - lastEnergyRegen.getTime()) / (1000 * 60 * 60);
    const energyToRegenerate = Math.floor(hoursPassedSinceRegen * 10); // 10 energy per hour

    // Calculate current energy with regeneration
    const currentEnergy = Math.min(character.energy + energyToRegenerate, character.maxEnergy);

    // Only update if energy changed
    let updatedCharacter = character;
    if (energyToRegenerate > 0 && character.energy < character.maxEnergy) {
      updatedCharacter = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHARACTERS,
        characterId,
        {
          energy: currentEnergy,
          lastEnergyRegen: now.toISOString()
        }
      );
    }

    // Calculate next regen info
    const nextRegenTime = new Date(now.getTime() + (60 * 60 * 1000)); // Next hour
    const minutesUntilNextRegen = Math.ceil((nextRegenTime.getTime() - now.getTime()) / (1000 * 60));

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      currentEnergy,
      maxEnergy: character.maxEnergy,
      energyRegenerated: energyToRegenerate,
      nextRegenTime,
      minutesUntilNextRegen,
      regenRate: "10 energy/hour"
    });

  } catch (error) {
    console.error("Energy regen error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate energy" },
      { status: 500 }
    );
  }
}
