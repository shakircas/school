import { useSchoolData } from "@/context/SchoolDataContext";

export const useTeacherLoad = () => {
  const { classes, teachers } = useSchoolData();

  if (!classes || !teachers) return { load: [] };

  const load = teachers.data.map((t) => {
    let totalPeriods = 0;

    classes.data.forEach((cls) => {
      cls.subjects?.forEach((sub) => {
        if (String(sub.teacher) === String(t._id)) {
          totalPeriods += sub.periods || 0;
        }
      });
    });

    return {
      teacherId: t._id,
      name: t.name,
      totalPeriods,
    };
  });

  return { load };
};
