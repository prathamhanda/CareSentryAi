import React from "react";
import { useLocation } from "react-router-dom";
import Scheduler from "../components/ScheduleSetup.jsx";

export default function SchedulePage() {
  const location = useLocation();
  const prefill = location.state?.prefill || null;

  return (
    <div className="min-h-[70vh] p-4">
      <Scheduler extracted={prefill} />
    </div>
  );
}
