import { useSchoolData } from "../context/SchoolDataContext";

export const useStudents = () => {
  const { students, loading } = useSchoolData();
  return { students: students?.students || [], loading };
};
