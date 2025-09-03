import TrialManagementPanel from "@/components/TrialManagementPanel";

export default function TrialsAdminPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Tu Tiên Vượt Thời Đại - Admin
        </h1>
        <p className="text-center text-gray-600">Quản lý Thí luyện PvE</p>
      </div>

      <TrialManagementPanel />
    </div>
  );
}
