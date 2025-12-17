"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadPDFButton({ apiUrl, filename }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "file.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleDownload} disabled={loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Downloading..." : "Download PDF"}
    </Button>
  );
}
