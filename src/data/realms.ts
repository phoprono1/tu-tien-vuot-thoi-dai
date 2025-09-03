// Cultivation Realms System - 999 Levels Total
// Each major realm has 10 minor stages (tầng)
// Level formula: (realmIndex * 10) + stage = character level

export interface CultivationRealm {
    id: string;
    name: string;
    description: string;
    minLevel: number; // Start level of this realm
    maxLevel: number; // End level of this realm
    tribulationRequired: boolean; // Requires tribulation to advance to next realm
    qiRequirement: number; // Base qi needed for breakthrough
    spiritStoneRequirement: number;
    dangerLevel: 'Low' | 'Medium' | 'High' | 'Extreme' | 'Legendary' | 'Mythical';
    realmBonuses: {
        healthMultiplier: number;
        energyMultiplier: number;
        baseAttackBonus: number;
        baseDefenseBonus: number;
    };
}

export const CULTIVATION_REALMS: CultivationRealm[] = [
    // Levels 1-10: Mortal Foundation Realms
    {
        id: "qi_refining",
        name: "Luyện Khí",
        description: "Cảnh giới cơ bản, hấp thụ và tinh luyện khí của trời đất",
        minLevel: 1,
        maxLevel: 10,
        tribulationRequired: false,
        qiRequirement: 1000,
        spiritStoneRequirement: 100,
        dangerLevel: 'Low',
        realmBonuses: {
            healthMultiplier: 1.0,
            energyMultiplier: 1.0,
            baseAttackBonus: 0,
            baseDefenseBonus: 0,
        }
    },

    // Levels 11-20: Foundation Building
    {
        id: "foundation_building",
        name: "Trúc Cơ",
        description: "Xây dựng nền tảng tu luyện vững chắc, mở rộng kinh mạch",
        minLevel: 11,
        maxLevel: 20,
        tribulationRequired: true,
        qiRequirement: 5000,
        spiritStoneRequirement: 500,
        dangerLevel: 'Low',
        realmBonuses: {
            healthMultiplier: 1.5,
            energyMultiplier: 1.3,
            baseAttackBonus: 10,
            baseDefenseBonus: 10,
        }
    },

    // Levels 21-30: Core Formation
    {
        id: "core_formation",
        name: "Kết Đan",
        description: "Ngưng tụ kim đan trong thân, bước vào giai đoạn cao cấp",
        minLevel: 21,
        maxLevel: 30,
        tribulationRequired: true,
        qiRequirement: 15000,
        spiritStoneRequirement: 1500,
        dangerLevel: 'Medium',
        realmBonuses: {
            healthMultiplier: 2.0,
            energyMultiplier: 1.8,
            baseAttackBonus: 25,
            baseDefenseBonus: 20,
        }
    },

    // Levels 31-40: Nascent Soul
    {
        id: "nascent_soul",
        name: "Nguyên Anh",
        description: "Hình thành nguyên anh, có thể tái sinh sau khi thân thể bị hủy",
        minLevel: 31,
        maxLevel: 40,
        tribulationRequired: true,
        qiRequirement: 50000,
        spiritStoneRequirement: 5000,
        dangerLevel: 'High',
        realmBonuses: {
            healthMultiplier: 3.0,
            energyMultiplier: 2.5,
            baseAttackBonus: 50,
            baseDefenseBonus: 40,
        }
    },

    // Levels 41-50: Soul Transformation
    {
        id: "soul_transformation",
        name: "Hóa Thần",
        description: "Nguyên anh hóa thần, sức mạnh tăng vọt, có thể bay lượn tự do",
        minLevel: 41,
        maxLevel: 50,
        tribulationRequired: true,
        qiRequirement: 150000,
        spiritStoneRequirement: 15000,
        dangerLevel: 'High',
        realmBonuses: {
            healthMultiplier: 4.5,
            energyMultiplier: 3.5,
            baseAttackBonus: 100,
            baseDefenseBonus: 80,
        }
    },

    // Levels 51-60: Void Training
    {
        id: "void_training",
        name: "Luyện Hư",
        description: "Luyện thể trong hư không, thấu hiểu quy luật không gian",
        minLevel: 51,
        maxLevel: 60,
        tribulationRequired: true,
        qiRequirement: 400000,
        spiritStoneRequirement: 40000,
        dangerLevel: 'High',
        realmBonuses: {
            healthMultiplier: 6.0,
            energyMultiplier: 5.0,
            baseAttackBonus: 200,
            baseDefenseBonus: 150,
        }
    },

    // Levels 61-70: Body Integration
    {
        id: "body_integration",
        name: "Hợp Thể",
        description: "Thân thể và nguyên anh hợp nhất hoàn toàn, sức mạnh phi thường",
        minLevel: 61,
        maxLevel: 70,
        tribulationRequired: true,
        qiRequirement: 1000000,
        spiritStoneRequirement: 100000,
        dangerLevel: 'Extreme',
        realmBonuses: {
            healthMultiplier: 8.0,
            energyMultiplier: 7.0,
            baseAttackBonus: 400,
            baseDefenseBonus: 300,
        }
    },

    // Levels 71-80: Great Achievement
    {
        id: "great_achievement",
        name: "Đại Thừa",
        description: "Đạt được đại thành tựu, một bước chân vào tiên đạo",
        minLevel: 71,
        maxLevel: 80,
        tribulationRequired: true,
        qiRequirement: 2500000,
        spiritStoneRequirement: 250000,
        dangerLevel: 'Extreme',
        realmBonuses: {
            healthMultiplier: 12.0,
            energyMultiplier: 10.0,
            baseAttackBonus: 800,
            baseDefenseBonus: 600,
        }
    },

    // Levels 81-90: Pseudo Immortal
    {
        id: "pseudo_immortal",
        name: "Ngụy Tiên",
        description: "Tiên nhân giả tạo, chưa đạt tiên đạo thực sự nhưng đã vượt phàm",
        minLevel: 81,
        maxLevel: 90,
        tribulationRequired: true,
        qiRequirement: 6000000,
        spiritStoneRequirement: 600000,
        dangerLevel: 'Legendary',
        realmBonuses: {
            healthMultiplier: 18.0,
            energyMultiplier: 15.0,
            baseAttackBonus: 1500,
            baseDefenseBonus: 1200,
        }
    },

    // Levels 91-100: Scattered Immortal
    {
        id: "scattered_immortal",
        name: "Tán Tiên",
        description: "Tiên nhân tán lạc, thất bại khi thăng thiên nhưng vẫn giữ sức mạnh tiên",
        minLevel: 91,
        maxLevel: 100,
        tribulationRequired: true,
        qiRequirement: 15000000,
        spiritStoneRequirement: 1500000,
        dangerLevel: 'Legendary',
        realmBonuses: {
            healthMultiplier: 25.0,
            energyMultiplier: 22.0,
            baseAttackBonus: 3000,
            baseDefenseBonus: 2500,
        }
    },

    // Levels 101-150: True Immortal Realms Begin
    {
        id: "mysterious_immortal",
        name: "Huyền Tiên",
        description: "Tiên nhân huyền bí, nắm vững quy luật huyền môn",
        minLevel: 101,
        maxLevel: 150,
        tribulationRequired: true,
        qiRequirement: 35000000,
        spiritStoneRequirement: 3500000,
        dangerLevel: 'Legendary',
        realmBonuses: {
            healthMultiplier: 40.0,
            energyMultiplier: 35.0,
            baseAttackBonus: 6000,
            baseDefenseBonus: 5000,
        }
    },

    // Levels 151-200: Earth Immortal
    {
        id: "earth_immortal",
        name: "Địa Tiên",
        description: "Tiên nhân cai quản một vùng đất, có quyền năng thống trị",
        minLevel: 151,
        maxLevel: 200,
        tribulationRequired: true,
        qiRequirement: 80000000,
        spiritStoneRequirement: 8000000,
        dangerLevel: 'Legendary',
        realmBonuses: {
            healthMultiplier: 60.0,
            energyMultiplier: 50.0,
            baseAttackBonus: 12000,
            baseDefenseBonus: 10000,
        }
    },

    // Levels 201-250: True Immortal
    {
        id: "true_immortal",
        name: "Chân Tiên",
        description: "Tiên nhân chân chính, bất tử bất diệt, sống muôn đời",
        minLevel: 201,
        maxLevel: 250,
        tribulationRequired: true,
        qiRequirement: 180000000,
        spiritStoneRequirement: 18000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 100.0,
            energyMultiplier: 80.0,
            baseAttackBonus: 25000,
            baseDefenseBonus: 20000,
        }
    },

    // Levels 251-300: Golden Immortal
    {
        id: "golden_immortal",
        name: "Kim Tiên",
        description: "Tiên nhân kim quý, thân thể kim cang bất hoại, sức mạnh vô song",
        minLevel: 251,
        maxLevel: 300,
        tribulationRequired: true,
        qiRequirement: 400000000,
        spiritStoneRequirement: 40000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 150.0,
            energyMultiplier: 120.0,
            baseAttackBonus: 50000,
            baseDefenseBonus: 40000,
        }
    },

    // Levels 301-350: Taiyi Jade Immortal
    {
        id: "taiyi_jade_immortal",
        name: "Thái Ất Ngọc Tiên",
        description: "Tiên nhân cấp cao, nắm vững thái ất huyền pháp, quyền năng khôn lường",
        minLevel: 301,
        maxLevel: 350,
        tribulationRequired: true,
        qiRequirement: 900000000,
        spiritStoneRequirement: 90000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 250.0,
            energyMultiplier: 200.0,
            baseAttackBonus: 100000,
            baseDefenseBonus: 80000,
        }
    },

    // Levels 351-400: Daluo Golden Immortal
    {
        id: "daluo_golden_immortal",
        name: "Đại La Kim Tiên",
        description: "Đại La cảnh giới, vượt thoát thời gian và không gian, bất tử bất diệt",
        minLevel: 351,
        maxLevel: 400,
        tribulationRequired: true,
        qiRequirement: 2000000000,
        spiritStoneRequirement: 200000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 400.0,
            energyMultiplier: 300.0,
            baseAttackBonus: 200000,
            baseDefenseBonus: 150000,
        }
    },

    // Levels 401-450: Dao Ancestor
    {
        id: "dao_ancestor",
        name: "Đạo Tổ",
        description: "Tổ sư của một đạo pháp, có thể sáng tạo quy luật riêng",
        minLevel: 401,
        maxLevel: 450,
        tribulationRequired: true,
        qiRequirement: 4500000000,
        spiritStoneRequirement: 450000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 600.0,
            energyMultiplier: 500.0,
            baseAttackBonus: 400000,
            baseDefenseBonus: 300000,
        }
    },

    // Levels 451-500: Saint
    {
        id: "saint",
        name: "Thánh Nhân",
        description: "Thánh nhân vô thượng, đức hạnh cao cả, sức mạnh thiên địa",
        minLevel: 451,
        maxLevel: 500,
        tribulationRequired: true,
        qiRequirement: 10000000000,
        spiritStoneRequirement: 1000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 1000.0,
            energyMultiplier: 800.0,
            baseAttackBonus: 800000,
            baseDefenseBonus: 600000,
        }
    },

    // Levels 501-550: Primordial Saint
    {
        id: "primordial_saint",
        name: "Hồng Hoang Thánh",
        description: "Thánh nhân từ thời hồng hoang, sở hữu sức mạnh cổ xưa",
        minLevel: 501,
        maxLevel: 550,
        tribulationRequired: true,
        qiRequirement: 22000000000,
        spiritStoneRequirement: 2200000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 1500.0,
            energyMultiplier: 1200.0,
            baseAttackBonus: 1500000,
            baseDefenseBonus: 1200000,
        }
    },

    // Levels 551-600: Chaos God
    {
        id: "chaos_god",
        name: "Hỗn Độn Thần",
        description: "Thần linh từ thời hỗn độn, nắm quyền kiểm soát hỗn độn",
        minLevel: 551,
        maxLevel: 600,
        tribulationRequired: true,
        qiRequirement: 50000000000,
        spiritStoneRequirement: 5000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 2500.0,
            energyMultiplier: 2000.0,
            baseAttackBonus: 3000000,
            baseDefenseBonus: 2500000,
        }
    },

    // Levels 601-650: Creation God
    {
        id: "creation_god",
        name: "Sáng Tạo Thần",
        description: "Thần tạo hóa vạn vật, có thể sáng tạo thế giới mới",
        minLevel: 601,
        maxLevel: 650,
        tribulationRequired: true,
        qiRequirement: 100000000000,
        spiritStoneRequirement: 10000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 4000.0,
            energyMultiplier: 3000.0,
            baseAttackBonus: 6000000,
            baseDefenseBonus: 5000000,
        }
    },

    // Levels 651-700: Primordial God
    {
        id: "primordial_god",
        name: "Thái Sơ Thần",
        description: "Thần tồn tại từ trước khi vũ trụ hình thành, sức mạnh tuyệt đối",
        minLevel: 651,
        maxLevel: 700,
        tribulationRequired: true,
        qiRequirement: 220000000000,
        spiritStoneRequirement: 22000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 6000.0,
            energyMultiplier: 5000.0,
            baseAttackBonus: 12000000,
            baseDefenseBonus: 10000000,
        }
    },

    // Levels 701-750: Universal God
    {
        id: "universal_god",
        name: "Vũ Trụ Thần",
        description: "Thần cai quản cả vũ trụ, quyền năng bao la vô tận",
        minLevel: 701,
        maxLevel: 750,
        tribulationRequired: true,
        qiRequirement: 500000000000,
        spiritStoneRequirement: 50000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 10000.0,
            energyMultiplier: 8000.0,
            baseAttackBonus: 25000000,
            baseDefenseBonus: 20000000,
        }
    },

    // Levels 751-800: Eternal God
    {
        id: "eternal_god",
        name: "Vĩnh Hằng Thần",
        description: "Thần tồn tại vĩnh hằng, không bị thời gian và không gian ràng buộc",
        minLevel: 751,
        maxLevel: 800,
        tribulationRequired: true,
        qiRequirement: 1000000000000,
        spiritStoneRequirement: 100000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 15000.0,
            energyMultiplier: 12000.0,
            baseAttackBonus: 50000000,
            baseDefenseBonus: 40000000,
        }
    },

    // Levels 801-850: Omnipotent
    {
        id: "omnipotent",
        name: "Toàn Năng Giả",
        description: "Đấng toàn năng, có thể làm mọi việc, biết mọi điều",
        minLevel: 801,
        maxLevel: 850,
        tribulationRequired: true,
        qiRequirement: 2200000000000,
        spiritStoneRequirement: 220000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 25000.0,
            energyMultiplier: 20000.0,
            baseAttackBonus: 100000000,
            baseDefenseBonus: 80000000,
        }
    },

    // Levels 851-900: Transcendent
    {
        id: "transcendent",
        name: "Siêu Việt Giả",
        description: "Siêu việt mọi giới hạn, vượt thoát khỏi mọi ràng buộc",
        minLevel: 851,
        maxLevel: 900,
        tribulationRequired: true,
        qiRequirement: 5000000000000,
        spiritStoneRequirement: 500000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 40000.0,
            energyMultiplier: 30000.0,
            baseAttackBonus: 200000000,
            baseDefenseBonus: 150000000,
        }
    },

    // Levels 901-950: Origin Master
    {
        id: "origin_master",
        name: "Nguyên Thủy Chủ",
        description: "Chủ nhân của nguồn gốc vạn vật, điều khiển mọi quy luật cơ bản",
        minLevel: 901,
        maxLevel: 950,
        tribulationRequired: true,
        qiRequirement: 10000000000000,
        spiritStoneRequirement: 1000000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 60000.0,
            energyMultiplier: 50000.0,
            baseAttackBonus: 400000000,
            baseDefenseBonus: 300000000,
        }
    },

    // Levels 951-999: The One
    {
        id: "the_one",
        name: "Duy Nhất Giả",
        description: "Tồn tại duy nhất tuyệt đối, không có gì có thể so sánh",
        minLevel: 951,
        maxLevel: 999,
        tribulationRequired: true,
        qiRequirement: 50000000000000,
        spiritStoneRequirement: 5000000000000,
        dangerLevel: 'Mythical',
        realmBonuses: {
            healthMultiplier: 100000.0,
            energyMultiplier: 80000.0,
            baseAttackBonus: 1000000000,
            baseDefenseBonus: 800000000,
        }
    }
];

// Helper functions
export function getRealmByLevel(level: number): CultivationRealm | null {
    return CULTIVATION_REALMS.find(realm =>
        level >= realm.minLevel && level <= realm.maxLevel
    ) || null;
}

export function getRealmStage(level: number): number {
    const realm = getRealmByLevel(level);
    if (!realm) return 1;
    return level - realm.minLevel + 1;
}

export function getNextBreakthroughLevel(currentLevel: number): number | null {
    const currentRealm = getRealmByLevel(currentLevel);
    if (!currentRealm) return null;

    // If at max level of current realm, next breakthrough is to next realm
    if (currentLevel === currentRealm.maxLevel) {
        const nextRealm = CULTIVATION_REALMS.find(realm =>
            realm.minLevel > currentRealm.maxLevel
        );
        return nextRealm ? nextRealm.minLevel : null;
    }

    // Otherwise, next breakthrough is next level in same realm
    return currentLevel + 1;
}

export interface BreakthroughRequirements {
    level: number;
    qiRequired: number;
    spiritStonesRequired: number;
    tribulationRequired: boolean;
    isRealmBreakthrough: boolean;
}

export function canBreakthrough(
    currentLevel: number,
    currentQi: number,
    spiritStones: number
): { canBreak: boolean; requirements: BreakthroughRequirements | null } {
    const nextLevel = getNextBreakthroughLevel(currentLevel);
    if (!nextLevel) return { canBreak: false, requirements: null };

    const nextRealm = getRealmByLevel(nextLevel);
    if (!nextRealm) return { canBreak: false, requirements: null };

    const currentRealm = getRealmByLevel(currentLevel);
    const isRealmBreakthrough = nextRealm.id !== currentRealm?.id;

    const requirements = {
        level: nextLevel,
        qiRequired: isRealmBreakthrough ? nextRealm.qiRequirement : Math.floor(nextRealm.qiRequirement * 0.1),
        spiritStonesRequired: isRealmBreakthrough ? nextRealm.spiritStoneRequirement : Math.floor(nextRealm.spiritStoneRequirement * 0.1),
        tribulationRequired: isRealmBreakthrough && nextRealm.tribulationRequired,
        isRealmBreakthrough
    };

    const canBreak = currentQi >= requirements.qiRequired &&
        spiritStones >= requirements.spiritStonesRequired;

    return { canBreak, requirements };
}

export function getRealmDisplayName(level: number): string {
    const realm = getRealmByLevel(level);
    const stage = getRealmStage(level);

    if (!realm) return `Level ${level}`;

    return `${realm.name} Tầng ${stage}`;
}
