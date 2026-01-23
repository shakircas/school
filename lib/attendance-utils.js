// export function buildAttendanceMap(attendanceDocs) {
//   const map = {};

//   attendanceDocs.forEach((doc) => {
//     const day = new Date(doc.date).getDate();

//     map[day] = {};

//     doc.records.forEach((r) => {
//       map[day][r.personId] = r.status;
//     });
//   });

//   return map;
// }

// @/lib/attendance-utils.js

export function buildAttendanceMap(attendanceDocs) {
  const map = {};

  attendanceDocs?.forEach((doc) => {
    // Extract the day of the month from the ISO date string
    const day = new Date(doc.date).getDate();
    
    if (!map[day]) {
      map[day] = {};
    }

    doc.records.forEach((record) => {
      // Use personId if it exists, fallback to teacherId or studentId
      const id = record.personId || record.teacherId || record.studentId;
      
      if (id) {
        // Map the status to the ID for that specific day
        map[day][id.toString()] = record.status;
      }
    });
  });

  return map;
}