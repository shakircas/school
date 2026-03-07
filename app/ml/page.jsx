// // app/students/page.tsx
// import { MainLayout } from "@/components/layout/main-layout";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import Student from "@/models/Student";
// import Link from "next/link";
// import { Suspense } from "react";

// // Production grade: Add a separate component for the list to allow streaming
// async function StudentList() {
//   // Use .select() to only fetch what we need (Performance)
//   const students = await Student.find({ status: "Active" })
//     .select("name _id rollNumber classId").populate("classId")
//     .lean();

//   if (!students.length)
//     return <p className="text-gray-500">No active students found.</p>;

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//       {students.map((student) => (
//         <Link
//           key={student._id.toString()}
//           href={`/ml/${student._id}`}
//           className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white block"
//         >
//           <p className="font-semibold text-blue-600">{student.name}</p>
//           <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
//           <p className="text-sm text-gray-500">Class: {student.classId?.name}</p>
//         </Link>
//       ))}
//     </div>
//   );
// }

// export default function StudentsPage() {
//   return (
//     <MainLayout>
//       <div className="p-8 max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Student Directory</h1>
//         <Suspense fallback={<LoadingSpinner />}>
//           <StudentList />
//         </Suspense>
//       </div>
//     </MainLayout>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useClasses } from "@/components/hooks/useClasses";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StudentClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const { classes, classesLoading } = useClasses();

  // Construct Query Params
  const queryParams = new URLSearchParams();
  if (searchTerm) queryParams.append("search", searchTerm);
  if (selectedClass) queryParams.append("classId", selectedClass);
  queryParams.append("status", "Active");

  const { data, isLoading, error } = useSWR(
    `/api/students?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }, // Prevents flickering while typing
  );

  const students = data?.students || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={classesLoading}
            >
              <option value="">All Classes</option>
              {classes?.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-red-500">Failed to load students.</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500 text-center p-12">
            No students match your criteria.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Link
                key={student._id}
                href={`/ml/${student._id}`}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white block group"
              >
                <p className="font-semibold text-blue-600 group-hover:underline">
                  {student.name}
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  <p className="text-sm text-gray-500">
                    Roll: {student.rollNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Class:{" "}
                    <span className="font-medium text-gray-700">
                      {student.classId?.name || "N/A"}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
