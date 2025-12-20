export function detectClashes(schedule) {
  const map = {};
  const clashes = [];

  schedule.forEach((day) => {
    day.periods.forEach((p) => {
      const key = `${p.teacher}-${p.time}`;
      if (map[key]) {
        clashes.push({
          teacher: p.teacher,
          day: day.day,
          time: p.time,
        });
      } else {
        map[key] = true;
      }
    });
  });

  return clashes;
}
