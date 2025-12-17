import { useSchoolData } from "../context/SchoolDataContext";

export const useExams = () => {
  const { exams, loading } = useSchoolData();
  return { exams: exams?.data || [], loading };
};
