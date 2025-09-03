"use client";

import { useState, useEffect } from "react";

interface Trial {
  $id: string;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
  difficulty: "easy" | "normal" | "hard" | "extreme" | "nightmare";
  cooldownMinutes: number;
  enemy: {
    name: string;
    health: number;
    stamina: number;
    attack: number;
    defense: number;
    agility: number;
    criticalRate?: number;
    multiStrikeRate?: number;
    lifeStealRate?: number;
    counterAttackRate?: number;
    burnRate?: number;
    poisonRate?: number;
    freezeRate?: number;
    stunRate?: number;
    healthRegenRate?: number;
  };
  rewards: {
    experience?: number;
    spirit_stones?: number;
  };
  isActive: boolean;
  $createdAt: string;
}

const defaultTrial: Omit<Trial, "$id" | "$createdAt"> = {
  name: "",
  description: "",
  minLevel: 1,
  maxLevel: 50,
  difficulty: "normal",
  cooldownMinutes: 60,
  enemy: {
    name: "",
    health: 100,
    stamina: 100,
    attack: 20,
    defense: 10,
    agility: 15,
    criticalRate: 10,
    multiStrikeRate: 5,
    lifeStealRate: 0,
    counterAttackRate: 15,
    burnRate: 5,
    poisonRate: 5,
    freezeRate: 5,
    stunRate: 2,
    healthRegenRate: 0,
  },
  rewards: {
    experience: 100,
    spirit_stones: 10,
  },
  isActive: true,
};

export default function TrialManagementPanel() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTrial, setNewTrial] = useState(defaultTrial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrials();
  }, []);

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

  const createTrial = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrial),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTrials();
        setIsCreating(false);
        setNewTrial(defaultTrial);
      }
    } catch (error) {
      console.error("Error creating trial:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrial = async (trialId: string, updates: Partial<Trial>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/trials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trialId, updates }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTrials();
        setEditingTrial(null);
      }
    } catch (error) {
      console.error("Error updating trial:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrial = async (trialId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thí luyện này?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/trials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trialId }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTrials();
      }
    } catch (error) {
      console.error("Error deleting trial:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 px-2 py-1 rounded text-xs";
      case "normal":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs";
      case "hard":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs";
      case "nightmare":
        return "bg-red-100 text-red-800 px-2 py-1 rounded text-xs";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "normal":
        return "Bình thường";
      case "hard":
        return "Khó";
      case "nightmare":
        return "Ác mộng";
      default:
        return difficulty;
    }
  };

  const TrialForm = ({
    trial,
    onSave,
    onCancel,
  }: {
    trial: Partial<Trial>;
    onSave: (trial: Partial<Trial>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(trial);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {trial.$id ? "Chỉnh sửa Thí luyện" : "Tạo Thí luyện mới"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên thí luyện
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Độ khó</label>
              <select
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as
                      | "easy"
                      | "normal"
                      | "hard"
                      | "extreme"
                      | "nightmare",
                  })
                }
              >
                <option value="easy">Dễ</option>
                <option value="normal">Bình thường</option>
                <option value="hard">Khó</option>
                <option value="nightmare">Ác mộng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Cấp tối thiểu
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.minLevel || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minLevel: parseInt(e.target.value),
                  })
                }
                min="1"
                max="999"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cấp tối đa
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.maxLevel || 50}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxLevel: parseInt(e.target.value),
                  })
                }
                min="1"
                max="999"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cooldown (phút)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.cooldownMinutes || 60}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cooldownMinutes: parseInt(e.target.value),
                  })
                }
                min="0"
                max="1440"
                required
              />
            </div>
          </div>

          {/* Enemy Stats */}
          <div className="border p-4 rounded">
            <h4 className="font-semibold mb-3">Thông số kẻ thù</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enemy?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enemy: { ...formData.enemy!, name: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Máu</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enemy?.health || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enemy: {
                        ...formData.enemy!,
                        health: parseInt(e.target.value),
                      },
                    })
                  }
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stamina
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enemy?.stamina || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enemy: {
                        ...formData.enemy!,
                        stamina: parseInt(e.target.value),
                      },
                    })
                  }
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tấn công
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enemy?.attack || 20}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enemy: {
                        ...formData.enemy!,
                        attack: parseInt(e.target.value),
                      },
                    })
                  }
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phòng thủ
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enemy?.defense || 10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enemy: {
                        ...formData.enemy!,
                        defense: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nhanh nhẹn
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enemy?.agility || 15}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enemy: {
                        ...formData.enemy!,
                        agility: parseInt(e.target.value),
                      },
                    })
                  }
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="border p-4 rounded">
            <h4 className="font-semibold mb-3">Phần thưởng</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kinh nghiệm
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.rewards?.experience || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rewards: {
                        ...formData.rewards!,
                        experience: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Linh thạch
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.rewards?.spirit_stones || 10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rewards: {
                        ...formData.rewards!,
                        spirit_stones: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              💾 {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              onClick={onCancel}
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Thí luyện PvE</h2>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
        >
          ➕ Tạo thí luyện mới
        </button>
      </div>

      {isCreating && (
        <TrialForm
          trial={newTrial}
          onSave={createTrial}
          onCancel={() => {
            setIsCreating(false);
            setNewTrial(defaultTrial);
          }}
        />
      )}

      {editingTrial && (
        <TrialForm
          trial={editingTrial}
          onSave={(updates) => updateTrial(editingTrial.$id, updates)}
          onCancel={() => setEditingTrial(null)}
        />
      )}

      <div className="grid gap-4">
        {trials.map((trial) => (
          <div
            key={trial.$id}
            className="bg-white border rounded-lg p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{trial.name}</h3>
                  <span className={getDifficultyColor(trial.difficulty)}>
                    {getDifficultyText(trial.difficulty)}
                  </span>
                  {trial.isActive ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      Tạm dừng
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Cấp {trial.minLevel}-{trial.maxLevel} • Cooldown:{" "}
                  {trial.cooldownMinutes}m
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => setEditingTrial(trial)}
                >
                  ✏️ Sửa
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => deleteTrial(trial.$id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{trial.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-sm mb-2">
                  Kẻ thù: {trial.enemy.name}
                </h5>
                <div className="text-xs space-y-1">
                  <div>
                    HP: {trial.enemy.health} | Stamina: {trial.enemy.stamina}
                  </div>
                  <div>
                    Tấn công: {trial.enemy.attack} | Phòng thủ:{" "}
                    {trial.enemy.defense}
                  </div>
                  <div>Nhanh nhẹn: {trial.enemy.agility}</div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-sm mb-2">Phần thưởng</h5>
                <div className="text-xs space-y-1">
                  <div>Kinh nghiệm: {trial.rewards.experience || 0}</div>
                  <div>Linh thạch: {trial.rewards.spirit_stones || 0}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trials.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có thí luyện nào. Tạo thí luyện đầu tiên!
        </div>
      )}
    </div>
  );
}
