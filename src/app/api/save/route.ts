import { NextResponse } from "next/server";
import connect from "@/utils/mongo/startMongo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path: userPath, content } = body;

    if (!userPath || !content) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    
    if(!process.env.DATABASE_NAME || !process.env.TEXT_COLLECTION) {
      return NextResponse.json({ error: "Database Connection error" }, { status: 500 });
    }

    const client = await connect;
    const textData = await client.db(process.env.DATABASE_NAME).collection(process.env.TEXT_COLLECTION).findOne(
      { path: userPath }
    );

    if (!textData) {
      const result = await client.db(process.env.DATABASE_NAME).collection(process.env.TEXT_COLLECTION).insertOne({  path: userPath, content, lastModified: new Date().toISOString() });

      if (!result) {
        return NextResponse.json({ error: "Failed to save content 1" }, { status: 500 });
      }

      const savedContent = await client.db(process.env.DATABASE_NAME).collection(process.env.TEXT_COLLECTION).findOne({ _id: result.insertedId });

      if(!savedContent) {
        return NextResponse.json({ error: "Failed to save content 2" }, { status: 500 });
      }

      return NextResponse.json({
        content: savedContent.content,
        lastModified: savedContent.lastModified,
      });
    }

    const result = await client.db(process.env.DATABASE_NAME).collection(process.env.TEXT_COLLECTION).findOneAndUpdate(
      { path: userPath },
      { $set: { content, lastModified: new Date().toISOString() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Failed to save content 3" }, { status: 500 });
    }

    return NextResponse.json({
      content: result.content,
      lastModified: result.lastModified,
    });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json({ error: "Failed to save content 4" }, { status: 500 });
  }
}
