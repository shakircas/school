import { useSchoolData } from "../context/SchoolDataContext";

export const useTeachers = () => {
  const { teachers, loading } = useSchoolData();
  console.log(teachers);
  return { teachers: teachers?.teachers || [], loading };
};
