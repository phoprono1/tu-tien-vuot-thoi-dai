import { CombatTestPanel } from "@/components/game/combat";

export default function CombatTestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-2">
          Tu Tiên Vượt Thời Đại - Combat Test
        </h1>
        <p className="text-center text-gray-600">
          Thử nghiệm hệ thống chiến đấu
        </p>
      </div>

      <CombatTestPanel />
    </div>
  );
}
