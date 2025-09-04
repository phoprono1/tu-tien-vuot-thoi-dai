"use client";

import { useState } from "react";
import { Book, Zap, TrendingUp } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import OptimizedCultivationDashboard from "./OptimizedCultivationDashboard";
import CultivationTechniques from "./CultivationTechniques";
import { SkillBooksPanel } from "@/components/shared";

interface CultivationTabsProps {
  character: DatabaseCharacter;
  onCultivationRateRefresh?: () => void;
  onCharacterUpdate?: (updates: Partial<DatabaseCharacter>) => void;
}

export default function CultivationTabs({
  character,
  onCultivationRateRefresh,
  onCharacterUpdate,
}: CultivationTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "cultivation" | "techniques" | "skills"
  >("techniques");

  const tabs = [
    {
      id: "techniques" as const,
      name: "Công Pháp",
      icon: Book,
      description: "Học và rèn luyện công pháp",
    },
    {
      id: "skills" as const,
      name: "Võ Kỹ",
      icon: Zap,
      description: "Học võ kỹ và chiêu thức",
    },
    {
      id: "cultivation" as const,
      name: "Tu Luyện",
      icon: TrendingUp,
      description: "Thực hành tu luyện cơ bản",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <div className="text-sm text-gray-400 px-1">
        {tabs.find((tab) => tab.id === activeTab)?.description}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "techniques" && (
          <CultivationTechniques
            characterId={character.$id}
            characterLevel={character.level}
            cultivationPath={
              character.cultivationPath as "qi" | "body" | "demon"
            }
            currentQi={character.qi}
            spiritStones={character.spiritStones}
            stamina={character.stamina}
            onTechniqueUpdate={onCultivationRateRefresh}
          />
        )}

        {activeTab === "skills" && (
          <SkillBooksPanel
            character={character}
            onSkillLearned={() => {
              onCharacterUpdate?.({
                stamina: character.stamina - 10, // Example stamina cost
              });
            }}
          />
        )}

        {activeTab === "cultivation" && (
          <OptimizedCultivationDashboard isActive={true} />
        )}
      </div>
    </div>
  );
}
