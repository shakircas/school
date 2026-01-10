import AdmissionFormPrint from "@/components/students/admission-form-print";

export default async function AdmissionFormPage({ params }) {
    const {id} = await params
  return <AdmissionFormPrint studentId={id} />;
}
