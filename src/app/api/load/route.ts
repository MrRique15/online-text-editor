import { NextResponse } from "next/server";
import connect from "@/utils/mongo/startMongo";
import { config } from "@/utils/config";
import { aes_decryptData, sha256_encryptData } from "@/utils/crypto/encription";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userPath = url.searchParams.get("path");

        if (!userPath) {
            return NextResponse.json({ error: "Invalid path input" }, { status: 400 });
        }

        try {
            const encryptedPath = sha256_encryptData(userPath);
            const client = await connect;
            const textData = await client.db(config.mongo_database).collection(config.mongo_text_collection).findOne({ path: encryptedPath });

            if (!textData) {
                return NextResponse.json({ 
                    content: "",
                    lastModified: new Date().toISOString(),
                });
            }

            return NextResponse.json({ 
                content: aes_decryptData(textData.content, userPath),
                lastModified: textData.lastModified.toISOString(),
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
