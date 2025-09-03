export interface Trial {
    $id?: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'nightmare';
    minLevel: number;
    maxLevel: number;
    minRealm: string;
    maxRealm: string;
    enemyStats: {
        health: number;
        attack: number;
        defense: number;
        agility: number;
        criticalRate: number;
        counterAttackRate: number;
        dodgeRate: number;
        burnRate: number;
        poisonRate: number;
        freezeRate: number;
        stunRate: number;
    };
    rewards: {
        experience: number;
        qi: number;
        spiritStones: number;
        items?: Array<{
            itemId: string;
            chance: number; // 0-100
            quantity: number;
        }>;
    };
    cooldownMinutes: number; // Thời gian reset
    energyCost: number;
    enabled: boolean;
}

export interface TrialAttempt {
    $id?: string;
    characterId: string;
    trialId: string;
    result: 'victory' | 'defeat';
    combatLog: CombatTurn[];
    rewardsGained?: {
        experience: number;
        qi: number;
        spiritStones: number;
        items: Array<{
            itemId: string;
            quantity: number;
        }>;
    };
    attemptTime: string;
    nextAttemptTime: string;
}

export interface PvPRanking {
    $id?: string;
    characterId: string;
    characterName: string;
    level: number;
    realm: string;
    combatPower: number;
    rankingPoints: number;
    rank: number;
    wins: number;
    losses: number;
    winRate: number;
    highestRank: number;
    season: string;
    lastBattleTime: string;
}

export interface PvPMatch {
    $id?: string;
    challengerId: string;
    defenderId: string;
    result: 'challenger_win' | 'defender_win' | 'draw';
    combatLog: CombatTurn[];
    pointsChanged: {
        challenger: number; // +/- points
        defender: number;   // +/- points
    };
    matchTime: string;
    season: string;
}

export interface CombatTurn {
    turnNumber: number;
    attacker: {
        id: string;
        name: string;
        health: number;
        stamina: number;
        buffs: CombatEffect[];
        debuffs: CombatEffect[];
    };
    defender: {
        id: string;
        name: string;
        health: number;
        stamina: number;
        buffs: CombatEffect[];
        debuffs: CombatEffect[];
    };
    action: CombatAction;
    effects: CombatTurnEffect[];
    message: string;
}

export interface CombatAction {
    type: 'attack' | 'skill' | 'defend' | 'skip';
    damage?: number;
    isCritical?: boolean;
    isCounterAttack?: boolean;
    isMultiStrike?: boolean;
    multiStrikeCount?: number;
    isDodged?: boolean;
    staminaCost: number;
}

export interface CombatTurnEffect {
    type: 'burn' | 'poison' | 'freeze' | 'stun' | 'heal' | 'lifesteal' | 'regen';
    value: number;
    stacks: number;
    duration: number;
    targetId: string;
}

export interface CombatEffect {
    type: 'burn' | 'poison' | 'freeze' | 'stun' | 'heal_regen' | 'attack_boost' | 'defense_boost' | 'agility_boost';
    value: number;
    stacks: number;
    remainingTurns: number;
    stackable: boolean;
}

export interface CombatResult {
    winner: 'attacker' | 'defender' | 'draw';
    turns: number;
    finalStats: {
        attacker: {
            health: number;
            stamina: number;
        };
        defender: {
            health: number;
            stamina: number;
        };
    };
    combatLog: CombatTurn[];
}
