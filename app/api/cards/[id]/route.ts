import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

type PatchBody = {
  folderId?: number;
  question?: string;
  answer?: string;
  source?: string | null;
  image?: string | null;
  reference?: string | null;
  referenceSection?: string | null;
  note?: string | null;
};

function hashContent(question: string, answer: string) {
  return createHash("sha256")
    .update(`${question}\u0000${answer}`)
    .digest("hex");
}

async function loadCard(id: number) {
  const [row] = await db
    .select()
    .from(schema.cards)
    .where(eq(schema.cards.id, id))
    .limit(1);
  return row ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const card = await loadCard(id);
  if (!card) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ card });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const existing = await loadCard(id);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const nextQuestion =
    typeof body.question === "string" ? body.question.trim() : existing.question;
  const nextAnswer =
    typeof body.answer === "string" ? body.answer.trim() : existing.answer;
  if (!nextQuestion || !nextAnswer) {
    return NextResponse.json(
      { error: "question and answer cannot be empty" },
      { status: 400 },
    );
  }

  const nextFolderId = Number.isFinite(body.folderId)
    ? Number(body.folderId)
    : existing.folderId;

  if (nextFolderId !== existing.folderId) {
    const [folder] = await db
      .select({ id: schema.folders.id })
      .from(schema.folders)
      .where(eq(schema.folders.id, nextFolderId))
      .limit(1);
    if (!folder) {
      return NextResponse.json({ error: "folder not found" }, { status: 404 });
    }
  }

  const contentHash = hashContent(nextQuestion, nextAnswer);

  // Duplicate check if content/folder changed
  if (
    contentHash !== existing.contentHash ||
    nextFolderId !== existing.folderId
  ) {
    const dup = await db
      .select({ id: schema.cards.id })
      .from(schema.cards)
      .where(
        and(
          eq(schema.cards.folderId, nextFolderId),
          eq(schema.cards.contentHash, contentHash),
          ne(schema.cards.id, id),
        ),
      )
      .limit(1);
    if (dup.length > 0) {
      return NextResponse.json(
        { error: "duplicate card in target folder" },
        { status: 409 },
      );
    }
  }

  const pickNullable = (v: string | null | undefined, fallback: string | null) =>
    v === undefined ? fallback : typeof v === "string" ? v.trim() || null : null;

  const [updated] = await db
    .update(schema.cards)
    .set({
      folderId: nextFolderId,
      question: nextQuestion,
      answer: nextAnswer,
      source: pickNullable(body.source, existing.source),
      image: pickNullable(body.image, existing.image),
      reference: pickNullable(body.reference, existing.reference),
      referenceSection: pickNullable(
        body.referenceSection,
        existing.referenceSection,
      ),
      note: pickNullable(body.note, existing.note),
      contentHash,
      updatedAt: new Date(),
    })
    .where(eq(schema.cards.id, id))
    .returning();

  return NextResponse.json({ card: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const result = await db
    .delete(schema.cards)
    .where(eq(schema.cards.id, id))
    .returning({ id: schema.cards.id });
  if (result.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
