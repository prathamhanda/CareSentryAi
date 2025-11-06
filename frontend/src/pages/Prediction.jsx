import React from "react";
import Pred from "../components/pred";
import PageWrapper from "../components/PageWrapper";

export default function PredictionPage() {
  return (
    <PageWrapper>
      <div className="min-h-[70vh] flex items-start justify-center p-6">
        <Pred />
      </div>
    </PageWrapper>
  );
}