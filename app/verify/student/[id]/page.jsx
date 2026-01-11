export default async function VerifyStudent({ params }) {
    const {id} = await params
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600">✔ Student Verified</h1>
      <p>ID: {id}</p>
    </div>
  );
}
