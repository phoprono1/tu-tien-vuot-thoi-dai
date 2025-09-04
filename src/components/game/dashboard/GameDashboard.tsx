"use client";

import React, { useState } from "react";
import { Zap, Dumbbell, Skull } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import GameHeader from "./GameHeader";
import CharacterInfoPanel from "./CharacterInfoPanel";
import GameButtons from "./GameButtons";
import ActivityChatTabs from "./ActivityChatTabs";
import GameModal from "./GameModal";

interface GameDashboardProps {
  character: DatabaseCharacter;
  onLogout: () => void;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
  character,
  onLogout,
}) => {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState(character);
  const [cultivationRate, setCultivationRate] = useState({
    baseRate: 1.0,
    totalBonusPercentage: 0,
    finalRate: 1.0,
  });

  // Cultivation paths configuration
  const cultivationPaths = {
    qi: { name: "Khí Tu", color: "blue", icon: Zap },
    body: { name: "Thể Tu", color: "green", icon: Dumbbell },
    demon: { name: "Ma Tu", color: "red", icon: Skull },
  };

  // Handler functions
  const handleShowModal = (modal: string) => setShowModal(modal);
  const handleCloseModal = () => setShowModal(null);

  const handleCharacterUpdate = (updates: Partial<DatabaseCharacter>) => {
    setCurrentCharacter((prev: DatabaseCharacter) => ({ ...prev, ...updates }));
  };

  const handleCultivationRateRefresh = async () => {
    try {
      const response = await fetch(
        `/api/cultivation/rate?characterId=${currentCharacter.$id}`
      );
      const data = await response.json();
      if (data.success) {
        setCultivationRate(data.cultivationData);
      }
    } catch (error) {
      console.error("Error refreshing cultivation rate:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <GameHeader
        user={{
          $id: character.$id,
          name: character.name,
          email: character.name + "@game.com",
        }}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-full">
          <div className="lg:col-span-1">
            <CharacterInfoPanel
              character={currentCharacter}
              cultivationRate={cultivationRate}
              cultivationPaths={cultivationPaths}
              onShowModal={handleShowModal}
            />
          </div>

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Di chuyển ActivityChatTabs lên giữa để dễ nhìn trên mobile */}
            <ActivityChatTabs />
            <GameButtons onShowModal={handleShowModal} />
          </div>
        </div>
      </main>

      <GameModal
        showModal={showModal}
        onCloseModal={handleCloseModal}
        character={currentCharacter}
        onCharacterUpdate={handleCharacterUpdate}
        onCultivationRateRefresh={handleCultivationRateRefresh}
      />
    </div>
  );
};

export default GameDashboard;
