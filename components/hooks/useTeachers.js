import { useSchoolData } from "@/context/SchoolDataContext";

export const useTeachers = () => {
  const { teachers, loading } = useSchoolData();
  return { teachers: teachers?.data || [], loading };
};
