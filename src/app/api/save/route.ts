import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// TODO: Move this to .env
const DATA_DIR = path.join(process.cwd(), "text_data");

async function ensureDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create data directory:", error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path: userPath, content } = body;

    if (!userPath || !content) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await ensureDataDirectory();

    const filePath = path.join(DATA_DIR, `${userPath.replace(/\//g, "_")}.json`);
    await fs.writeFile(filePath, JSON.stringify({ path: userPath, content }, null, 2));

    return NextResponse.json({ message: "Content saved successfully!" });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
