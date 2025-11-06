import React from "react";
import { useLocation } from "react-router-dom";
import Scheduler from "../components/ScheduleSetup.jsx";
import PageWrapper from "../components/PageWrapper";

export default function SchedulePage() {
  const location = useLocation();
  const prefill = location.state?.prefill || null;

  return (
    <PageWrapper>
      <div className="min-h-[70vh] p-4">
        <Scheduler extracted={prefill} />
      </div>
    </PageWrapper>
  );
}
