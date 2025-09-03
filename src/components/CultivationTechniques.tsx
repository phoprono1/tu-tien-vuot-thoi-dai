import React, { useState, useEffect } from "react";
import {
  Book,
  Zap,
  Shield,
  Flame,
  Droplets,
  Snowflake,
  Heart,
  Swords,
  Star,
  Lock,
  CheckCircle,
  Timer,
  AlertTriangle,
} from "lucide-react";
import {
  CultivationTechnique,
  LearnedTechnique,
  TechniqueCategory,
  TechniqueRarity,
} from "@/types/game";
import { useAPICache } from "@/hooks/useOptimization";

interface CultivationTechniquesProps {
  characterId: string;
  characterLevel: number;
  cultivationPath: "qi" | "body" | "demon";
  currentQi: number;
  spiritStones: number;
  stamina: number;
  onTechniqueUpdate?: () => void; // Callback when techniques are learned or practiced
}

const CultivationTechniques: React.FC<CultivationTechniquesProps> = ({
  characterId,
  characterLevel,
  cultivationPath,
  currentQi,
  spiritStones,
  stamina,
  onTechniqueUpdate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    TechniqueCategory | "all"
  >("all");
  const [selectedTechnique, setSelectedTechnique] =
    useState<CultivationTechnique | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [availableTechniques, setAvailableTechniques] = useState<
    CultivationTechnique[]
  >([]);

  // Helper functions to parse JSON strings
  const parseCosts = (costs: string | undefined | null) => {
    try {
      if (!costs || typeof costs !== "string") {
        return { qi: 0, spiritStones: 0, stamina: 0 };
      }
      return JSON.parse(costs);
    } catch {
      return { qi: 0, spiritStones: 0, stamina: 0 };
    }
  };

  const parseEffects = (effects: string | undefined | null) => {
    try {
      if (!effects || typeof effects !== "string") {
        return {};
      }
      return JSON.parse(effects);
    } catch {
      return {};
    }
  };
  const [learnedTechniques, setLearnedTechniques] = useState<
    LearnedTechnique[]
  >([]);
  const [loading, setLoading] = useState(true);

  // API cache for techniques
  const techniqueCache = useAPICache(
    `cultivation-techniques-${cultivationPath}`,
    () => fetchAvailableTechniques(cultivationPath),
    { cacheTime: 300000 } // 5 minutes
  );

  // API cache for learned techniques
  const learnedCache = useAPICache(
    `learned-techniques-${characterId}`,
    () => fetchLearnedTechniques(characterId),
    { cacheTime: 60000 } // 1 minute
  );

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [techniques, learned] = await Promise.all([
          techniqueCache.getCachedData(),
          learnedCache.getCachedData(),
        ]);
        setAvailableTechniques(techniques);
        setLearnedTechniques(learned);
      } catch (error) {
        console.error("Error loading cultivation data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [characterId, cultivationPath, techniqueCache, learnedCache]);

  const categories: Array<{
    id: TechniqueCategory | "all";
    name: string;
    icon: React.ReactNode;
  }> = [
    { id: "all", name: "Tất cả", icon: <Book className="w-4 h-4" /> },
    { id: "offense", name: "Công kích", icon: <Swords className="w-4 h-4" /> },
    { id: "defense", name: "Phòng thủ", icon: <Shield className="w-4 h-4" /> },
    { id: "elemental", name: "Ngũ hành", icon: <Flame className="w-4 h-4" /> },
    { id: "cultivation", name: "Tu luyện", icon: <Star className="w-4 h-4" /> },
    { id: "utility", name: "Tiện ích", icon: <Zap className="w-4 h-4" /> },
    {
      id: "forbidden",
      name: "Tà thuật",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  ];

  const filteredTechniques = availableTechniques.filter(
    (technique: CultivationTechnique) => {
      if (selectedCategory === "all") return true;
      return technique.category === selectedCategory;
    }
  );

  const getRarityName = (
    rarity: TechniqueRarity | undefined | null
  ): string => {
    const names = {
      mortal: "Phàm cấp",
      spiritual: "Linh cấp",
      earth: "Địa cấp",
      heaven: "Thiên cấp",
      immortal: "Tiên cấp",
      divine: "Thần cấp",
    };
    return names[rarity as TechniqueRarity] || "Phàm cấp"; // Default to mortal
  };

  const getCategoryIcon = (
    category: TechniqueCategory | undefined | null
  ): React.ReactNode => {
    switch (category) {
      case "offense":
        return <Swords className="w-4 h-4" />;
      case "defense":
        return <Shield className="w-4 h-4" />;
      case "elemental":
        return <Flame className="w-4 h-4" />;
      case "cultivation":
        return <Star className="w-4 h-4" />;
      case "utility":
        return <Zap className="w-4 h-4" />;
      case "forbidden":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />; // Default icon
    }
  };

  const isLearnedTechnique = (
    techniqueId: string
  ): LearnedTechnique | undefined => {
    return learnedTechniques.find(
      (learned: LearnedTechnique) => learned.techniqueId === techniqueId
    );
  };

  const canLearnTechnique = (technique: CultivationTechnique): boolean => {
    try {
      // Check level requirement
      if (characterLevel < (technique.minLevel || 1)) return false;

      // Check cultivation path
      if (
        technique.cultivationPath &&
        technique.cultivationPath !== "all" &&
        technique.cultivationPath !== cultivationPath
      ) {
        return false;
      }

      // Check resources
      const costs = parseCosts(technique.costs);
      if (currentQi < (costs.qi || 0)) return false;
      if (spiritStones < (costs.spiritStones || 0)) return false;
      if (stamina < (costs.stamina || 0)) return false;

      // Check if already learned
      if (isLearnedTechnique(technique.$id)) return false;

      return true;
    } catch (error) {
      console.error("Error checking if technique can be learned:", error);
      return false;
    }
  };

  const handleLearnTechnique = async (technique: CultivationTechnique) => {
    setIsLearning(true);
    try {
      const costs = parseCosts(technique.costs);
      await learnTechnique(characterId, technique.$id, costs);
      // Refresh learned techniques
      const learned = await learnedCache.forceRefresh();
      setLearnedTechniques(learned);
      setSelectedTechnique(null);
      // Notify parent component to refresh cultivation rate
      onTechniqueUpdate?.();
    } catch (error) {
      console.error("Error learning technique:", error);
    } finally {
      setIsLearning(false);
    }
  };

  const handlePracticeTechnique = async (
    learnedTechnique: LearnedTechnique
  ) => {
    setIsPracticing(true);
    try {
      await practiceTechnique(learnedTechnique.$id, "meditation", 30); // 30 minutes practice
      // Refresh learned techniques
      const learned = await learnedCache.forceRefresh();
      setLearnedTechniques(learned);
      // Notify parent component to refresh cultivation rate (effectiveness might have changed)
      onTechniqueUpdate?.();
    } catch (error) {
      console.error("Error practicing technique:", error);
    } finally {
      setIsPracticing(false);
    }
  };

  const renderEffects = (
    technique: CultivationTechnique,
    learnedTechnique?: LearnedTechnique
  ) => {
    try {
      const effectiveness = learnedTechnique?.currentEffectiveness || 1.0;
      const effects = [];
      const techniqueEffects = parseEffects(technique.effects);

      console.log("Rendering effects for:", technique.name);
      console.log("Raw effects string:", technique.effects);
      console.log("Parsed effects:", techniqueEffects);

      // Combat stats
      if (techniqueEffects.attackBonus && techniqueEffects.attackBonus > 0) {
        effects.push(
          <div
            key="attack"
            className="flex items-center gap-2 text-sm text-red-400"
          >
            <Swords className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.attackBonus * effectiveness)}% Công
              kích
            </span>
          </div>
        );
      }

      if (techniqueEffects.defenseBonus && techniqueEffects.defenseBonus > 0) {
        effects.push(
          <div
            key="defense"
            className="flex items-center gap-2 text-sm text-blue-400"
          >
            <Shield className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.defenseBonus * effectiveness)}%
              Phòng thủ
            </span>
          </div>
        );
      }

      if (techniqueEffects.healthBonus && techniqueEffects.healthBonus > 0) {
        effects.push(
          <div
            key="health"
            className="flex items-center gap-2 text-sm text-green-400"
          >
            <Heart className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.healthBonus * effectiveness)}% Máu
            </span>
          </div>
        );
      }

      // Special effects
      if (
        techniqueEffects.burnRateBonus &&
        techniqueEffects.burnRateBonus > 0
      ) {
        effects.push(
          <div
            key="burn"
            className="flex items-center gap-2 text-sm text-orange-400"
          >
            <Flame className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.burnRateBonus * effectiveness)}%
              Thiêu đốt
            </span>
          </div>
        );
      }

      if (
        techniqueEffects.poisonRateBonus &&
        techniqueEffects.poisonRateBonus > 0
      ) {
        effects.push(
          <div
            key="poison"
            className="flex items-center gap-2 text-sm text-green-500"
          >
            <Droplets className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.poisonRateBonus * effectiveness)}%
              Độc
            </span>
          </div>
        );
      }

      if (
        techniqueEffects.freezeRateBonus &&
        techniqueEffects.freezeRateBonus > 0
      ) {
        effects.push(
          <div
            key="freeze"
            className="flex items-center gap-2 text-sm text-blue-500"
          >
            <Snowflake className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.freezeRateBonus * effectiveness)}%
              Đóng băng
            </span>
          </div>
        );
      }

      // Cultivation bonuses
      if (
        techniqueEffects.qiGainMultiplier &&
        techniqueEffects.qiGainMultiplier > 0
      ) {
        effects.push(
          <div
            key="qi-gain"
            className="flex items-center gap-2 text-sm text-purple-400"
          >
            <Star className="w-3 h-3" />
            <span>
              +{Math.round(techniqueEffects.qiGainMultiplier * effectiveness)}%
              Tốc độ tu luyện
            </span>
          </div>
        );
      }

      console.log("Final effects array length:", effects.length);

      // If no effects, show a default message
      if (effects.length === 0) {
        effects.push(
          <div key="no-effects" className="text-sm text-gray-400">
            Không có hiệu ứng đặc biệt
          </div>
        );
      }

      return effects.slice(0, 3); // Show max 3 effects
    } catch (error) {
      console.error("Error rendering effects:", error);
      return [
        <div key="error" className="text-sm text-gray-400">
          Lỗi hiển thị hiệu ứng
        </div>,
      ];
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-white">Đang tải công pháp...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Công Pháp Tu Luyện</h2>
        <div className="text-sm text-gray-300">
          Đã học: {learnedTechniques?.length || 0} công pháp
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              selectedCategory === category.id
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Techniques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechniques.map((technique: CultivationTechnique) => {
          const learned = isLearnedTechnique(technique.$id);
          const canLearn = canLearnTechnique(technique);

          return (
            <div
              key={technique.$id}
              className={`bg-gray-800 rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-lg hover:bg-gray-750 ${
                learned ? "border-green-500 bg-green-900/20" : "border-gray-600"
              } ${
                selectedTechnique?.$id === technique.$id
                  ? "ring-2 ring-purple-400"
                  : ""
              }`}
              onClick={() => setSelectedTechnique(technique)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-purple-400">
                    {getCategoryIcon(technique.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {technique.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {getRarityName(technique.rarity)}
                    </p>
                  </div>
                </div>
                {learned ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : !canLearn ? (
                  <Lock className="w-5 h-5 text-gray-500" />
                ) : null}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {technique.description}
              </p>

              {/* Effects */}
              <div className="space-y-1 mb-3">
                {renderEffects(technique, learned)}
              </div>

              {/* Learned technique info */}
              {learned && (
                <div className="bg-gray-700 rounded p-2 mb-3 border border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">
                      Cấp độ: {learned.level}/10
                    </span>
                    <span className="text-green-400">
                      {Math.round(learned.currentEffectiveness * 100)}% hiệu quả
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all"
                      style={{
                        width: `${
                          (learned.experience / learned.maxExperience) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {!learned && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Yêu cầu:</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={
                        characterLevel >= technique.minLevel
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      Cấp {technique.minLevel}
                    </span>
                    {(() => {
                      const costs = parseCosts(technique.costs);
                      return (
                        <>
                          {costs.qi > 0 && (
                            <span
                              className={
                                currentQi >= costs.qi
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {costs.qi} Qi
                            </span>
                          )}
                          {costs.spiritStones > 0 && (
                            <span
                              className={
                                spiritStones >= costs.spiritStones
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {costs.spiritStones} Linh thạch
                            </span>
                          )}
                          {costs.stamina > 0 && (
                            <span
                              className={
                                stamina >= costs.stamina
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {costs.stamina} Thể lực
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Technique Detail Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-purple-400">
                    {getCategoryIcon(selectedTechnique.category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedTechnique.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-purple-400">
                        {getRarityName(selectedTechnique.rarity)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-300">
                        Cấp {selectedTechnique.minLevel || 1}+
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">Mô tả</h3>
                <p className="text-gray-300">{selectedTechnique.description}</p>
              </div>

              {/* All Effects */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">Hiệu ứng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {renderEffects(
                    selectedTechnique,
                    isLearnedTechnique(selectedTechnique.$id)
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {(() => {
                  const learned = isLearnedTechnique(selectedTechnique.$id);

                  if (learned) {
                    return (
                      <button
                        onClick={() => handlePracticeTechnique(learned)}
                        disabled={isPracticing || stamina < 20}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isPracticing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Đang rèn luyện...</span>
                          </>
                        ) : (
                          <>
                            <Timer className="w-4 h-4" />
                            <span>Rèn luyện (20 Thể lực)</span>
                          </>
                        )}
                      </button>
                    );
                  }

                  if (canLearnTechnique(selectedTechnique)) {
                    return (
                      <button
                        onClick={() => handleLearnTechnique(selectedTechnique)}
                        disabled={isLearning}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLearning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Đang học...</span>
                          </>
                        ) : (
                          <>
                            <Book className="w-4 h-4" />
                            <span>Học công pháp</span>
                          </>
                        )}
                      </button>
                    );
                  }

                  return (
                    <div className="flex-1 bg-gray-700 text-gray-400 py-2 px-4 rounded-lg text-center">
                      Không đủ điều kiện
                    </div>
                  );
                })()}

                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// API functions - implement these based on your Appwrite setup
async function fetchAvailableTechniques(
  cultivationPath: string
): Promise<CultivationTechnique[]> {
  try {
    const response = await fetch(
      `/api/cultivation/techniques?cultivationPath=${cultivationPath}`
    );
    const data = await response.json();
    return data.techniques || [];
  } catch (error) {
    console.error("Error fetching techniques:", error);
    return [];
  }
}

async function fetchLearnedTechniques(
  characterId: string
): Promise<LearnedTechnique[]> {
  try {
    const response = await fetch(
      `/api/cultivation/learned?characterId=${characterId}`
    );
    const data = await response.json();
    return data.learnedTechniques || [];
  } catch (error) {
    console.error("Error fetching learned techniques:", error);
    return [];
  }
}

interface TechniqueCost {
  qi: number;
  spiritStones: number;
  stamina: number;
}

async function learnTechnique(
  characterId: string,
  techniqueId: string,
  cost: TechniqueCost
): Promise<void> {
  const response = await fetch("/api/cultivation/learned", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      characterId,
      techniqueId,
      cost,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to learn technique");
  }
}

async function practiceTechnique(
  learnedTechniqueId: string,
  practiceType: string,
  minutes: number
): Promise<void> {
  const response = await fetch("/api/cultivation/practice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      learnedTechniqueId,
      practiceType,
      minutes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to practice technique");
  }
}

export default CultivationTechniques;
