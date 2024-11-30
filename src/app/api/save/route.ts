import { NextResponse } from "next/server";
import connect from "@/utils/mongo/startMongo";
import { config } from "@/utils/config";
import { aes_encryptData, aes_decryptData, sha256_encryptData } from "@/utils/crypto/encription";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path: userPath, content } = body;

    if (!userPath || !content) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const encryptedPath = sha256_encryptData(userPath);
    const encryptedContent = aes_encryptData(content);

    const client = await connect;
    const textData = await client.db(config.mongo_database).collection(config.mongo_text_collection).findOne(
      { path: encryptedPath }
    );

    if (!textData) {
      const result = await client.db(config.mongo_database).collection(config.mongo_text_collection).insertOne({  
        path: encryptedPath, 
        content: encryptedContent, 
        lastModified: new Date() 
      });

      if (!result) {
        return NextResponse.json({ error: "Failed to save content 1" }, { status: 500 });
      }

      const savedContent = await client.db(config.mongo_database).collection(config.mongo_text_collection).findOne({ _id: result.insertedId });

      if(!savedContent) {
        return NextResponse.json({ error: "Failed to save content 2" }, { status: 500 });
      }

      return NextResponse.json({
        content: aes_decryptData(savedContent.content),
        lastModified: savedContent.lastModified.toISOString(),
      });
    }

    const result = await client.db(config.mongo_database).collection(config.mongo_text_collection).findOneAndUpdate(
      { path: encryptedPath },
      { $set: { 
          content: encryptedContent, 
          lastModified: new Date() 
        } 
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Failed to save content 3" }, { status: 500 });
    }

    return NextResponse.json({
      content: aes_decryptData(result.content),
      lastModified: result.lastModified,
    });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json({ error: "Failed to save content 4" }, { status: 500 });
  }
}
