import React from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = "",
}) => {
  return (
    <div
      className={`w-full bg-gray-700 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};
