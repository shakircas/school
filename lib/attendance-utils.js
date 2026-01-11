export function buildAttendanceMap(attendanceDocs) {
  const map = {};

  attendanceDocs.forEach((doc) => {
    const day = new Date(doc.date).getDate();

    map[day] = {};

    doc.records.forEach((r) => {
      map[day][r.personId] = r.status;
    });
  });

  return map;
}
