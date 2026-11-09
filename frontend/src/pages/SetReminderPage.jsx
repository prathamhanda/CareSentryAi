import React from "react";
import { useLocation } from "react-router-dom";
import CreateReminder from "../components/CreateReminder.jsx";
import PageWrapper from "../components/PageWrapper.jsx";

export default function SetReminderPage() {
  const location = useLocation();
  const prefill = location.state?.prefill || null;

  return (
    <PageWrapper>
      <CreateReminder extracted={prefill} />
    </PageWrapper>
  );
}

