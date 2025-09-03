"use client";

import React, { useState, useEffect, useCallback } from "react";
import CombatStatsForm from "@/components/admin/CombatStatsForm";
import { CombatStats, Character } from "@/types/game";

interface CombatStatsWithCharacterName extends CombatStats {
  characterName?: string;
}

export default function CombatStatsAdminPage() {
  const [combatStats, setCombatStats] = useState<
    CombatStatsWithCharacterName[]
  >([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStats, setEditingStats] = useState<CombatStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch characters for dropdown
  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/characters");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.documents || data);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  };

  const fetchCombatStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/combat-stats");
      if (response.ok) {
        const data = await response.json();
        const statsWithNames = (data.documents || data).map(
          (stat: CombatStats) => {
            const character = characters.find(
              (c) => c.$id === stat.characterId
            );
            return {
              ...stat,
              characterName: character?.name || "Unknown Character",
            };
          }
        );
        setCombatStats(statsWithNames);
      }
    } catch (error) {
      console.error("Error fetching combat stats:", error);
    } finally {
      setLoading(false);
    }
  }, [characters]);

  useEffect(() => {
    if (characters.length > 0) {
      fetchCombatStats();
    }
  }, [characters, fetchCombatStats]);

  const handleCreate = () => {
    setEditingStats(null);
    setShowForm(true);
  };

  const handleEdit = (stats: CombatStats) => {
    setEditingStats(stats);
    setShowForm(true);
  };

  const handleDelete = async (stats: CombatStatsWithCharacterName) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa chỉ số chiến đấu của "${
          stats.characterName || "Unknown"
        }"?`
      )
    ) {
      try {
        const response = await fetch(`/api/combat-stats`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: stats.$id }),
        });

        if (response.ok) {
          fetchCombatStats();
        } else {
          alert("Có lỗi xảy ra khi xóa chỉ số chiến đấu");
        }
      } catch (error) {
        console.error("Error deleting combat stats:", error);
        alert("Có lỗi xảy ra khi xóa chỉ số chiến đấu");
      }
    }
  };

  const handleSubmit = async (data: Partial<CombatStats>) => {
    try {
      setIsSubmitting(true);

      const url = editingStats ? `/api/combat-stats` : "/api/combat-stats";

      const method = editingStats ? "PUT" : "POST";
      const payload = editingStats ? { ...data, $id: editingStats.$id } : data;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchCombatStats();
        setShowForm(false);
        setEditingStats(null);
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting combat stats:", error);
      alert("Có lỗi xảy ra khi lưu chỉ số chiến đấu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStats(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Chỉ Số Chiến Đấu</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm Chỉ Số Mới
        </button>
      </div>

      {combatStats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có chỉ số chiến đấu nào
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân Vật
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Máu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thể Lực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chỉ Số Chiến Đấu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ Lệ Chiến Đấu (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiệu Ứng (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combatStats.map((stats) => (
                  <tr key={stats.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{stats.characterName}</div>
                        <div className="text-sm text-gray-500">
                          ID: {stats.characterId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {stats.currentHealth}/{stats.maxHealth}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (stats.currentHealth / stats.maxHealth) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {stats.currentStamina}/{stats.maxStamina}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (stats.currentStamina / stats.maxStamina) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Tấn Công:</span>{" "}
                          {stats.attack}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Phòng Thủ:</span>{" "}
                          {stats.defense}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Nhanh Nhẹn:</span>{" "}
                          {stats.agility}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Bạo Kích:</span>{" "}
                          {stats.criticalRate}%
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Phản Công:</span>{" "}
                          {stats.counterAttackRate}%
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Đánh Nhiều:</span>{" "}
                          {stats.multiStrikeRate}%
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Hút Máu:</span>{" "}
                          {stats.lifeStealRate}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Thiêu:</span>{" "}
                          {stats.burnRate}%
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Độc:</span>{" "}
                          {stats.poisonRate}%
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Băng:</span>{" "}
                          {stats.freezeRate}%
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Choáng:</span>{" "}
                          {stats.stunRate}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(stats)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(stats)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <CombatStatsForm
          combatStats={editingStats || undefined}
          characters={characters}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
