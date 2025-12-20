export function calculateTeacherLoad(schedule) {
  const load = {};

  schedule.forEach((day) => {
    day.periods.forEach((p) => {
      if (!p.teacher) return;

      if (!load[p.teacher]) {
        load[p.teacher] = {
          teacherId: p.teacher,
          totalPeriods: 0,
          byDay: {},
        };
      }

      load[p.teacher].totalPeriods += 1;
      load[p.teacher].byDay[day.day] =
        (load[p.teacher].byDay[day.day] || 0) + 1;
    });
  });

  return Object.values(load);
}
