export function detectTeacherClashes(classes = []) {
  const map = {};
  const clashes = [];

  classes.forEach((cls) => {
    cls.schedule?.forEach((dayBlock) => {
      dayBlock.periods?.forEach((period) => {
        if (!period.teacher) return;

        const key = `${period.teacher}_${dayBlock.day}_${period.time}`;

        if (!map[key]) {
          map[key] = {
            teacher: period.teacher,
            day: dayBlock.day,
            time: period.time,
            classes: [cls.name],
          };
        } else {
          map[key].classes.push(cls.name);
        }
      });
    });
  });

  Object.values(map).forEach((entry) => {
    if (entry.classes.length > 1) {
      clashes.push(entry);
    }
  });

  return clashes;
}
