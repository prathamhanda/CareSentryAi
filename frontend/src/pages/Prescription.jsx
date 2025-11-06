import { useState } from "react";
import Upload from "../components/upload";
import Prescriptions from "../components/prescriptions.jsx";
import PageWrapper from "../components/PageWrapper";

export default function Prescription() {
  const [result, setResult] = useState("");
  const [extracted, setExtracted] = useState(null);

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="min-h-[50vh] flex items-center justify-center">
          <Upload setExtracted={setExtracted} result={result} setResult={setResult} />
        </div>
        <Prescriptions extracted={extracted} />
      </div>
    </PageWrapper>
  );
}
