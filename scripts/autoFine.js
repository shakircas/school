import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

const DAILY_FINE = 20;
const MAX_FINE = 1000;

async function runFine() {
  await connectDB();

  const today = new Date();

  const fees = await Fee.find({
    status: { $ne: "Paid" },
    dueDate: { $lt: today },
  });

  for (const fee of fees) {
    const daysLate = Math.floor(
      (today - new Date(fee.dueDate)) / (1000 * 60 * 60 * 24)
    );

    const fine = Math.min(daysLate * DAILY_FINE, MAX_FINE);

    fee.fine = fine;
    fee.netAmount = fee.totalAmount - fee.discount + fine;
    fee.dueAmount = fee.netAmount - fee.paidAmount;
    fee.status = "Overdue";

    await fee.save();
  }

  console.log("Auto fine applied");
}

runFine();
