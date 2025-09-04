import { PvPRankingsPanel } from "@/components/game/combat";

export default function PvPRankingsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-2">
          Tu Tiên Vượt Thời Đại - PvP
        </h1>
        <p className="text-center text-gray-600">Đấu trường cao thủ</p>
      </div>

      <PvPRankingsPanel />
    </div>
  );
}
