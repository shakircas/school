import { useSchoolData } from "../context/SchoolDataContext";

export const useClasses = () => {
  const { classes, loading } = useSchoolData();
  return { classes: classes?.data || [], classesLoading: loading };
};
