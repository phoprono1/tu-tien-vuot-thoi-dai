import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'tu-tien-vuot-thoi-dai');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { client };

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'tu-tien-database';
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users';
export const CHARACTERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CHARACTERS_COLLECTION_ID || 'characters';
export const COLLECTIONS = {
    USERS: 'users',
    CHARACTERS: 'characters',
    CULTIVATION_PATHS: 'cultivation-paths',
    ITEMS: 'items',
    BATTLES: 'battles',
    GUILDS: 'guilds',
    GUILD_MEMBERS: 'guild_members',
    SECTS: 'sects',
    TRIBULATIONS: 'tribulations',
    CULTIVATION_TECHNIQUES: 'cultivation_techniques',
    LEARNED_TECHNIQUES: 'learned_techniques',
    COMBAT_STATS: 'combat_stats',
    SKILL_BOOKS: 'skill_books',
    LEARNED_SKILLS: 'learned_skills',
    CHAT_MESSAGES: 'chat_messages',
    ENERGY_ACTIVITIES: 'energy_activities'
} as const;
