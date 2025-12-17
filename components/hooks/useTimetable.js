import { useSchoolData } from "@/context/SchoolDataContext";

export const useTimetable = () => {
  const { timetable, loading } = useSchoolData();
  return { timetable: timetable?.data || [], loading };
};
