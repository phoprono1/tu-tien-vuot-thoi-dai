import { create } from 'zustand';

export interface Guild {
    $id: string;
    name: string;
    description?: string;
    leaderId: string;
    memberCount: number;
    maxMembers: number;
    level: number;
    treasuryFunds: number;
    cultivationBonus: number;
    dailyReward: number;
    createdAt: string;
    lastDailyRewardTime?: string;
}

export interface GuildMember {
    $id: string;
    guildId: string;
    characterId: string;
    role: "master" | "vice_master" | "elder" | "member";
    joinedAt: string;
    contribution: number;
    lastDailyRewardClaim?: string;
}

interface GuildState {
    // Data
    guilds: Guild[];
    currentGuild: Guild | null;
    userMembership: GuildMember | null;
    guildMembers: GuildMember[];

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Actions
    setGuilds: (guilds: Guild[]) => void;
    setCurrentGuild: (guild: Guild | null) => void;
    setUserMembership: (membership: GuildMember | null) => void;
    setGuildMembers: (members: GuildMember[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Reset
    reset: () => void;
}

export const useGuildStore = create<GuildState>((set) => ({
    // Initial state
    guilds: [],
    currentGuild: null,
    userMembership: null,
    guildMembers: [],
    isLoading: false,
    error: null,

    // Actions
    setGuilds: (guilds) => set({ guilds }),
    setCurrentGuild: (guild) => set({ currentGuild: guild }),
    setUserMembership: (membership) => set({ userMembership: membership }),
    setGuildMembers: (members) => set({ guildMembers: members }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Reset
    reset: () => set({
        guilds: [],
        currentGuild: null,
        userMembership: null,
        guildMembers: [],
        isLoading: false,
        error: null,
    }),
}));
