import StudentProfilePrint from "@/components/students/student-profile-print";

export default async function PrintStudentPage({ params }) {
    const {id} = await params
  return <StudentProfilePrint studentId={id} />;
}
