import { useSchoolData } from "../context/SchoolDataContext";

export const useSubjects = () => {
  const { subjects, loading } = useSchoolData();
  return { subjects: subjects?.data || [], loading };
};
