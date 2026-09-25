import { getViewCollection, VIEW_DOC_ID } from "@/lib/mongodb";

export async function POST(request) {
  const secret = request.headers.get("x-reset-secret");
  const expected = process.env.RESET_SECRET;

  if (!expected || secret !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const collection = await getViewCollection();
    await collection.updateOne(
      { _id: VIEW_DOC_ID },
      { $set: { viewed: false, viewedAt: null } },
      { upsert: true }
    );
    return Response.json({ ok: true, viewed: false });
  } catch (error) {
    console.error("POST /api/view/reset failed:", error);
    return Response.json({ error: "Unable to reset view flag" }, { status: 500 });
  }
}
