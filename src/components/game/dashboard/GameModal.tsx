"use client";

import { CombatStatsPanel } from "../combat";
import { SkillBooksPanel } from "../../shared";
import {
  BreakthroughPanel,
  CultivationTabs,
  CultivationTrainingTabs,
} from "../cultivation";
import { DatabaseCharacter } from "@/types/database";

interface GameModalProps {
  showModal: string | null;
  onCloseModal: () => void;
  character: DatabaseCharacter;
  onCharacterUpdate: (updates: Partial<DatabaseCharacter>) => void;
  onCultivationRateRefresh: () => void;
}

export default function GameModal({
  showModal,
  onCloseModal,
  character,
  onCharacterUpdate,
  onCultivationRateRefresh,
}: GameModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-500/30 ${
          showModal === "combat" ||
          showModal === "skills" ||
          showModal === "cultivation" ||
          showModal === "advanced-cultivation" ||
          showModal === "breakthrough"
            ? "w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            : "w-full max-w-md"
        }`}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {showModal === "cultivation" && "Tu Luyện"}
            {showModal === "advanced-cultivation" && "Tu Luyện Nâng Cao"}
            {showModal === "breakthrough" && "Đột Phá"}
            {showModal === "shop" && "Cửa Hàng"}
            {showModal === "guild" && "Bang Phái"}
            {showModal === "inventory" && "Túi Đồ"}
            {showModal === "combat" && "Combat Stats"}
            {showModal === "skills" && "Skill Books"}
          </h3>
          <button
            onClick={onCloseModal}
            className="text-gray-400 hover:text-white p-1 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        {showModal === "cultivation" && (
          <CultivationTrainingTabs
            character={character}
            onCultivationRateRefresh={onCultivationRateRefresh}
            onCharacterUpdate={onCharacterUpdate}
          />
        )}

        {showModal === "advanced-cultivation" && (
          <CultivationTabs
            character={character}
            onCultivationRateRefresh={onCultivationRateRefresh}
            onCharacterUpdate={onCharacterUpdate}
          />
        )}

        {showModal === "breakthrough" && (
          <BreakthroughPanel
            character={character}
            onBreakthroughSuccess={(newStats) => {
              onCharacterUpdate(newStats);
              onCultivationRateRefresh();
            }}
          />
        )}

        {showModal === "combat" && (
          <CombatStatsPanel
            character={character}
            onStatsUpdate={(stats) => {
              console.log("Combat stats updated:", stats);
            }}
          />
        )}

        {showModal === "skills" && (
          <SkillBooksPanel
            character={character}
            onSkillLearned={() => {
              onCharacterUpdate({
                stamina: character.stamina - 10, // Example stamina cost
              });
            }}
          />
        )}

        {![
          "combat",
          "skills",
          "cultivation",
          "advanced-cultivation",
          "breakthrough",
        ].includes(showModal) && (
          <div className="text-gray-300 text-center py-8">
            Tính năng đang được phát triển...
          </div>
        )}
      </div>
    </div>
  );
}
