// Types for Tu Tien Game
export interface Player {
    $id: string;
    username: string;
    email: string;
    level: number;
    experience: number;
    createdAt: string;
    lastLogin: string;
}

export interface Character {
    $id: string;
    playerId: string;
    name: string;
    cultivationPath: CultivationPath;
    realm: string;
    stage: number;

    // Stats
    health: number;
    maxHealth: number;

    // Cultivation specific
    spiritualQi: number;
    tribulationResistance: number;
    killCount?: number; // For demon cultivation

    // Progress
    cultivationProgress: number;
    nextBreakthrough: number;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface CombatStats {
    $id: string;
    characterId: string;

    // Health & Stamina
    maxHealth: number;
    currentHealth: number;
    maxStamina: number;
    currentStamina: number;

    // Core Combat Stats
    attack: number;
    defense: number;
    agility: number;

    // Combat Rate Stats (percentages)
    criticalRate: number;
    counterAttackRate: number;
    multiStrikeRate: number;
    lifeStealRate: number;
    healthRegenRate: number;

    // Status Effect Rates
    burnRate: number;
    poisonRate: number;
    freezeRate: number;
    stunRate: number;
}

export type CultivationPath = 'qi' | 'body' | 'demon';

export interface CultivationRealm {
    id: string;
    name: string;
    stages: number;
    path: CultivationPath;
    requirements: {
        spiritualQi: number;
        tribulationChance: number;
        tribulationStrength: number;
    };
    bonuses: {
        healthMultiplier: number;
        specialAbilities?: string[];
    };
}

export interface Item {
    $id: string;
    name: string;
    type: 'weapon' | 'armor' | 'pill' | 'artifact' | 'material';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'immortal';
    description: string;
    stats?: {
        attack?: number;
        defense?: number;
        qi?: number;
        healthBonus?: number;
    };
    requirements?: {
        minLevel: number;
        cultivationPath?: CultivationPath;
        minRealm?: string;
    };
}

export interface Battle {
    $id: string;
    attackerId: string;
    defenderId: string;
    result: 'victory' | 'defeat' | 'draw';
    experienceGained: number;
    itemsDropped: string[];
    battleLog: string[];
    timestamp: string;
}

export interface Guild {
    $id: string;
    name: string;
    leaderId: string;
    members: string[];
    level: number;
    territory?: string;
    description: string;
    requirements: {
        minLevel: number;
        minRealm?: string;
    };
    createdAt: string;
}

// Re-export cultivation technique types
export type {
    CultivationTechnique,
    LearnedTechnique,
    TechniqueCategory,
    TechniqueRarity,
    TechniquePractice
} from './cultivation';
