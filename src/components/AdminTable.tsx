"use client";

import React, { useState, useEffect, useCallback } from "react";
import { databases, DATABASE_ID } from "@/lib/appwrite";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

interface AdminTableProps<T> {
  title: string;
  collectionId: string;
  columns: Column<T>[];
  createForm: (onSuccess: () => void) => React.ReactNode;
  editForm: (item: T, onClose: () => void) => React.ReactNode;
  onItemCreated?: () => void;
  onItemUpdated?: () => void;
  onItemDeleted?: () => void;
}

export default function AdminTable<T extends { $id: string }>({
  title,
  collectionId,
  columns,
  createForm,
  editForm,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
}: AdminTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await databases.listDocuments(DATABASE_ID, collectionId);
      setItems(result.documents as unknown as T[]);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa item này?")) return;

    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, id);
      await fetchItems();
      onItemDeleted?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể xóa item");
    }
  };

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort items
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;

    return columns.some((column) => {
      if (!column.searchable) return false;
      const value = item[column.key];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {title}
          </h1>
          <p className="text-gray-400 mt-1">Quản lý {items.length} items</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchItems}
            className="mt-2 text-red-300 hover:text-red-100 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <span className="text-gray-400 text-sm">
              Hiển thị {paginatedItems.length} / {sortedItems.length}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60 border-b border-purple-500/30">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-300 ${
                      column.sortable ? "cursor-pointer hover:text-white" : ""
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortField === column.key && (
                        <span className="text-purple-400">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/20">
              {paginatedItems.map((item) => (
                <tr
                  key={item.$id}
                  className="hover:bg-white/5 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-gray-300"
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || "-")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.$id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-black/60 border-t border-purple-500/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <h3 className="text-xl font-bold text-white">Thêm mới {title}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {createForm(() => {
                setShowCreateModal(false);
                fetchItems();
                onItemCreated?.();
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa {title}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {editForm(editingItem, () => {
                setEditingItem(null);
                fetchItems();
                onItemUpdated?.();
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
