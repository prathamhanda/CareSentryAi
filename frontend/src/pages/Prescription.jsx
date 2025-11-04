import { useState } from "react";
import Upload from "../components/upload";
import Prescriptions from "../components/prescriptions.jsx";

export default function Prescription() {
  const [result, setResult] = useState("");
  const [extracted, setExtracted] = useState(null);

  return (
    <div className="space-y-6">
      <div className="min-h-[70vh] flex items-center justify-center">
        <Upload
          setExtracted={setExtracted}
          result={result}
          setResult={setResult}
        />
      </div>
      <Prescriptions extracted={extracted} />
    </div>
  );
}
