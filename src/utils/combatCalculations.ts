import { DatabaseCharacter } from '@/types/database';
import { CombatStats, LevelScaling, CombatCalculation, CombatEffect } from '@/types/combat';

// Combat stats calculation based on character level and cultivation path
export const LEVEL_SCALING: LevelScaling = {
    baseHealthPerLevel: 50,
    baseStaminaPerLevel: 10,
    baseAttackPerLevel: 8,
    baseDefensePerLevel: 6,
    baseAgilityPerLevel: 4,

    cultivationMultipliers: {
        qi: {
            health: 1.0,    // Cân bằng
            stamina: 1.2,   // Stamina cao
            attack: 1.0,
            defense: 1.0,
            agility: 1.1,   // Nhanh nhẹn hơn
        },
        body: {
            health: 1.5,    // Máu nhiều nhất
            stamina: 0.8,   // Stamina thấp
            attack: 1.2,    // Tấn công cao
            defense: 1.4,   // Phòng thủ cao nhất
            agility: 0.7,   // Chậm nhất
        },
        demon: {
            health: 0.8,    // Máu ít nhất
            stamina: 1.0,
            attack: 1.4,    // Tấn công cao nhất
            defense: 0.8,   // Phòng thủ thấp
            agility: 1.3,   // Nhanh nhất
        }
    }
};

// Calculate base combat stats from character
export function calculateBaseCombatStats(character: DatabaseCharacter): Omit<CombatStats, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'> {
    const { level, cultivationPath } = character;
    const multipliers = LEVEL_SCALING.cultivationMultipliers[cultivationPath];

    const maxHealth = Math.floor(
        (LEVEL_SCALING.baseHealthPerLevel * level * multipliers.health) + 100
    );

    const maxStamina = Math.floor(
        (LEVEL_SCALING.baseStaminaPerLevel * level * multipliers.stamina) + character.stamina
    );

    const attack = Math.floor(
        (LEVEL_SCALING.baseAttackPerLevel * level * multipliers.attack) + 20
    );

    const defense = Math.floor(
        (LEVEL_SCALING.baseDefensePerLevel * level * multipliers.defense) + 15
    );

    const agility = Math.floor(
        (LEVEL_SCALING.baseAgilityPerLevel * level * multipliers.agility) + 10
    );

    // Base skill rates based on cultivation path
    const baseRates = getBaseCultivationRates(cultivationPath);

    return {
        characterId: character.$id,
        maxHealth,
        currentHealth: maxHealth, // Start with full health
        maxStamina,
        currentStamina: maxStamina, // Start with full stamina
        attack,
        defense,
        agility,
        ...baseRates
    };
}

// Base skill rates for each cultivation path
function getBaseCultivationRates(cultivationPath: DatabaseCharacter['cultivationPath']) {
    const baseRates = {
        qi: {
            criticalRate: 10,        // Cân bằng
            counterAttackRate: 8,
            multiStrikeRate: 5,
            lifeStealRate: 3,
            healthRegenRate: 8,
            burnRate: 5,
            poisonRate: 5,
            freezeRate: 5,
            stunRate: 8,
        },
        body: {
            criticalRate: 8,         // Ít bạo kích
            counterAttackRate: 15,   // Phản kích cao
            multiStrikeRate: 3,      // Ít liên kích
            lifeStealRate: 8,        // Hút máu tốt
            healthRegenRate: 12,     // Hồi máu cao nhất
            burnRate: 2,             // Ít skill effect
            poisonRate: 2,
            freezeRate: 2,
            stunRate: 12,            // Làm choáng tốt
        },
        demon: {
            criticalRate: 18,        // Bạo kích cao nhất
            counterAttackRate: 5,    // Ít phản kích
            multiStrikeRate: 12,     // Liên kích cao
            lifeStealRate: 15,       // Hút máu cao nhất
            healthRegenRate: 3,      // Hồi máu kém
            burnRate: 12,            // Skill effect cao
            poisonRate: 15,
            freezeRate: 8,
            stunRate: 5,
        }
    };

    return baseRates[cultivationPath];
}

// Calculate combat damage with all effects
export function calculateCombatDamage(
    attacker: CombatStats,
    defender: CombatStats,
    skillMultiplier: number = 1.0
): CombatCalculation {
    const baseDamage = Math.max(1, attacker.attack - defender.defense);
    let finalDamage = Math.floor(baseDamage * skillMultiplier);

    const effects: CombatEffect[] = [];
    let staminaCost = 20; // Base stamina cost

    // Check for critical hit
    const isCritical = Math.random() * 100 < attacker.criticalRate;
    if (isCritical) {
        finalDamage *= 2;
    }

    // Check for counter attack (defender counters)
    const isCounter = Math.random() * 100 < defender.counterAttackRate;

    // Check for multi-strike
    const isMultiStrike = Math.random() * 100 < attacker.multiStrikeRate;
    let multiStrikeCount = 1;

    if (isMultiStrike) {
        multiStrikeCount = Math.floor(Math.random() * 3) + 2; // 2-4 strikes
        finalDamage *= (1 + (multiStrikeCount - 1) * 0.3); // Each additional strike adds 30%
        staminaCost *= multiStrikeCount * 0.6; // More stamina for multi-strike
    }

    // Check for elemental effects
    if (Math.random() * 100 < attacker.burnRate) {
        effects.push({
            type: 'burn',
            duration: 3,
            value: Math.floor(finalDamage * 0.2),
            stackable: true
        });
    }

    if (Math.random() * 100 < attacker.poisonRate) {
        effects.push({
            type: 'poison',
            duration: 5,
            value: Math.floor(finalDamage * 0.15),
            stackable: true
        });
    }

    if (Math.random() * 100 < attacker.freezeRate) {
        effects.push({
            type: 'freeze',
            duration: 2,
            value: 0, // Freeze doesn't do damage, just immobilizes
            stackable: false
        });
    }

    if (Math.random() * 100 < attacker.stunRate) {
        effects.push({
            type: 'stun',
            duration: 1,
            value: 0,
            stackable: false
        });
    }

    // Life steal
    if (Math.random() * 100 < attacker.lifeStealRate) {
        effects.push({
            type: 'lifesteal',
            duration: 1,
            value: Math.floor(finalDamage * 0.25),
            stackable: false
        });
    }

    return {
        damage: Math.floor(finalDamage),
        isCritical,
        isCounter,
        isMultiStrike,
        multiStrikeCount: isMultiStrike ? multiStrikeCount : undefined,
        effects,
        staminaCost: Math.floor(staminaCost)
    };
}

// Determine recommended build based on learned skills
export function getRecommendedBuild(learnedSkills: Array<{ skillBookId: string, element: string }>): string {
    const elementCounts = learnedSkills.reduce((acc, skill) => {
        acc[skill.element] = (acc[skill.element] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dominantElement = Object.entries(elementCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

    switch (dominantElement) {
        case 'fire':
            return 'Hỏa Tu Build - Tập trung thiêu đốt và sát thương cao';
        case 'ice':
            return 'Băng Tu Build - Kiểm soát với đóng băng';
        case 'poison':
            return 'Độc Tu Build - Sát thương theo thời gian';
        case 'lightning':
            return 'Lôi Tu Build - Tốc độ và làm choáng';
        case 'physical':
            return 'Thể Tu Build - Liên kích và sức mạnh';
        default:
            return 'Cân Bằng Build - Toàn diện các kỹ năng';
    }
}

// Check if character can learn a skill book
export function canLearnSkillBook(
    character: DatabaseCharacter,
    skillBook: { element: string, rarity: string }
): { canLearn: boolean, reason?: string } {
    // Level requirements based on rarity
    const rarityRequirements = {
        common: 1,
        uncommon: 5,
        rare: 10,
        epic: 20,
        legendary: 35,
        immortal: 50
    };

    const requiredLevel = rarityRequirements[skillBook.rarity as keyof typeof rarityRequirements] || 1;

    if (character.level < requiredLevel) {
        return {
            canLearn: false,
            reason: `Cần đạt cấp ${requiredLevel} để học skill ${skillBook.rarity}`
        };
    }

    // Stamina requirements for learning
    const staminaRequired = Math.floor(requiredLevel * 10);
    if (character.stamina < staminaRequired) {
        return {
            canLearn: false,
            reason: `Cần ${staminaRequired} stamina để học skill này`
        };
    }

    return { canLearn: true };
}
