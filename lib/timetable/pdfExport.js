import jsPDF from "jspdf";
import "jspdf-autotable";

export function exportToPDF(schedule) {
  const doc = new jsPDF();
  const table = [];

  schedule.forEach((d) => {
    d.periods.forEach((p) => {
      table.push([d.day, p.time, p.subject]);
    });
  });

  doc.autoTable({
    head: [["Day", "Time", "Subject"]],
    body: table,
  });

  doc.save("timetable.pdf");
}
