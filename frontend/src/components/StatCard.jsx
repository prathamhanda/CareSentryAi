import React from "react";

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  color = "blue",
  onClick 
}) {
  const colorClasses = {
    blue: "bg-blue-600 text-blue-400",
    green: "bg-green-600 text-green-400",
    purple: "bg-purple-600 text-purple-400",
    amber: "bg-amber-600 text-amber-400",
    rose: "bg-rose-600 text-rose-400",
    cyan: "bg-cyan-600 text-cyan-400",
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all ${
        onClick ? "cursor-pointer hover:shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-100 mb-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`${bgColor} p-3 rounded-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
