import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// TODO: Move this to .env
const DATA_DIR = path.join(process.cwd(), "text_data");

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userPath = url.searchParams.get("path");

        if (!userPath) {
            return NextResponse.json({ error: "Invalid path input" }, { status: 400 });
        }

        const filePath = path.join(DATA_DIR, `${userPath.replace(/[-/]/g, "_")}.json`);

        try {
            const fileContent = await fs.readFile(filePath, "utf-8");
            const { content } = JSON.parse(fileContent);
            return NextResponse.json({ content });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return NextResponse.json({ content: "" });
        }
    } catch (error) {
        console.error("Error loading content:", error);
        return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
    }
}
