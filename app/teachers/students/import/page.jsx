// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";

// export default function ImportStudentsPage() {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const upload = async (e) => {
//      const file = e.target.files?.[0];
//     if (!file) return toast.error("Select Excel file");

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch("/api/teachers/students/import", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();
//     setLoading(false);

//     if (!res.ok) return toast.error("Import failed");

//     toast.success(`${data.createdCount} students imported`);
//     console.log("Credentials:", data.created);
//   };

//   return (
//     <Card className="max-w-xl">
//       <CardHeader>
//         <CardTitle>Import Students (Excel)</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <input
//           type="file"
//           accept=".xlsx,.xls"
//           onChange={(e) => setFile(e.target.files[0])}
//         />
//         <Button onClick={upload} disabled={loading}>
//           {loading ? "Uploading..." : "Upload"}
//         </Button>

//         <Button
//           variant="outline"
//           onClick={async () => {
//             const res = await fetch("/api/teacher/students/export/pdf", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ students: importedStudents }),
//             });

//             const blob = await res.blob();
//             const url = window.URL.createObjectURL(blob);
//             window.open(url);
//           }}
//         >
//           Download PDF
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { ImportPreviewDialog } from "@/components/students/import-preview-dialog";
import { importFromExcel } from "@/lib/excel-utils";

export default function ImportStudentsPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /** Step 1: Read Excel */
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      setFile(file);
      setPreview(data);
      setOpen(true);
    } catch {
      toast.error("Invalid Excel file");
    }

    e.target.value = "";
  };

  /** Step 2: Confirm import */
  const confirmImport = async (rows) => {
    setLoading(true);

    const res = await fetch("/api/teachers/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: rows }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Import failed");
      return;
    }

    toast.success(`${data.createdCount} students imported`);
    setOpen(false);
    setPreview([]);
    setFile(null);
  };

  return (
    <>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Import Students (Excel)</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <input type="file" accept=".xlsx,.xls" onChange={handleFile} />

          <Button disabled>Upload (via Preview)</Button>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <ImportPreviewDialog
        open={open}
        data={preview}
        onConfirm={confirmImport}
        onClose={() => setOpen(false)}
        loading={loading}
      />
    </>
  );
}
