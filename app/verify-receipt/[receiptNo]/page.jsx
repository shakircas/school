import connectDB from "@/lib/db";
import Fee from "@/models/Fee";

export default async function VerifyReceiptPage({ params }) {
  await connectDB();
  const { receiptNo } = await params;
  const fee = await Fee.findOne({
    "payments.receiptNumber": receiptNo,
  });

  if (!fee) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-red-600 text-xl font-bold">
          ❌ Invalid or Fake Receipt
        </h2>
      </div>
    );
  }

  const payment = fee.payments.find((p) => p.receiptNumber == params.receiptNo);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg space-y-2">
      <h2 className="text-green-600 text-xl font-bold">✅ Receipt Verified</h2>

      <p>
        <b>Student:</b> {fee.studentName}
      </p>
      <p>
        <b>Class:</b> {fee?.classId.name}
      </p>
      <p>
        <b>Amount:</b> Rs. {fee.paidAmount}
      </p>
      <p>
        {/* <b>Date:</b> {new Date(payment.paymentDate).toLocaleDateString()} */}
      </p>
      <p>
        <b>Method:</b> {payment?.paymentMethod}
      </p>
    </div>
  );
}
