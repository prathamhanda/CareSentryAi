import React from "react";

export default function Badge({
  children,
  variant = "ice",
  className = "",
  icon: Icon = null,
}) {
  const variantStyles = {
    cobalt: "badge-cobalt",
    lavender: "badge-lavender",
    ice: "badge-ice",
    parchment: "badge-parchment",
    obsidian: "inline-flex items-center gap-1.5 bg-[#1d1f21] text-white rounded-full px-2.5 py-0.5 text-xs font-semibold",
    mint: "inline-flex items-center gap-1.5 bg-[#00c978]/15 text-[#008f55] border border-[#00c978]/30 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  };

  const chosenStyle = variantStyles[variant] || variantStyles.ice;

  return (
    <span className={`${chosenStyle} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
