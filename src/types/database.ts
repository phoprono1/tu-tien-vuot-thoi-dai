// Types for database collections
export interface DatabaseCharacter {
    $id: string;
    userId: string;
    name: string;
    level: number;
    realm: string;
    stage: number;
    cultivationPath: 'qi' | 'body' | 'demon';
    experience: number;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    spiritualPower: number;
    maxSpiritualPower: number;
    physicalPower: number;
    mentalPower: number;
    spiritualQi: number;
    qi: number;
    stamina: number;
    spiritStones: number;
    tribulationResistance: number;
    cultivationProgress: number;
    nextBreakthrough: number;
    killCount?: number;
    lastCultivationUpdate: string; // Để tính toán auto cultivation
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}

export interface DatabaseUser {
    $id: string;
    userId: string;
    username: string;
    email: string;
    level: number;
    experience: number;
    lastLogin: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $databaseId: string;
    $collectionId: string;
}
