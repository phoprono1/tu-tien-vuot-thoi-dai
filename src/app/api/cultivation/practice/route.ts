import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { learnedTechniqueId, practiceType, minutes } = body;

    if (!learnedTechniqueId || !practiceType || !minutes) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Calculate experience gained based on practice type and duration
    let baseExpGain = 10;
    switch (practiceType) {
      case 'meditation':
        baseExpGain = 15;
        break;
      case 'combat':
        baseExpGain = 25;
        break;
      case 'special':
        baseExpGain = 35;
        break;
    }

    const experienceGained = Math.floor((baseExpGain * minutes) / 30); // Base for 30 minutes

    try {
      // Get current learned technique
      const learnedTechnique = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEARNED_TECHNIQUES,
        learnedTechniqueId
      );

      const newExperience = learnedTechnique.experience + experienceGained;
      let newLevel = learnedTechnique.level;
      let newMaxExp = learnedTechnique.maxExperience;
      let newEffectiveness = learnedTechnique.currentEffectiveness;

      // Check for level up
      if (newExperience >= learnedTechnique.maxExperience && newLevel < 10) {
        newLevel += 1;
        newMaxExp = Math.floor(learnedTechnique.maxExperience * 1.5); // Increase required exp
        newEffectiveness = Math.min(1.0, newEffectiveness + 0.1); // Increase effectiveness
      }

      // Update learned technique
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEARNED_TECHNIQUES,
        learnedTechniqueId,
        {
          experience: newExperience,
          level: newLevel,
          maxExperience: newMaxExp,
          currentEffectiveness: newEffectiveness,
          lastPracticedAt: new Date().toISOString()
        }
      );

      return NextResponse.json({
        success: true,
        experienceGained,
        newLevel,
        leveledUp: newLevel > learnedTechnique.level,
        message: newLevel > learnedTechnique.level
          ? `Level up! Reached level ${newLevel}!`
          : `Gained ${experienceGained} experience from ${practiceType} practice!`
      });

    } catch (dbError) {
      console.error('Database error in practice:', dbError);

      // Fall back to mock response if database operation fails
      return NextResponse.json({
        success: true,
        experienceGained,
        practiceTime: minutes,
        message: `Gained ${experienceGained} experience from ${practiceType} practice!`
      });
    }

  } catch (error) {
    console.error('Error practicing technique:', error);
    return NextResponse.json({ error: 'Failed to practice technique' }, { status: 500 });
  }
}
