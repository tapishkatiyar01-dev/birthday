import { getViewCollection, VIEW_DOC_ID } from "@/lib/mongodb";

export async function GET() {
  try {
    const collection = await getViewCollection();
    const doc = await collection.findOne({ _id: VIEW_DOC_ID });
    return Response.json({
      viewed: Boolean(doc?.viewed),
      viewedAt: doc?.viewedAt ?? null,
    });
  } catch (error) {
    console.error("GET /api/view failed:", error);
    return Response.json(
      { error: "Unable to check view status", viewed: false },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const collection = await getViewCollection();
    const now = new Date();

    await collection.updateOne(
      { _id: VIEW_DOC_ID },
      { $setOnInsert: { viewed: false, viewedAt: null } },
      { upsert: true }
    );

    const result = await collection.findOneAndUpdate(
      { _id: VIEW_DOC_ID, viewed: false },
      { $set: { viewed: true, viewedAt: now } },
      { returnDocument: "after" }
    );

    const doc = result?.value ?? result;
    if (doc) {
      return Response.json({
        ok: true,
        alreadyViewed: false,
        viewedAt: doc.viewedAt ?? now,
      });
    }

    return Response.json({ ok: false, alreadyViewed: true });
  } catch (error) {
    console.error("POST /api/view failed:", error);
    return Response.json(
      { error: "Unable to mark as viewed", ok: false },
      { status: 500 }
    );
  }
}
