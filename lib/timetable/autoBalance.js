export function autoBalance(subjects) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const schedule = days.map((d) => ({
    day: d,
    periods: [],
  }));

  let slot = 0;

  subjects.forEach((s) => {
    for (let i = 0; i < s.periods; i++) {
      schedule[slot % days.length].periods.push({
        subject: s.name,
        teacher: s.teacher,
        time: `P${schedule[slot % days.length].periods.length + 1}`,
      });
      slot++;
    }
  });

  return schedule;
}
