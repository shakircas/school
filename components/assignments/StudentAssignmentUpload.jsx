"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function StudentAssignmentAction({ assignment, user }) {
  const [uploading, setUploading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(
    assignment.submissions?.some((s) => s.student === user.id)
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // LOGIC:
    // 1. Upload to your storage (S3/UploadThing/Cloudinary)
    // 2. Get the URL
    // 3. Call our new API

    try {
      // Mocking the file upload response
      const mockFileUrl = "https://your-storage.com/file.pdf";

      const res = await fetch(`/api/assignments/${assignment._id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          rollNumber: user.rollNumber,
          attachments: [{ name: file.name, url: mockFileUrl }],
        }),
      });

      if (res.ok) {
        toast.success("Assignment submitted successfully!");
        setHasSubmitted(true);
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-700">
        <CheckCircle className="h-5 w-5" />
        <span className="font-bold">
          You have already submitted this assignment.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50">
      <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
        <Upload className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900">Upload Your Work</h4>
        <p className="text-sm text-slate-500">
          Support PDF, DOCX or Images (Max 10MB)
        </p>
      </div>

      <div className="flex justify-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <Button
          asChild
          disabled={uploading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <label htmlFor="file-upload">
            {uploading ? "Uploading..." : "Select File"}
          </label>
        </Button>
      </div>
    </div>
  );
}
