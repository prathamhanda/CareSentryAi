import React from "react";
import { Upload, Eye, Pill, ShieldCheck, Send, CheckCircle2 } from "lucide-react";

export default function ProcessPipelineBar({ currentStage = 1, className = "" }) {
  const stages = [
    { id: 1, name: "Upload Photo", label: "Paper prescription", icon: Upload },
    { id: 2, name: "Read Text", label: "Scan details", icon: Eye },
    { id: 3, name: "Organize List", label: "Doses & times", icon: Pill },
    { id: 4, name: "Review Details", label: "Check medicines", icon: ShieldCheck },
    { id: 5, name: "Set Reminders", label: "Telegram alerts", icon: Send },
  ];

  return (
    <div className={`w-full max-w-full min-w-0 overflow-x-auto no-scrollbar pb-2 ${className}`}>
      <div className="flex items-center justify-between min-w-[580px] bg-[#ffffff] p-3 rounded-[8px] border border-[rgba(0,0,0,0.08)] shadow-2xs">
        {stages.map((stage, idx) => {
          const isPassed = currentStage > stage.id;
          const isActive = currentStage === stage.id;
          const Icon = stage.icon;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    isPassed
                      ? "bg-[#00c978] text-white"
                      : isActive
                      ? "bg-[#244cff] text-white shadow-xs"
                      : "bg-[#f7f7f1] text-[#878787] border border-[rgba(0,0,0,0.1)]"
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <p
                    className={`font-['Inter'] text-[12px] font-semibold ${
                      isActive ? "text-[#244cff]" : isPassed ? "text-[#000000]" : "text-[#878787]"
                    }`}
                  >
                    {stage.name}
                  </p>
                  <p className="text-[11px] text-[#878787]">{stage.label}</p>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="flex-1 mx-3 h-[1px] bg-[rgba(0,0,0,0.1)] relative">
                  <div
                    className={`h-[1px] transition-all duration-300 ${
                      isPassed ? "bg-[#00c978] w-full" : isActive ? "bg-[#244cff] w-1/2" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

