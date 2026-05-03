'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function NewReportPage() {
  const params = useSearchParams();
  const testId = params.get('testId');

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadReport = async () => {
    if (!file) return alert("Select file first");

    setLoading(true);

    // NOTE: real project me yahan cloud storage (S3 / Cloudinary) hoga
    const fakeFileUrl = URL.createObjectURL(file);

    const res = await fetch('/api/lab/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testId,
        fileUrl: fakeFileUrl,
        patientName: "Unknown",
        testName: "Lab Test",
        status: "completed"
      })
    });

    const data = await res.json();

    setLoading(false);

    if (data.success) {
      alert("Report created successfully");
    } else {
      alert("Error creating report");
    }
  };

  return (
    <div className="p-8">

      <h1 className="text-xl font-bold mb-4">Generate Report</h1>

      <p className="text-sm text-gray-500 mb-4">
        Test ID: {testId}
      </p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={uploadReport}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Report"}
      </button>

    </div>
  );
}