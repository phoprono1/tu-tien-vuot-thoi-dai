import { NextRequest, NextResponse } from "next/server";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";

export async function POST(request: NextRequest) {
  try {
    const { characterId, activityType, energyCost, activityData = null } = await request.json();

    if (!characterId || !activityType || !energyCost) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current character
    const character = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.CHARACTERS,
      characterId
    );

    // Calculate energy regeneration since last update
    const now = new Date();
    const lastEnergyRegen = character.lastEnergyRegen
      ? new Date(character.lastEnergyRegen)
      : new Date(character.$createdAt);

    const hoursPassedSinceRegen = (now.getTime() - lastEnergyRegen.getTime()) / (1000 * 60 * 60);
    const energyToRegenerate = Math.floor(hoursPassedSinceRegen * 10); // 10 energy per hour

    // Calculate current energy with regeneration
    let currentEnergy = Math.min(character.energy + energyToRegenerate, character.maxEnergy);

    // Check if enough energy
    if (currentEnergy < energyCost) {
      return NextResponse.json(
        {
          error: "Not enough energy",
          required: energyCost,
          current: currentEnergy,
          maxEnergy: character.maxEnergy,
          nextRegenTime: new Date(now.getTime() + (60 * 60 * 1000)) // Next hour
        },
        { status: 400 }
      );
    }

    // Consume energy
    currentEnergy -= energyCost;

    // Update character energy and regen time
    const updatedCharacter = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CHARACTERS,
      characterId,
      {
        energy: currentEnergy,
        lastEnergyRegen: now.toISOString()
      }
    );

    // Log energy activity
    await databases.createDocument(
      DATABASE_ID,
      "energy_activities",
      ID.unique(),
      {
        characterId,
        activityType,
        energyCost,
        timestamp: now.toISOString(),
        activityData: activityData ? JSON.stringify(activityData) : null
      }
    );

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      energyUsed: energyCost,
      currentEnergy,
      message: `Consumed ${energyCost} energy for ${activityType}`
    });

  } catch (error) {
    console.error("Energy consumption error:", error);
    return NextResponse.json(
      { error: "Failed to consume energy" },
      { status: 500 }
    );
  }
}
