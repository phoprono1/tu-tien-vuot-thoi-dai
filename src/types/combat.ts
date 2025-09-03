// Combat system types
export interface CombatStats {
    $id: string;
    characterId: string;

    // Base stats (tăng theo level) - ĐƯỢC BUFF BỞI CÔNG PHÁP
    maxHealth: number;
    currentHealth: number;
    maxStamina: number;
    currentStamina: number;
    attack: number;
    defense: number;
    agility: number;

    // Skill rates (% - 0-100) - ĐƯỢC BUFF BỞI CÔNG KỸ
    criticalRate: number;        // Bạo kích
    counterAttackRate: number;   // Phản kích
    multiStrikeRate: number;     // Liên kích
    lifeStealRate: number;       // Hút máu
    healthRegenRate: number;     // Hồi máu
    burnRate: number;            // Thiêu đốt
    poisonRate: number;          // Độc
    freezeRate: number;          // Đóng băng
    stunRate: number;            // Làm choáng

    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

// CÔNG KỸ (SKILLS) - Buff combat rates
export interface SkillBook {
    $id: string;
    name: string;
    description: string;
    element: SkillElement;
    rarity: SkillRarity;

    // Combat Rate Bonuses (%) - buff combat stats rates
    burnRateBonus?: number;        // +% tỷ lệ thiêu đốt
    poisonRateBonus?: number;      // +% tỷ lệ hạ độc
    freezeRateBonus?: number;      // +% tỷ lệ đóng băng
    stunRateBonus?: number;        // +% tỷ lệ làm choáng
    criticalRateBonus?: number;    // +% tỷ lệ bạo kích
    counterAttackRateBonus?: number; // +% tỷ lệ phản kích
    multiStrikeRateBonus?: number; // +% tỷ lệ liên kích
    lifeStealRateBonus?: number;   // +% tỷ lệ hút máu
    healthRegenRateBonus?: number; // +% tỷ lệ hồi máu

    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

export interface LearnedSkill {
    $id: string;
    characterId: string;
    skillBookId: string;
    element: string;
    name: string;
    level: number;
    experience: number;
    learnedAt: string;

    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

export type SkillElement =
    | 'fire'
    | 'ice'
    | 'poison'
    | 'lightning'
    | 'earth'
    | 'wind'
    | 'light'
    | 'dark'
    | 'physical'
    | 'mental';

export type SkillRarity =
    | 'common'
    | 'uncommon'
    | 'rare'
    | 'epic'
    | 'legendary'
    | 'immortal';

export type CultivationBuildType =
    | 'fire_burn'      // Hỏa tu - tập trung thiêu đốt
    | 'ice_freeze'     // Băng tu - tập trung đóng băng
    | 'poison_dot'     // Độc tu - sát thương theo thời gian
    | 'lightning_stun' // Lôi tu - làm choáng
    | 'multi_strike'   // Liên kích - đánh nhiều đòn
    | 'life_steal'     // Hút máu - bền bỉ
    | 'critical'       // Bạo kích - sát thương cao
    | 'counter'        // Phản kích - defensive
    | 'balanced';      // Cân bằng

// Combat calculation utilities
export interface CombatCalculation {
    damage: number;
    isCritical: boolean;
    isCounter: boolean;
    isMultiStrike: boolean;
    multiStrikeCount?: number;
    effects: CombatEffect[];
    staminaCost: number;
}

export interface CombatEffect {
    type: 'burn' | 'poison' | 'freeze' | 'stun' | 'lifesteal' | 'regen';
    duration: number;
    value: number;
    stackable: boolean;
}

// Level scaling formulas
export interface LevelScaling {
    baseHealthPerLevel: number;
    baseStaminaPerLevel: number;
    baseAttackPerLevel: number;
    baseDefensePerLevel: number;
    baseAgilityPerLevel: number;

    // Cultivation path multipliers
    cultivationMultipliers: {
        [K in 'qi' | 'body' | 'demon']: {
            health: number;
            stamina: number;
            attack: number;
            defense: number;
            agility: number;
        }
    };
}
