import { NextResponse } from "next/server";
import connect from "@/utils/mongo/startMongo";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userPath = url.searchParams.get("path");

        if (!userPath) {
            return NextResponse.json({ error: "Invalid path input" }, { status: 400 });
        }

        if(!process.env.DATABASE_NAME || !process.env.TEXT_COLLECTION) {
            return NextResponse.json({ error: "Database Connection error" }, { status: 500 });
        }

        try {
            const client = await connect;
            const textData = await client.db(process.env.DATABASE_NAME).collection(process.env.TEXT_COLLECTION).findOne({ path: userPath });

            if (!textData) {
                return NextResponse.json({ 
                    content: "",
                    lastModified: new Date().toISOString(),
                });
            }

            return NextResponse.json({ 
                content: textData.content,
                lastModified: textData.lastModified,
             });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return NextResponse.json({ content: "" });
        }
    } catch (error) {
        console.error("Error loading content:", error);
        return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
    }
}
