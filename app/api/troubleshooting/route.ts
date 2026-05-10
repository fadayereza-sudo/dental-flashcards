import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const indexPath = join(process.cwd(), "data/troubleshooting/index.json");
    const content = readFileSync(indexPath, "utf-8");
    const index = JSON.parse(content);
    return Response.json(index);
  } catch {
    return Response.json([]);
  }
}
