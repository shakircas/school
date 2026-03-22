export async function POST(req) {
  try {
    const { question } = await req.json();

    const res = await fetch(`${process.env.AIBRAIN_API_URL}/api/ai/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        error: "AI server connection failed",
      },
      { status: 500 },
    );
  }
}
