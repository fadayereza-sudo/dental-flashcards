import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = join(process.cwd(), `data/guidelines/${id}.json`);
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return Response.json(data);
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
