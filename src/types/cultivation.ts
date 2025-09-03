// Cultivation Techniques system types - CÔNG PHÁP (buff base stats & cultivation speed)
// 
// PHÂN BIỆT:
// - CÔNG PHÁP (CultivationTechnique): Buff stats cơ bản, tốc độ tu luyện, đột phá
// - CÔNG KỸ (SkillBook): Buff tỷ lệ combat như burnRate, criticalRate, multiStrikeRate
//
export interface CultivationTechnique {
    $id: string;
    name: string;
    description: string;
    category: TechniqueCategory;
    rarity: TechniqueRarity;

    // Requirements
    minLevel: number;
    cultivationPath?: 'qi' | 'body' | 'demon' | 'all'; // null = tất cả path

    // Technique costs (JSON string format)
    costs: string; // JSON: { qi: number, spiritStones: number, stamina: number }

    // Passive effects (JSON string format) - buff BASE STATS & cultivation
    effects: string; // JSON with these possible properties:
    /* 
    {
        // Base Combat Stats Buffs (flat numbers or %)
        attackBonus?: number;     // +X hoặc +X% attack
        defenseBonus?: number;    // +X hoặc +X% defense  
        healthBonus?: number;     // +X hoặc +X% max health
        staminaBonus?: number;    // +X hoặc +X% max stamina
        agilityBonus?: number;    // +X hoặc +X% agility

        // Cultivation Bonuses
        qiGainMultiplier?: number;        // +X% tốc độ tu luyện qi
        expGainMultiplier?: number;       // +X% tốc độ tăng exp
        breakthroughChanceBonus?: number; // +X% chance đột phá
        cultivationSpeedBonus?: number;   // +X% tốc độ tu luyện tổng thể
        
        // Resource Bonuses  
        staminaRegenBonus?: number;       // +X% hồi stamina
        spiritStoneGainBonus?: number;    // +X% thu thập spirit stone
        
        // Special Effects
        tribulationResistanceBonus?: number; // +X% kháng thiên kiếp
        realmStabilityBonus?: number;     // +X% ổn định cảnh giới
    }
    */

    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

export interface LearnedTechnique {
    $id: string;
    characterId: string;
    techniqueId: string;

    // Progression
    level: number; // 1-10 levels per technique
    experience: number;
    maxExperience: number;

    // Learning info
    learnedAt: string;
    lastPracticedAt: string;

    // Current effectiveness (based on level)
    currentEffectiveness: number; // 0.1 - 1.0 multiplier

    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

export type TechniqueCategory =
    | 'offense'      // Công kích - buff attack, crit, multi-strike
    | 'defense'      // Phòng thủ - buff defense, health, counter  
    | 'elemental'    // Ngũ hành - buff elemental effects (burn, poison, freeze)
    | 'cultivation'  // Tu luyện - buff qi gain, breakthrough chance
    | 'utility'      // Tiện ích - buff stamina, speed, regen
    | 'forbidden';   // Tà thuật - powerful but risky techniques

export type TechniqueRarity =
    | 'mortal'       // Phàm cấp
    | 'spiritual'    // Linh cấp  
    | 'earth'        // Địa cấp
    | 'heaven'       // Thiên cấp
    | 'immortal'     // Tiên cấp
    | 'divine';      // Thần cấp

// For practice/upgrade system
export interface TechniquePractice {
    techniqueId: string;
    characterId: string;
    practiceType: 'meditation' | 'combat' | 'special';
    experienceGained: number;
    practiceTime: number; // minutes
    staminaCost: number;
}
