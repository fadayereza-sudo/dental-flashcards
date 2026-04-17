import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { emptyState, fromFsrsCard } from "@/lib/fsrs";

export const runtime = "nodejs";

type CreateBody = {
  folderId: number;
  question: string;
  answer: string;
  source?: string | null;
  image?: string | null;
  reference?: string | null;
  referenceSection?: string | null;
};

function hashContent(question: string, answer: string) {
  return createHash("sha256")
    .update(`${question}\u0000${answer}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CreateBody | null;
  if (
    !body ||
    !Number.isFinite(body.folderId) ||
    typeof body.question !== "string" ||
    typeof body.answer !== "string" ||
    !body.question.trim() ||
    !body.answer.trim()
  ) {
    return NextResponse.json(
      { error: "folderId, question, answer are required" },
      { status: 400 },
    );
  }

  const [folder] = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(eq(schema.folders.id, body.folderId))
    .limit(1);

  if (!folder) {
    return NextResponse.json({ error: "folder not found" }, { status: 404 });
  }

  const contentHash = hashContent(body.question, body.answer);

  const existing = await db
    .select({ id: schema.cards.id })
    .from(schema.cards)
    .where(
      and(
        eq(schema.cards.folderId, body.folderId),
        eq(schema.cards.contentHash, contentHash),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "duplicate card in this folder" },
      { status: 409 },
    );
  }

  const [inserted] = await db
    .insert(schema.cards)
    .values({
      folderId: body.folderId,
      question: body.question.trim(),
      answer: body.answer.trim(),
      source: body.source?.trim() || null,
      image: body.image?.trim() || null,
      reference: body.reference?.trim() || null,
      referenceSection: body.referenceSection?.trim() || null,
      contentHash,
    })
    .returning();

  const initial = fromFsrsCard(inserted.id, emptyState());
  await db.insert(schema.cardState).values(initial);

  return NextResponse.json({ card: inserted });
}
