"use client";

import { useState, useEffect } from "react";
import { CombatResult } from "@/types/combat-extended";

interface Character {
  $id: string;
  name: string;
  level: number;
  realm: string;
  cultivationPath: string;
}

interface Trial {
  $id: string;
  name: string;
  difficulty: string;
  minLevel: number;
  maxLevel: number;
  enemy: {
    name: string;
    health: number;
    attack: number;
    defense: number;
  };
}

export default function CombatTestPanel() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedAttacker, setSelectedAttacker] = useState<string>("");
  const [selectedDefender, setSelectedDefender] = useState<string>("");
  const [combatType, setCombatType] = useState<"pve" | "pvp">("pve");
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCharacters();
    fetchTrials();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters");
      const data = await response.json();
      if (data.success) {
        setCharacters(data.characters);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  };

  const fetchTrials = async () => {
    try {
      const response = await fetch("/api/trials");
      const data = await response.json();
      if (data.success) {
        setTrials(data.trials);
      }
    } catch (error) {
      console.error("Error fetching trials:", error);
    }
  };

  const executeCombat = async () => {
    if (!selectedAttacker || !selectedDefender) {
      alert("Vui lòng chọn đầy đủ thông tin combat!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/combat/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackerId: selectedAttacker,
          defenderId: selectedDefender,
          combatType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCombatResult(data.combatResult);
      } else {
        alert(`Lỗi combat: ${data.error}`);
      }
    } catch (error) {
      console.error("Error executing combat:", error);
      alert("Lỗi khi thực hiện combat!");
    } finally {
      setLoading(false);
    }
  };

  const getWinnerText = (winner: string) => {
    switch (winner) {
      case "attacker":
        return "🏆 Người tấn công thắng!";
      case "defender":
        return "🛡️ Người phòng thủ thắng!";
      case "draw":
        return "🤝 Hòa!";
      default:
        return "❓ Kết quả không xác định";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Test Combat System</h2>
        <p className="text-gray-600">Thử nghiệm hệ thống chiến đấu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combat Setup */}
        <div className="p-6 border rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Thiết lập chiến đấu</h3>

          <div>
            <label className="block text-sm font-medium mb-2">
              Loại combat:
            </label>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded ${
                  combatType === "pve"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setCombatType("pve")}
              >
                PvE (vs Thí luyện)
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  combatType === "pvp" ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setCombatType("pvp")}
              >
                PvP (vs Player)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Người tấn công:
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedAttacker}
              onChange={(e) => setSelectedAttacker(e.target.value)}
            >
              <option value="">Chọn character...</option>
              {characters.map((char) => (
                <option key={char.$id} value={char.$id}>
                  {char.name} (Lv.{char.level} - {char.realm})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {combatType === "pve" ? "Thí luyện:" : "Đối thủ:"}
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedDefender}
              onChange={(e) => setSelectedDefender(e.target.value)}
            >
              <option value="">
                {combatType === "pve" ? "Chọn thí luyện..." : "Chọn đối thủ..."}
              </option>
              {combatType === "pve"
                ? trials.map((trial) => (
                    <option key={trial.$id} value={trial.$id}>
                      {trial.name} ({trial.difficulty}) - Lv.{trial.minLevel}-
                      {trial.maxLevel}
                    </option>
                  ))
                : characters.map((char) => (
                    <option key={char.$id} value={char.$id}>
                      {char.name} (Lv.{char.level} - {char.realm})
                    </option>
                  ))}
            </select>
          </div>

          <button
            className="w-full bg-green-500 text-white p-3 rounded font-medium hover:bg-green-600 disabled:opacity-50"
            onClick={executeCombat}
            disabled={loading || !selectedAttacker || !selectedDefender}
          >
            {loading ? "Đang chiến đấu..." : "⚔️ Bắt đầu chiến đấu!"}
          </button>
        </div>

        {/* Combat Result */}
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Kết quả chiến đấu</h3>

          {combatResult ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl mb-2">
                  {getWinnerText(combatResult.winner)}
                </div>
                <div className="text-sm text-gray-600">
                  Chiến đấu kéo dài {combatResult.turns} lượt
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h4 className="font-medium text-blue-600">Người tấn công</h4>
                  <div className="text-sm mt-2">
                    <div>HP: {combatResult.finalStats.attacker.health}</div>
                    <div>
                      Stamina: {combatResult.finalStats.attacker.stamina}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-medium text-red-600">Người phòng thủ</h4>
                  <div className="text-sm mt-2">
                    <div>HP: {combatResult.finalStats.defender.health}</div>
                    <div>
                      Stamina: {combatResult.finalStats.defender.stamina}
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Log Preview */}
              <div>
                <h4 className="font-medium mb-2">
                  Nhật ký chiến đấu (5 lượt cuối):
                </h4>
                <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                  {combatResult.combatLog.slice(-5).map((turn, index) => (
                    <div
                      key={index}
                      className="text-xs mb-1 p-1 bg-white rounded"
                    >
                      <span className="font-medium">
                        Lượt {turn.turnNumber}:
                      </span>{" "}
                      {turn.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Chọn đối thủ và bắt đầu chiến đấu để xem kết quả
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
